// SQLite access (node:sqlite), migrations, shared game helpers and prode scoring.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'mavs.db');
fs.mkdirSync(path.dirname(path.resolve(DB_PATH)), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'es',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  espn_id TEXT UNIQUE,
  season TEXT NOT NULL,
  date TEXT NOT NULL,
  opponent TEXT NOT NULL,
  opponent_abbr TEXT NOT NULL DEFAULT '',
  home INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'scheduled',
  mavs_score INTEGER,
  opp_score INTEGER,
  leaders TEXT,
  manual INTEGER NOT NULL DEFAULT 0,
  demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_comments_game ON comments(game_id);
CREATE TABLE IF NOT EXISTS diary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'es',
  author TEXT NOT NULL,
  demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  winner TEXT NOT NULL,
  top_points TEXT NOT NULL,
  top_rebounds TEXT NOT NULL,
  top_assists TEXT NOT NULL,
  points_awarded INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id, game_id)
);
CREATE INDEX IF NOT EXISTS idx_predictions_game ON predictions(game_id);
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  points INTEGER NOT NULL,
  meta TEXT,
  daily_date TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_daily ON scores(user_id, game, daily_date) WHERE daily_date IS NOT NULL;
CREATE TABLE IF NOT EXISTS roster (
  pos INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS dallas_overrides (
  key TEXT PRIMARY KEY,
  opponent TEXT,
  score INTEGER,
  opp_score INTEGER,
  result TEXT,
  date TEXT,
  home INTEGER,
  demo INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
`);

export const nowIso = () => new Date().toISOString();

/** Run fn inside a transaction. */
export function tx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { try { db.exec('ROLLBACK'); } catch { /* ignore */ } throw e; }
}

/** "2026-11-25T..." -> "2026-27" (NBA season starts in October). */
export function seasonFor(dateIso) {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return '2026-27';
  const y = d.getUTCFullYear();
  const start = d.getUTCMonth() >= 7 ? y : y - 1; // Aug..Dec -> this year
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

function parseJson(s, fallback = null) {
  if (s == null) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}

const GAME_SELECT = `
  SELECT g.*,
    (SELECT COUNT(*) FROM comments c WHERE c.game_id = g.id AND c.deleted = 0) AS comment_count,
    (SELECT d.id FROM diary d WHERE d.game_id = g.id ORDER BY d.created_at DESC LIMIT 1) AS diary_id
  FROM games g`;

export function gameView(row) {
  if (!row) return null;
  return {
    id: row.id,
    espn_id: row.espn_id ?? null,
    season: row.season,
    date: row.date,
    opponent: row.opponent,
    opponent_abbr: row.opponent_abbr,
    home: !!row.home,
    status: row.status,
    mavs_score: row.mavs_score ?? null,
    opp_score: row.opp_score ?? null,
    leaders: parseJson(row.leaders, null),
    comment_count: Number(row.comment_count ?? 0),
    diary_id: row.diary_id ?? null,
    locked: row.status !== 'scheduled' || new Date(row.date).getTime() <= Date.now(),
    demo: !!row.demo,
  };
}

export function getGame(id) {
  return gameView(db.prepare(`${GAME_SELECT} WHERE g.id = ?`).get(Number(id)));
}

export function listGames({ status = 'all', limit = 50, from = null, to = null, order = null } = {}) {
  const where = [];
  const args = [];
  if (['scheduled', 'final', 'live'].includes(status)) { where.push('g.status = ?'); args.push(status); }
  if (from) { where.push('g.date >= ?'); args.push(from); }
  if (to) { where.push('g.date < ?'); args.push(to); }
  const dir = order === 'asc' || order === 'desc' ? order : (status === 'scheduled' ? 'asc' : 'desc');
  let sql = GAME_SELECT;
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ` ORDER BY g.date ${dir.toUpperCase()} LIMIT ?`;
  args.push(limit);
  return db.prepare(sql).all(...args).map(gameView);
}

// ---------- prode scoring ----------
const norm = s => String(s ?? '').trim().toLowerCase();
function leaderSet(leader) {
  if (!leader || leader.player == null) return new Set();
  return new Set(String(leader.player).split('/').map(norm).filter(Boolean));
}

export function scorePrediction(pred, game) {
  let pts = 0;
  let correct = 0;
  if (game.mavs_score != null && game.opp_score != null && game.mavs_score !== game.opp_score) {
    const w = game.mavs_score > game.opp_score ? 'DAL' : 'OPP';
    if (pred.winner === w) { pts += 3; correct++; }
  }
  const L = game.leaders || {};
  for (const [k, field] of [['points', 'top_points'], ['rebounds', 'top_rebounds'], ['assists', 'top_assists']]) {
    if (leaderSet(L[k]).has(norm(pred[field]))) { pts += 2; correct++; }
  }
  if (correct === 4) pts += 3;
  return pts;
}

/** (Re)score all predictions of a game. Idempotent. Returns number of predictions touched. */
export function scoreGame(gameId) {
  const game = getGame(gameId);
  if (!game) return 0;
  const preds = db.prepare('SELECT * FROM predictions WHERE game_id = ?').all(game.id);
  const upd = db.prepare('UPDATE predictions SET points_awarded = ? WHERE id = ?');
  const ready = game.status === 'final' && game.leaders;
  tx(() => { for (const p of preds) upd.run(ready ? scorePrediction(p, game) : null, p.id); });
  return preds.length;
}

// ---------- roster ----------
// Real Dallas roster as listed by ESPN (Nov 2026). Replaced automatically by the ESPN sync.
export const DEFAULT_ROSTER = [
  'Cooper Flagg', 'Kyrie Irving', 'P.J. Washington', 'Naji Marshall', 'Daniel Gafford', 'Dereck Lively II',
  'Max Christie', 'Santi Aldama', 'Zaccharie Risacher', 'Caleb Martin', 'Marcus Sasser', 'Walter Clayton Jr.',
  'Jett Howard', 'Moussa Cisse', 'Morez Johnson Jr.', 'Sergio de Larrea', 'Tarik Biberovic', 'Tobi Lawal',
];
try { db.exec('ALTER TABLE roster ADD COLUMN info TEXT'); } catch { /* column exists */ }
db.exec('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)');
export function kvGet(key) {
  const r = db.prepare('SELECT value FROM kv WHERE key = ?').get(key);
  return r ? parseJson(r.value, null) : null;
}
export function kvSet(key, value) {
  db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, JSON.stringify(value));
}

export function getRoster() {
  return db.prepare('SELECT name FROM roster ORDER BY pos').all().map(r => r.name);
}
/** Full roster: [{name, ...info}] where info comes from ESPN (jersey, position, height, stats...) when available. */
export function getRosterDetails() {
  return db.prepare('SELECT name, info FROM roster ORDER BY pos').all()
    .map(r => ({ ...(parseJson(r.info, {}) || {}), name: r.name }));
}
/** players: array of names or of {name, ...info}. */
export function setRoster(players, { source = 'manual' } = {}) {
  tx(() => {
    db.exec('DELETE FROM roster');
    const ins = db.prepare('INSERT INTO roster (pos, name, info) VALUES (?, ?, ?)');
    players.forEach((p, i) => {
      if (typeof p === 'string') ins.run(i, p, null);
      else { const { name, ...info } = p; ins.run(i, name, JSON.stringify(info)); }
    });
  });
  kvSet('roster_meta', { ...(kvGet('roster_meta') || {}), source, updated_at: nowIso() });
}
if (db.prepare('SELECT COUNT(*) AS n FROM roster').get().n === 0) setRoster(DEFAULT_ROSTER, { source: 'default' });

export function cleanupSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(nowIso());
}
