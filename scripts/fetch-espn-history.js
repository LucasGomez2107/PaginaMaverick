#!/usr/bin/env node
// Rebuilds public/data/seasons/<season>.json with real per-game stats from ESPN.
//
//   node scripts/fetch-espn-history.js            # all seasons
//   node scripts/fetch-espn-history.js 2010-11    # only some seasons
//
// How it works:
//   1. For each season (ESPN has Mavericks box scores from 1991-92 on) it reads the schedule and a sample
//      of box scores to collect every player who appeared for Dallas.
//   2. For each player it reads his career stats from ESPN and keeps the rows of seasons played with Dallas.
//      Career rows also cover the 1980s for players still in the league in the 90s.
//   3. It writes each season file, keeping the team info already there (coach, playoffs, note) and,
//      for seasons ESPN does not fully cover, the players already listed that ESPN didn't return.
// The record (W-L) is recomputed from the schedule when ESPN has the full season.
// Needs network access to site.api.espn.com. Behind an HTTPS proxy run it with NODE_USE_ENV_PROXY=1.
import fs from 'node:fs';
import path from 'node:path';
import { SEASONS_DIR, slugify, buildIndexes } from './build-seasons-index.js';

const API = 'https://site.api.espn.com/apis';
const FIRST_BOX_YEAR = 1992; // ESPN end-year of the first season with box scores (1991-92)
const FULL_FROM = 1995;      // early ESPN schedules are unreliable: seasons before 1994-95 are merged, not replaced
const SAMPLE_EVERY = 2;      // read every 2nd box score (players with very few games may be missed)

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) { console.warn(`  ! ${url}: ${e.message}`); return null; }
      await sleep(800 * (i + 1));
    }
  }
  return null;
}
async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

const seasonName = endYear => `${endYear - 1}-${String(endYear % 100).padStart(2, '0')}`;
const endYearOf = name => Number(name.slice(0, 4)) + 1;
const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const pct = v => { const n = num(v); return n == null ? null : Math.round(n * 10) / 1000; };

async function seasonFromSchedule(endYear) {
  const data = await getJson(`${API}/site/v2/sports/basketball/nba/teams/dal/schedule?season=${endYear}&seasontype=2`);
  const events = (data?.events || []).filter(e => e?.competitions?.[0]?.status?.type?.completed);
  let wins = 0, losses = 0;
  for (const e of events) {
    const me = e.competitions[0].competitors.find(c => c.team?.abbreviation === 'DAL' || c.id === '6');
    if (me) (me.winner ? wins++ : losses++);
  }
  return { events, wins, losses };
}

async function playersFromBoxScores(events) {
  const ids = new Map();
  const sample = events.filter((_, i) => i % SAMPLE_EVERY === 0 || i === events.length - 1);
  await pool(sample, 6, async e => {
    const g = await getJson(`${API}/site/v2/sports/basketball/nba/summary?event=${e.id}`);
    const dal = (g?.boxscore?.players || []).find(t => t.team?.abbreviation === 'DAL' || t.team?.id === '6');
    for (const a of dal?.statistics?.[0]?.athletes || []) if (a.athlete?.id) ids.set(String(a.athlete.id), a.athlete.displayName);
  });
  return ids;
}

const COL = { gp: 'gamesPlayed', gs: 'gamesStarted', mpg: 'avgMinutes', fgp: 'fieldGoalPct', tpp: 'threePointFieldGoalPct',
  ftp: 'freeThrowPct', rpg: 'avgRebounds', apg: 'avgAssists', bpg: 'avgBlocks', spg: 'avgSteals', ppg: 'avgPoints' };

async function careerRows(id, name) {
  const data = await getJson(`${API}/common/v3/sports/basketball/nba/athletes/${id}/stats`);
  const avg = (data?.categories || []).find(c => c.name === 'averages');
  if (!avg) return [];
  const idx = k => avg.names.indexOf(COL[k]);
  return (avg.statistics || [])
    .filter(r => r.teamId === '6' || r.teamSlug === 'dallas-mavericks')
    .map(r => {
      const s = r.stats;
      const row = { name, slug: slugify(name), pos: r.position || null, age: null, espn_id: id };
      for (const k of Object.keys(COL)) {
        const v = s[idx(k)];
        row[k] = ['fgp', 'tpp', 'ftp'].includes(k) ? pct(v) : num(v);
      }
      // ESPN labels some early seasons with the end year only ("1993"): normalise to "1992-93".
      const sn = /^\d{4}$/.test(r.season?.displayName || '') ? seasonName(Number(r.season.displayName)) : r.season?.displayName;
      return { season: sn, row };
    });
}

async function main() {
  const only = process.argv.slice(2).filter(a => /^\d{4}-\d{2}$/.test(a));
  const files = fs.readdirSync(SEASONS_DIR).filter(f => /^\d{4}-\d{2}\.json$/.test(f)).map(f => f.slice(0, 7)).sort();
  const targets = only.length ? files.filter(s => only.includes(s)) : files;
  const lastEnd = Math.max(...files.map(endYearOf));

  console.log('1) Box scores: collecting players per season…');
  const allIds = new Map();
  const records = {};
  const boxSeasons = [];
  for (let y = FIRST_BOX_YEAR; y <= lastEnd; y++) {
    const sn = seasonName(y);
    // Also scan neighbours of requested seasons? No: career rows already give every season for a player.
    if (only.length && !only.includes(sn) && y < lastEnd) continue;
    const { events, wins, losses } = await seasonFromSchedule(y);
    if (!events.length) continue;
    records[sn] = { wins, losses, games: events.length };
    boxSeasons.push(sn);
    const ids = await playersFromBoxScores(events);
    for (const [id, name] of ids) allIds.set(id, name);
    console.log(`   ${sn}: ${events.length} games, ${wins}-${losses}, ${ids.size} players`);
  }

  if (!only.length || only.some(sn => endYearOf(sn) < FULL_FROM)) {
    // Players of the 80s who were still in the league in the early 90s (with any team): find their ESPN ids
    // in a sample of league-wide box scores, then their career rows give their Dallas seasons.
    console.log('1b) League-wide box scores 1991-94 (players of the 80s)…');
    const dates = [];
    for (const y of [1992, 1993, 1994]) {
      for (let d = new Date(Date.UTC(y - 1, 10, 10)); d < new Date(Date.UTC(y, 3, 15)); d.setUTCDate(d.getUTCDate() + 12)) {
        dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
      }
    }
    const eventIds = new Set();
    await pool(dates, 6, async day => {
      const sb = await getJson(`${API}/site/v2/sports/basketball/nba/scoreboard?dates=${day}`);
      for (const e of sb?.events || []) eventIds.add(e.id);
    });
    const before = allIds.size;
    await pool([...eventIds], 6, async id => {
      const g = await getJson(`${API}/site/v2/sports/basketball/nba/summary?event=${id}`);
      for (const team of g?.boxscore?.players || []) {
        for (const a of team.statistics?.[0]?.athletes || []) if (a.athlete?.id) allIds.set(String(a.athlete.id), a.athlete.displayName);
      }
    });
    console.log(`   ${eventIds.size} games, ${allIds.size - before} extra players`);
  }

  console.log(`2) Career stats for ${allIds.size} players…`);
  const bySeason = {};
  await pool([...allIds], 6, async ([id, name]) => {
    for (const { season, row } of await careerRows(id, name)) (bySeason[season] ||= []).push(row);
  });

  console.log('3) Writing season files…');
  for (const sn of targets) {
    const file = path.join(SEASONS_DIR, `${sn}.json`);
    const cur = JSON.parse(fs.readFileSync(file, 'utf8'));
    const fresh = bySeason[sn] || [];
    if (!fresh.length) { console.log(`   ${sn}: no ESPN data, kept as is`); continue; }
    const oldBySlug = new Map((cur.players || []).map(p => [p.slug, p]));
    const players = fresh.map(p => ({ ...p, age: oldBySlug.get(p.slug)?.age ?? null }));
    const fullSeason = boxSeasons.includes(sn) && endYearOf(sn) >= FULL_FROM;
    if (!fullSeason) {
      // Partial coverage (before 1991-92): keep the players we already had that ESPN didn't return.
      const have = new Set(players.map(p => p.slug));
      for (const p of cur.players || []) if (!have.has(p.slug)) players.push(p);
    }
    players.sort((a, b) => (b.ppg ?? -1) - (a.ppg ?? -1));
    const rec = records[sn];
    const out = { ...cur, players };
    // ESPN schedules sometimes contain extra/duplicated games, so finished seasons keep their stored record.
    if (cur.playoff === 'in_progress' && rec) { out.wins = rec.wins; out.losses = rec.losses; }
    if (fullSeason && out.note === 'datos parciales') delete out.note;
    out.source = fullSeason ? 'espn' : 'espn-partial';
    fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
    console.log(`   ${sn}: ${players.length} players (${fullSeason ? 'full' : 'partial'})`);
  }
  buildIndexes();
  console.log('Done. Indexes rebuilt.');
}

main().catch(e => { console.error(e); process.exit(1); });
