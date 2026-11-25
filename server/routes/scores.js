import { Router } from 'express';
import { db } from '../db.js';
import { requireUser, rateLimit } from '../auth.js';

const r = Router();
const GAMES = ['tateti', 'guess'];
const postLimit = rateLimit({ name: 'score', windowMs: 60 * 1000, max: 30, byUser: true });

function view(row) {
  let meta = null;
  try { meta = row.meta ? JSON.parse(row.meta) : null; } catch { /* ignore */ }
  return { id: row.id, game: row.game, points: row.points, meta, created_at: row.created_at };
}

r.post('/scores', requireUser, postLimit, (req, res) => {
  const { game, points, meta } = req.body || {};
  if (!GAMES.includes(game)) return res.status(400).json({ error: 'Juego inválido' });
  if (!Number.isInteger(points) || points < 0 || points > 1000) return res.status(400).json({ error: 'Puntos inválidos (0-1000)' });
  let metaStr = null;
  let daily = null;
  if (meta !== undefined && meta !== null) {
    if (typeof meta !== 'object' || Array.isArray(meta)) return res.status(400).json({ error: 'meta debe ser un objeto' });
    metaStr = JSON.stringify(meta);
    if (Buffer.byteLength(metaStr) > 2048) return res.status(400).json({ error: 'meta demasiado grande' });
    if (game === 'guess' && meta.daily === true) {
      if (typeof meta.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) return res.status(400).json({ error: 'meta.date inválida' });
      daily = meta.date;
    }
  }
  if (daily && db.prepare('SELECT 1 FROM scores WHERE user_id = ? AND game = ? AND daily_date = ?').get(req.user.id, game, daily)) {
    return res.status(409).json({ error: 'Ya jugaste el desafío de hoy' });
  }
  let info;
  try {
    info = db.prepare('INSERT INTO scores (user_id, game, points, meta, daily_date) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, game, points, metaStr, daily);
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'Ya jugaste el desafío de hoy' });
    throw e;
  }
  res.status(201).json({ score: view(db.prepare('SELECT * FROM scores WHERE id = ?').get(info.lastInsertRowid)) });
});

r.get('/scores/leaderboard', (req, res) => {
  const g = req.query.game || 'all';
  if (g !== 'all' && !GAMES.includes(g)) return res.status(400).json({ error: 'Juego inválido' });
  const where = g === 'all' ? '' : 'WHERE s.game = ?';
  const rows = db.prepare(`SELECT u.username, SUM(s.points) AS total, MAX(s.points) AS best, COUNT(*) AS plays
    FROM scores s JOIN users u ON u.id = s.user_id ${where}
    GROUP BY u.id ORDER BY total DESC, best DESC, u.username COLLATE NOCASE ASC LIMIT 100`).all(...(g === 'all' ? [] : [g]));
  res.json({ rows: rows.map(x => ({ username: x.username, total: Number(x.total), best: Number(x.best), plays: Number(x.plays) })) });
});

r.get('/scores/me', requireUser, (req, res) => {
  const scores = db.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50').all(req.user.id).map(view);
  const sum = g => Number(db.prepare('SELECT COALESCE(SUM(points), 0) AS n FROM scores WHERE user_id = ? AND game = ?').get(req.user.id, g).n);
  const prode = Number(db.prepare('SELECT COALESCE(SUM(points_awarded), 0) AS n FROM predictions WHERE user_id = ?').get(req.user.id).n);
  res.json({ scores, totals: { tateti: sum('tateti'), guess: sum('guess'), prode } });
});

export default r;
