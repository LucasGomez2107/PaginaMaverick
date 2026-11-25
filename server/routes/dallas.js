import { Router } from 'express';
import { db, nowIso } from '../db.js';
import { requireAdmin } from '../auth.js';
import { getDallas, TEAM_KEYS } from '../espn.js';

const r = Router();
const RESULTS = ['W', 'L', 'T', 'OTL'];

r.get('/dallas', async (req, res, next) => {
  try { res.json({ teams: await getDallas() }); } catch (e) { next(e); }
});

r.put('/dallas/:key', requireAdmin, (req, res) => {
  const key = req.params.key;
  if (!TEAM_KEYS.includes(key)) return res.status(404).json({ error: 'Equipo desconocido' });
  const b = req.body || {};
  const int = (v, n) => {
    if (v === null || v === undefined || v === '') return null;
    const x = Number(v);
    if (!Number.isInteger(x) || x < 0 || x > 999) throw Object.assign(new Error(`${n} inválido`), { status: 400 });
    return x;
  };
  if (typeof b.opponent !== 'string' || !b.opponent.trim() || b.opponent.length > 80) return res.status(400).json({ error: 'Rival requerido' });
  if (b.result != null && b.result !== '' && !RESULTS.includes(b.result)) return res.status(400).json({ error: 'Resultado inválido' });
  const d = b.date ? new Date(b.date) : new Date();
  if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'Fecha inválida' });
  const score = int(b.score, 'score');
  const opp = int(b.opp_score, 'opp_score');
  const home = b.home == null ? null : (b.home === true || b.home === 1 || b.home === 'true' ? 1 : 0);
  db.prepare(`INSERT INTO dallas_overrides (key, opponent, score, opp_score, result, date, home, demo, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    ON CONFLICT(key) DO UPDATE SET opponent = excluded.opponent, score = excluded.score, opp_score = excluded.opp_score,
      result = excluded.result, date = excluded.date, home = excluded.home, demo = 0, updated_at = excluded.updated_at`)
    .run(key, b.opponent.trim(), score, opp, b.result || null, d.toISOString(), home, nowIso());
  getDallas().then(teams => res.json({ team: teams.find(t => t.key === key), teams })).catch(() => res.json({ ok: true }));
});

r.delete('/dallas/:key', requireAdmin, (req, res) => {
  if (!TEAM_KEYS.includes(req.params.key)) return res.status(404).json({ error: 'Equipo desconocido' });
  db.prepare('DELETE FROM dallas_overrides WHERE key = ?').run(req.params.key);
  res.json({ ok: true });
});

export default r;
