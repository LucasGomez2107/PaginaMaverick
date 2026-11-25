import { Router } from 'express';
import { db, getGame } from '../db.js';
import { requireUser, rateLimit } from '../auth.js';

const r = Router();
const postLimit = rateLimit({ name: 'prode', windowMs: 60 * 1000, max: 30, byUser: true });

function view(row) {
  if (!row) return null;
  return {
    game_id: row.game_id,
    winner: row.winner,
    top_points: row.top_points,
    top_rebounds: row.top_rebounds,
    top_assists: row.top_assists,
    points_awarded: row.points_awarded ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

r.get('/prode/leaderboard', (req, res) => {
  const rows = db.prepare(`SELECT u.username,
      COALESCE(SUM(p.points_awarded), 0) AS points,
      COUNT(*) AS predictions,
      SUM(CASE WHEN p.points_awarded = 12 THEN 1 ELSE 0 END) AS exact
    FROM predictions p JOIN users u ON u.id = p.user_id
    GROUP BY u.id
    ORDER BY points DESC, exact DESC, predictions ASC, u.username COLLATE NOCASE ASC
    LIMIT 100`).all();
  res.json({ rows: rows.map(x => ({ username: x.username, points: Number(x.points), predictions: Number(x.predictions), exact: Number(x.exact) })) });
});

r.get('/prode/mine', requireUser, (req, res) => {
  const rows = db.prepare(`SELECT p.* FROM predictions p JOIN games g ON g.id = p.game_id
    WHERE p.user_id = ? ORDER BY g.date DESC`).all(req.user.id);
  res.json({ predictions: rows.map(p => ({ ...view(p), game: getGame(p.game_id) })) });
});

r.get('/prode/games/:id', requireUser, (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: 'Partido no encontrado' });
  const row = db.prepare('SELECT * FROM predictions WHERE user_id = ? AND game_id = ?').get(req.user.id, game.id);
  res.json({ prediction: view(row) });
});

r.post('/prode/games/:id', requireUser, postLimit, (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: 'Partido no encontrado' });
  if (game.locked) return res.status(423).json({ error: 'El partido ya comenzó: pronósticos cerrados' });
  const b = req.body || {};
  if (!['DAL', 'OPP'].includes(b.winner)) return res.status(400).json({ error: 'winner debe ser DAL u OPP' });
  const vals = {};
  for (const k of ['top_points', 'top_rebounds', 'top_assists']) {
    if (typeof b[k] !== 'string' || !b[k].trim() || b[k].length > 60) return res.status(400).json({ error: `${k} requerido` });
    vals[k] = b[k].trim();
  }
  db.prepare(`INSERT INTO predictions (user_id, game_id, winner, top_points, top_rebounds, top_assists)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, game_id) DO UPDATE SET winner = excluded.winner, top_points = excluded.top_points,
      top_rebounds = excluded.top_rebounds, top_assists = excluded.top_assists,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`)
    .run(req.user.id, game.id, b.winner, vals.top_points, vals.top_rebounds, vals.top_assists);
  const row = db.prepare('SELECT * FROM predictions WHERE user_id = ? AND game_id = ?').get(req.user.id, game.id);
  res.json({ prediction: view(row) });
});

export default r;
