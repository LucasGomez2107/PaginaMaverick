// Genera public/data/seasons/<season>.json desde los .txt de data-src/ y regenera los indices.
// Formato: "# temporada|W|L|entrenador|playoff|nota"  y filas
// "Nombre|pos|edad|gp|gs|mpg|ppg|rpg|apg|spg|bpg|fg%|3p%|ft%"  (vacio = null)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEASONS_DIR, slugify, buildIndexes } from '../scripts/build-seasons-index.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const seasons = new Map();
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.txt')).sort()) {
  let cur = null;
  for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('//')) continue;
    if (line.startsWith('#')) {
      const [season, w, l, coach, playoff, note] = line.slice(1).split('|').map((x) => x.trim());
      cur = { season, wins: w === '' ? null : +w, losses: l === '' ? null : +l, coach, playoff, ...(note ? { note } : {}), players: [] };
      seasons.set(season, cur);
      continue;
    }
    const c = line.split('|').map((x) => x.trim());
    const n = (i) => (c[i] === undefined || c[i] === '' ? null : Number(c[i]));
    cur.players.push({
      name: c[0], slug: slugify(c[0]), pos: c[1] || null, age: n(2), gp: n(3), gs: n(4), mpg: n(5), ppg: n(6),
      rpg: n(7), apg: n(8), spg: n(9), bpg: n(10), fgp: n(11), tpp: n(12), ftp: n(13),
    });
  }
}
for (const s of seasons.values()) {
  s.players.sort((a, b) => (b.ppg ?? -1) - (a.ppg ?? -1));
  fs.writeFileSync(path.join(SEASONS_DIR, `${s.season}.json`), JSON.stringify(s, null, 1) + '\n');
}
console.log(seasons.size, 'temporadas;', JSON.stringify(buildIndexes()));
