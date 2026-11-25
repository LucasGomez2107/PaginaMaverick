import { Router } from 'express';
import { db, nowIso, seasonFor, getGame, listGames, scoreGame, getRoster, setRoster, getRosterDetails, kvGet } from '../db.js';
import { requireAdmin } from '../auth.js';
import { syncMavs, syncRoster } from '../espn.js';
import { deleteDemo } from '../seed.js';

const r = Router();
const STATUSES = ['scheduled', 'live', 'final'];

function bad(msg) { const e = new Error(msg); e.status = 400; return e; }

function intOrNull(v, name) {
  if (v === null || v === '' || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 999) throw bad(`${name} inválido`);
  return n;
}

function cleanLeaders(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v !== 'object' || Array.isArray(v)) throw bad('leaders inválido');
  const out = {};
  for (const k of ['points', 'rebounds', 'assists']) {
    const l = v[k];
    if (!l || typeof l !== 'object' || typeof l.player !== 'string' || !l.player.trim()) {
      throw bad(`leaders.${k}.player requerido`);
    }
    const value = l.value === null || l.value === undefined || l.value === '' ? null : Number(l.value);
    if (value !== null && !Number.isFinite(value)) throw bad(`leaders.${k}.value inválido`);
    out[k] = { player: l.player.trim().slice(0, 120), value };
  }
  return out;
}

/** Validate (partial) game input -> column map. */
function gameFields(body, partial) {
  const b = body || {};
  const f = {};
  const has = k => Object.prototype.hasOwnProperty.call(b, k);
  if (has('date') || !partial) {
    const d = new Date(b.date);
    if (!b.date || Number.isNaN(d.getTime())) throw bad('Fecha inválida');
    f.date = d.toISOString();
  }
  if (has('opponent') || !partial) {
    if (typeof b.opponent !== 'string' || !b.opponent.trim() || b.opponent.length > 80) throw bad('Rival inválido');
    f.opponent = b.opponent.trim();
  }
  if (has('opponent_abbr')) {
    if (b.opponent_abbr != null && (typeof b.opponent_abbr !== 'string' || b.opponent_abbr.length > 6)) throw bad('Abreviatura inválida');
    f.opponent_abbr = String(b.opponent_abbr ?? '').trim().toUpperCase();
  } else if (!partial) f.opponent_abbr = '';
  if (has('home') || !partial) f.home = b.home === undefined ? 1 : (b.home === true || b.home === 1 || b.home === 'true' ? 1 : 0);
  if (has('status') || !partial) {
    const s = b.status ?? 'scheduled';
    if (!STATUSES.includes(s)) throw bad('Estado inválido');
    f.status = s;
  }
  if (has('season') || !partial) {
    if (b.season != null && (typeof b.season !== 'string' || !/^\d{4}-\d{2}$/.test(b.season))) throw bad('Temporada inválida');
    f.season = b.season || seasonFor(f.date);
  }
  if (has('mavs_score')) f.mavs_score = intOrNull(b.mavs_score, 'mavs_score');
  if (has('opp_score')) f.opp_score = intOrNull(b.opp_score, 'opp_score');
  if (has('leaders')) f.leaders = (l => (l ? JSON.stringify(l) : null))(cleanLeaders(b.leaders));
  if (has('espn_id')) f.espn_id = b.espn_id == null || b.espn_id === '' ? null : String(b.espn_id);
  return f;
}

r.get('/games', (req, res) => {
  const status = ['scheduled', 'final', 'live', 'all'].includes(req.query.status) ? req.query.status : 'all';
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 500);
  const iso = v => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d.toISOString(); };
  const order = ['asc', 'desc'].includes(req.query.order) ? req.query.order : null;
  res.json({ games: listGames({ status, limit, from: iso(req.query.from), to: iso(req.query.to), order }) });
});

r.get('/games/:id', (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: 'Partido no encontrado' });
  res.json({ game });
});

r.post('/games', requireAdmin, (req, res) => {
  const f = gameFields(req.body, false);
  f.manual = 1;
  const cols = Object.keys(f);
  try {
    const info = db.prepare(`INSERT INTO games (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
      .run(...Object.values(f));
    const id = Number(info.lastInsertRowid);
    scoreGame(id);
    res.status(201).json({ game: getGame(id) });
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'espn_id duplicado' });
    throw e;
  }
});

r.put('/games/:id', requireAdmin, (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: 'Partido no encontrado' });
  const f = gameFields(req.body, true);
  if (f.date && !Object.prototype.hasOwnProperty.call(req.body, 'season')) delete f.season;
  f.manual = 1;
  f.updated_at = nowIso();
  try {
    db.prepare(`UPDATE games SET ${Object.keys(f).map(k => `${k} = ?`).join(', ')} WHERE id = ?`)
      .run(...Object.values(f), game.id);
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'espn_id duplicado' });
    throw e;
  }
  scoreGame(game.id);
  res.json({ game: getGame(game.id) });
});

r.delete('/games/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM games WHERE id = ?').run(Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Partido no encontrado' });
  res.json({ ok: true });
});

r.post('/admin/sync', requireAdmin, async (req, res, next) => {
  try {
    const [result, roster] = await Promise.all([syncMavs(), syncRoster()]);
    res.json(result.ok
      ? { ok: true, imported: result.imported, roster: roster.ok ? roster.players : 0 }
      : { ok: false, imported: result.imported || 0, error: result.error, roster: roster.ok ? roster.players : 0 });
  } catch (e) { next(e); }
});

r.delete('/admin/demo', requireAdmin, (req, res) => {
  res.json({ ok: true, deleted: deleteDemo() });
});

r.get('/roster', (req, res) => {
  const meta = kvGet('roster_meta') || {};
  res.json({ players: getRoster(), details: getRosterDetails(), coach: meta.coach || null, season: meta.season || null,
    source: meta.source || null, updated_at: meta.updated_at || null });
});

r.put('/roster', requireAdmin, (req, res) => {
  const { players } = req.body || {};
  if (!Array.isArray(players) || players.length < 1 || players.length > 40) {
    return res.status(400).json({ error: 'players debe ser una lista de 1 a 40 nombres' });
  }
  const seen = new Set();
  const clean = [];
  for (const p of players) {
    if (typeof p !== 'string' || !p.trim() || p.trim().length > 60) return res.status(400).json({ error: 'Nombre inválido' });
    const k = p.trim().toLowerCase();
    if (!seen.has(k)) { seen.add(k); clean.push(p.trim()); }
  }
  setRoster(clean);
  res.json({ players: getRoster() });
});

export default r;
