// ESPN public API: Dallas teams' last results + Mavericks schedule sync.
// The API may be unreachable: every function here is defensive and never throws to callers.
import { db, nowIso, seasonFor, scoreGame, setRoster, kvGet, kvSet } from './db.js';
import { deleteDemo } from './seed.js';

const BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const TIMEOUT_MS = 8000;
const CACHE_MS = 30 * 60 * 1000;
const FAIL_CACHE_MS = 5 * 60 * 1000;

export const TEAMS = [
  { key: 'mavericks', name: 'Dallas Mavericks', league: 'NBA', sport: 'basketball', lg: 'nba', id: '6', abbr: 'dal' },
  { key: 'cowboys', name: 'Dallas Cowboys', league: 'NFL', sport: 'football', lg: 'nfl', id: '6', abbr: 'dal' },
  { key: 'stars', name: 'Dallas Stars', league: 'NHL', sport: 'hockey', lg: 'nhl', id: '25', abbr: 'dal' },
  { key: 'rangers', name: 'Texas Rangers', league: 'MLB', sport: 'baseball', lg: 'mlb', id: '13', abbr: 'tex' },
  { key: 'fcdallas', name: 'FC Dallas', league: 'MLS', sport: 'soccer', lg: 'usa.1', id: '185', abbr: 'dal' },
  { key: 'wings', name: 'Dallas Wings', league: 'WNBA', sport: 'basketball', lg: 'wnba', id: '3', abbr: 'dal' },
];
export const TEAM_KEYS = TEAMS.map(t => t.key);

const cache = new Map(); // url -> { until, data }
let warned = false;
function warnOnce(msg) {
  if (warned) return;
  warned = true;
  console.warn(`[espn] ${msg} (ESPN unavailable; falling back to DB data. Further errors are silenced.)`);
}

async function fetchJson(url, { useCache = true } = {}) {
  const hit = cache.get(url);
  if (useCache && hit && hit.until > Date.now()) {
    if (hit.error) throw new Error(hit.error);
    return hit.data;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache.set(url, { until: Date.now() + CACHE_MS, data });
    return data;
  } catch (e) {
    const msg = e?.name === 'AbortError' ? 'timeout' : (e?.message || String(e));
    cache.set(url, { until: Date.now() + FAIL_CACHE_MS, error: msg });
    warnOnce(`${url}: ${msg}`);
    throw new Error(msg);
  } finally {
    clearTimeout(timer);
  }
}

// ---------- parsing helpers ----------
function num(score) {
  if (score == null) return null;
  if (typeof score === 'object') {
    const v = score.value ?? score.displayValue;
    return v == null ? null : num(v);
  }
  const n = Number(String(score).trim());
  return Number.isFinite(n) ? Math.round(n) : null;
}

function isOurs(comp, team) {
  const t = comp?.team || {};
  return String(t.id) === String(team.id) || String(t.abbreviation || '').toLowerCase() === team.abbr;
}

function eventStatus(ev) {
  const st = ev?.competitions?.[0]?.status?.type || ev?.status?.type || {};
  if (st.completed) return 'final';
  if (st.state === 'in') return 'live';
  if (st.state === 'post') return 'final';
  return 'scheduled';
}

function parseEvent(ev, team) {
  const comp = ev?.competitions?.[0];
  if (!comp || !Array.isArray(comp.competitors)) return null;
  const us = comp.competitors.find(c => isOurs(c, team));
  const them = comp.competitors.find(c => c !== us);
  if (!us || !them) return null;
  const score = num(us.score);
  const oppScore = num(them.score);
  const status = comp.status || ev.status || {};
  let result = null;
  if (eventStatus(ev) === 'final' && score != null && oppScore != null) {
    if (score > oppScore) result = 'W';
    else if (score === oppScore) result = 'T';
    else {
      result = 'L';
      if (team.lg === 'nhl') {
        const detail = `${status.type?.detail || ''} ${status.type?.shortDetail || ''}`;
        if ((status.period ?? 0) > 3 || /\b(OT|SO)\b/i.test(detail)) result = 'OTL';
      }
    }
  }
  return {
    espn_id: String(ev.id),
    date: new Date(ev.date || comp.date).toISOString(),
    seasonYear: ev.season?.year ?? null,
    status: eventStatus(ev),
    opponent: them.team?.displayName || them.team?.name || them.team?.abbreviation || '?',
    opponent_abbr: String(them.team?.abbreviation || '').toUpperCase(),
    home: us.homeAway === 'home',
    score, opp_score: oppScore, result,
  };
}

function scheduleUrl(team, query = '') {
  return `${BASE}/${team.sport}/${team.lg}/teams/${team.id}/schedule${query}`;
}

async function lastResult(team) {
  const urls = [scheduleUrl(team), `${BASE}/${team.sport}/${team.lg}/teams/${team.abbr}/schedule`];
  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      const events = (data?.events || [])
        .filter(ev => ev?.competitions?.[0]?.status?.type?.completed)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      for (const ev of events) {
        const p = parseEvent(ev, team);
        if (p && p.result) return p;
      }
      return null;
    } catch { /* try next */ }
  }
  return null;
}

// ---------- Dallas teams ----------
let dallasInflight = null;

export async function getDallas() {
  if (dallasInflight) return dallasInflight;
  dallasInflight = (async () => {
    const espn = await Promise.all(TEAMS.map(t => lastResult(t).catch(() => null)));
    const overrides = new Map(db.prepare('SELECT * FROM dallas_overrides').all().map(r => [r.key, r]));
    return TEAMS.map((team, i) => {
      const e = espn[i];
      const o = overrides.get(team.key);
      const base = { key: team.key, name: team.name, league: team.league };
      const manual = o && {
        ...base, opponent: o.opponent, score: o.score, opp_score: o.opp_score, result: o.result,
        date: o.date, home: o.home == null ? null : !!o.home, source: 'manual',
      };
      const fromEspn = e && {
        ...base, opponent: e.opponent, score: e.score, opp_score: e.opp_score, result: e.result,
        date: e.date, home: e.home, source: 'espn',
      };
      if (manual && (!fromEspn || new Date(o.date || 0) >= new Date(e.date))) return manual;
      if (fromEspn) return fromEspn;
      return { ...base, opponent: null, score: null, opp_score: null, result: null, date: null, home: null, source: null };
    });
  })();
  try { return await dallasInflight; } finally { dallasInflight = null; }
}

// ---------- Mavericks games sync ----------
const MAVS = TEAMS[0];

function statIndex(labels, ...names) {
  const L = (labels || []).map(s => String(s).toLowerCase());
  for (const n of names) { const i = L.indexOf(n); if (i >= 0) return i; }
  return -1;
}

function pickLeader(entries) {
  // entries: [{player, value}]
  const valid = entries.filter(e => e.value != null && Number.isFinite(e.value));
  if (!valid.length) return null;
  const max = Math.max(...valid.map(e => e.value));
  const tied = valid.filter(e => e.value === max).map(e => e.player);
  return { player: tied.join(' / '), value: max };
}

export function leadersFromSummary(data) {
  const isMavs = t => String(t?.id) === MAVS.id || String(t?.abbreviation || '').toLowerCase() === MAVS.abbr;
  // 1) boxscore.players
  const teamBox = (data?.boxscore?.players || []).find(p => isMavs(p.team));
  if (teamBox) {
    const rows = { points: [], rebounds: [], assists: [] };
    for (const st of teamBox.statistics || []) {
      const labels = st.keys?.length ? st.keys : (st.names || st.labels);
      const alt = st.labels || st.names;
      const idx = {
        points: Math.max(statIndex(labels, 'points', 'pts'), statIndex(alt, 'pts', 'points')),
        rebounds: Math.max(statIndex(labels, 'rebounds', 'reb', 'totalrebounds'), statIndex(alt, 'reb', 'rebounds')),
        assists: Math.max(statIndex(labels, 'assists', 'ast'), statIndex(alt, 'ast', 'assists')),
      };
      for (const a of st.athletes || []) {
        if (a.didNotPlay || !Array.isArray(a.stats) || !a.stats.length) continue;
        const player = a.athlete?.displayName || a.athlete?.shortName;
        if (!player) continue;
        for (const k of Object.keys(rows)) {
          if (idx[k] >= 0) rows[k].push({ player, value: num(a.stats[idx[k]]) });
        }
      }
    }
    const res = { points: pickLeader(rows.points), rebounds: pickLeader(rows.rebounds), assists: pickLeader(rows.assists) };
    if (res.points && res.rebounds && res.assists) return res;
  }
  // 2) leaders section
  const tl = (data?.leaders || []).find(l => isMavs(l.team));
  if (tl) {
    const res = {};
    for (const k of ['points', 'rebounds', 'assists']) {
      const cat = (tl.leaders || []).find(c => String(c.name).toLowerCase() === k);
      const top = (cat?.leaders || []).map(x => ({ player: x.athlete?.displayName, value: num(x.value ?? x.displayValue) }))
        .filter(x => x.player);
      res[k] = pickLeader(top);
    }
    if (res.points && res.rebounds && res.assists) return res;
  }
  return null;
}

let syncing = null;
export function syncMavs() {
  if (syncing) return syncing;
  syncing = doSync().finally(() => { syncing = null; });
  return syncing;
}

async function doSync() {
  const byId = new Map();
  let lastErr = null;
  for (const q of ['?seasontype=2', '']) {
    try {
      const data = await fetchJson(scheduleUrl(MAVS, q), { useCache: false });
      for (const ev of data?.events || []) if (ev?.id) byId.set(String(ev.id), ev);
    } catch (e) { lastErr = e.message; }
  }
  if (!byId.size) return { ok: false, imported: 0, error: lastErr || 'no events' };
  // Real data arrived: the demo rows (fake games, diary entry, Dallas results) would only confuse users.
  if (db.prepare('SELECT COUNT(*) AS n FROM games WHERE demo = 1').get().n > 0) {
    const removed = deleteDemo();
    console.log(`[espn] real schedule found, demo data removed (${removed.games} games)`);
  }

  let imported = 0;
  const findStmt = db.prepare('SELECT * FROM games WHERE espn_id = ?');
  const insStmt = db.prepare(`INSERT INTO games (espn_id, season, date, opponent, opponent_abbr, home, status, mavs_score, opp_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const toLeaders = [];

  for (const ev of byId.values()) {
    const p = parseEvent(ev, MAVS);
    if (!p) continue;
    const season = p.seasonYear ? `${p.seasonYear - 1}-${String(p.seasonYear % 100).padStart(2, '0')}` : seasonFor(p.date);
    const mavs = p.status === 'scheduled' ? null : p.score;
    const opp = p.status === 'scheduled' ? null : p.opp_score;
    const row = findStmt.get(p.espn_id);
    if (!row) {
      const r = insStmt.run(p.espn_id, season, p.date, p.opponent, p.opponent_abbr, p.home ? 1 : 0, p.status, mavs, opp);
      imported++;
      if (p.status === 'final') toLeaders.push({ id: Number(r.lastInsertRowid), espn_id: p.espn_id });
      continue;
    }
    const next = { season, date: p.date, opponent: p.opponent, opponent_abbr: p.opponent_abbr, home: p.home ? 1 : 0,
      status: p.status, mavs_score: mavs, opp_score: opp };
    const changes = {};
    for (const [k, v] of Object.entries(next)) {
      if (v == null) continue; // ESPN never clears data
      // Admin-edited games: only fill empty fields (and let status advance from "scheduled").
      if (row.manual && row[k] != null && !(k === 'status' && row.status === 'scheduled')) continue;
      if (row[k] !== v) changes[k] = v;
    }
    if (Object.keys(changes).length) {
      const sets = Object.keys(changes).map(k => `${k} = ?`).join(', ');
      db.prepare(`UPDATE games SET ${sets}, updated_at = ? WHERE id = ?`).run(...Object.values(changes), nowIso(), row.id);
      imported++;
    }
    const status = changes.status ?? row.status;
    if (status === 'final' && !row.leaders) toLeaders.push({ id: row.id, espn_id: p.espn_id });
    else if (status === 'final' && Object.keys(changes).length) scoreGame(row.id);
  }

  for (const g of toLeaders.slice(0, 40)) {
    try {
      const data = await fetchJson(`${BASE}/basketball/nba/summary?event=${encodeURIComponent(g.espn_id)}`);
      const leaders = leadersFromSummary(data);
      if (leaders) {
        db.prepare('UPDATE games SET leaders = ?, updated_at = ? WHERE id = ? AND leaders IS NULL')
          .run(JSON.stringify(leaders), nowIso(), g.id);
      }
    } catch { /* ignore */ }
    scoreGame(g.id);
  }
  return { ok: true, imported };
}

// ---------- roster (players + current-season averages) ----------
const ATHLETE_URL = id => `https://site.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${encodeURIComponent(id)}/overview`;
const numOrNull = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

function seasonAverages(overview) {
  const st = overview?.statistics;
  const split = (st?.splits || []).find(x => /regular season/i.test(x.displayName || '')) || st?.splits?.[0];
  if (!st || !split || !Array.isArray(split.stats)) return null;
  const at = name => { const i = (st.names || []).indexOf(name); return i < 0 ? null : numOrNull(split.stats[i]); };
  const pct = name => { const v = at(name); return v == null ? null : Math.round(v * 10) / 1000; };
  return {
    gp: at('gamesPlayed'), mpg: at('avgMinutes'), ppg: at('avgPoints'), rpg: at('avgRebounds'), apg: at('avgAssists'),
    spg: at('avgSteals'), bpg: at('avgBlocks'), fgp: pct('fieldGoalPct'), tpp: pct('threePointPct'), ftp: pct('freeThrowPct'),
  };
}

function athleteInfo(a) {
  const inj = (a.injuries || [])[0];
  const heightIn = numOrNull(a.height);
  const weightLb = numOrNull(a.weight);
  return {
    name: a.displayName || a.fullName,
    espn_id: String(a.id),
    jersey: a.jersey ?? null,
    position: a.position?.abbreviation || null,
    position_name: a.position?.displayName || null,
    height_cm: heightIn ? Math.round(heightIn * 2.54) : null,
    weight_kg: weightLb ? Math.round(weightLb * 0.4536) : null,
    age: a.age ?? null,
    birth_date: a.dateOfBirth || null,
    country: a.birthPlace?.country || null,
    city: a.birthPlace?.city || null,
    college: a.college?.name || null,
    experience: a.experience?.years ?? null,
    injury: inj ? { status: inj.status || null, detail: inj.details?.type || inj.shortComment || null } : null,
    stats: null,
  };
}

let rosterSyncing = null;
export function syncRoster() {
  if (rosterSyncing) return rosterSyncing;
  rosterSyncing = doRosterSync().catch(e => ({ ok: false, error: e.message })).finally(() => { rosterSyncing = null; });
  return rosterSyncing;
}

async function doRosterSync() {
  let data;
  try { data = await fetchJson(`${BASE}/basketball/nba/teams/${MAVS.abbr}/roster`, { useCache: false }); }
  catch (e) { return { ok: false, error: e.message }; }
  const athletes = Array.isArray(data?.athletes) ? data.athletes : [];
  if (athletes.length < 8) return { ok: false, error: 'roster vacío' };
  const players = athletes.map(athleteInfo).filter(p => p.name);
  // Current-season averages, a few requests at a time.
  for (let i = 0; i < players.length; i += 4) {
    await Promise.all(players.slice(i, i + 4).map(async p => {
      try { p.stats = seasonAverages(await fetchJson(ATHLETE_URL(p.espn_id), { useCache: false })); } catch { /* keep null */ }
    }));
  }
  players.sort((a, b) => (b.stats?.ppg ?? -1) - (a.stats?.ppg ?? -1));
  const c = (data.coach || [])[0];
  const coach = c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : null;
  setRoster(players, { source: 'espn' });
  kvSet('roster_meta', { ...(kvGet('roster_meta') || {}), coach, season: data.season?.displayName || null });
  return { ok: true, players: players.length };
}

export function startSyncLoop() {
  if (process.env.ESPN_SYNC === '0') return;
  const run = () => syncMavs().then(r => {
    if (r.ok) console.log(`[espn] sync ok, ${r.imported} game(s) imported/updated`);
  }).catch(() => {});
  const runRoster = () => syncRoster().then(r => {
    if (r.ok) console.log(`[espn] roster ok, ${r.players} player(s)`);
  }).catch(() => {});
  setTimeout(() => { run(); runRoster(); }, 1000).unref();
  setInterval(() => { run(); runRoster(); }, CACHE_MS).unref();
}
