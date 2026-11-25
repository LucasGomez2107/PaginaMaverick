#!/usr/bin/env node
// Regenera public/data/seasons/index.json y players-index.json a partir de los <season>.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SEASONS_DIR = path.resolve(__dirname, '..', 'public', 'data', 'seasons');

export function slugify(name) {
  return String(name)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildIndexes(dir = SEASONS_DIR) {
  const files = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
  const index = [];
  const players = {};
  for (const f of files) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const entry = {
      season: s.season, wins: s.wins ?? null, losses: s.losses ?? null,
      coach: s.coach ?? null, playoff: s.playoff ?? null,
    };
    if (s.note) entry.note = s.note;
    index.push(entry);
    for (const p of s.players || []) {
      const slug = p.slug || slugify(p.name);
      const rec = (players[slug] ||= { name: p.name, seasons: [] });
      if (!rec.seasons.includes(s.season)) rec.seasons.push(s.season);
    }
  }
  index.sort((a, b) => (a.season < b.season ? 1 : -1));
  for (const r of Object.values(players)) r.seasons.sort();
  const sortedPlayers = Object.fromEntries(Object.entries(players).sort(([a], [b]) => (a < b ? -1 : 1)));
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'players-index.json'), JSON.stringify(sortedPlayers, null, 1) + '\n');
  return { seasons: index.length, players: Object.keys(sortedPlayers).length };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Uso: node scripts/build-seasons-index.js\nRegenera index.json y players-index.json desde public/data/seasons/<temporada>.json');
  } else {
    const r = buildIndexes();
    console.log(`index.json: ${r.seasons} temporadas; players-index.json: ${r.players} jugadores`);
  }
}
