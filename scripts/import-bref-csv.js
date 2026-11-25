#!/usr/bin/env node
// Importa una tabla "Per Game" de Basketball-Reference (CSV) a public/data/seasons/<season>.json
import fs from 'node:fs';
import path from 'node:path';
import { SEASONS_DIR, slugify, buildIndexes } from './build-seasons-index.js';

const HELP = `Uso:
  node scripts/import-bref-csv.js <season> <per_game.csv> [opciones]

Ejemplo:
  node scripts/import-bref-csv.js 2010-11 per_game.csv --wins 57 --losses 25 --coach "Rick Carlisle" --playoff champion

Argumentos:
  <season>      Temporada, formato 2010-11
  <per_game.csv> CSV exportado de Basketball-Reference (Share & Export -> Get table as CSV)

Opciones:
  --wins N --losses N     Record del equipo (si se omiten se conserva el del JSON existente)
  --coach "Nombre"        Entrenador
  --playoff VALOR         champion|finals|conf_finals|second_round|first_round|missed|in_progress
  --note "texto"          Nota corta opcional
  --team DAL              Si el CSV tiene columna Tm/Team, conservar solo ese equipo (por defecto DAL si existe)
  --help                  Muestra esta ayuda

Soporta BOM, campos entre comillas, nombres con acentos, sufijos "*" y "\\id" ("Luka Dončić\\doncilu01"),
cabeceras repetidas y filas "Team Totals". Escribe el JSON y regenera index.json y players-index.json.`;

const PLAYOFF = ['champion', 'finals', 'conf_finals', 'second_round', 'first_round', 'missed', 'in_progress'];

export function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const rows = []; let row = []; let cur = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

const num = (v, d) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().replace('%', '');
  if (s === '' || s === '-') return null;
  const n = Number(s);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : null;
};
const pct = (v) => {
  let n = num(v, 6);
  if (n === null) return null;
  if (n > 1) n /= 100;
  return Number(n.toFixed(3));
};
const int = (v) => { const n = num(v, 0); return n === null ? null : Math.round(n); };

export function cleanName(raw) {
  return String(raw).split('\\')[0].replace(/\*+$/, '').replace(/\s+/g, ' ').trim();
}

export function parsePerGame(text, teamFilter) {
  const rows = parseCSV(text);
  let header = null; const out = [];
  const col = {};
  const idx = (names) => { for (const n of names) if (col[n] !== undefined) return col[n]; return -1; };
  const hasDal = rows.some((r) => r.includes('DAL'));
  for (const r of rows) {
    const first = r.map((x) => x.trim());
    if (first.includes('Player') && (first.includes('PTS') || first.includes('G'))) {
      header = first; Object.keys(col).forEach((k) => delete col[k]);
      header.forEach((h, i) => { if (col[h] === undefined) col[h] = i; });
      continue;
    }
    if (!header) continue;
    const pi = col.Player; const name = cleanName(r[pi] ?? '');
    if (!name || /^(team totals|league average|total)/i.test(name) || name === 'Player') continue;
    const tmIdx = idx(['Tm', 'Team']);
    if (tmIdx >= 0) {
      const tm = (r[tmIdx] || '').trim();
      if (/^(TOT|2TM|3TM|4TM)$/.test(tm)) continue;
      const want = teamFilter || (hasDal ? 'DAL' : null);
      if (want && tm !== want) continue;
    }
    const g = (n) => (col[n] !== undefined ? r[col[n]] : undefined);
    const trb = g('TRB') ?? (g('ORB') !== undefined && g('DRB') !== undefined ? Number(g('ORB')) + Number(g('DRB')) : undefined);
    out.push({
      name, slug: slugify(name), pos: (g('Pos') || '').trim() || null, age: int(g('Age')),
      gp: int(g('G')), gs: int(g('GS')), mpg: num(g('MP'), 1), ppg: num(g('PTS'), 1), rpg: num(trb, 1),
      apg: num(g('AST'), 1), spg: num(g('STL'), 1), bpg: num(g('BLK'), 1),
      fgp: pct(g('FG%')), tpp: pct(g('3P%')), ftp: pct(g('FT%')),
    });
  }
  if (!header) throw new Error('No se encontro la fila de cabecera (Player ... PTS) en el CSV');
  out.sort((a, b) => (b.ppg ?? -1) - (a.ppg ?? -1));
  return out;
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h') || argv.length < 2) { console.log(HELP); return argv.length < 2 && !argv.includes('--help') ? 1 : 0; }
  const pos = []; const opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i]; else pos.push(argv[i]);
  }
  const [season, csvPath] = pos;
  if (!/^\d{4}-\d{2}$/.test(season || '')) { console.error('Temporada invalida (ej. 2010-11)'); return 1; }
  if (opt.playoff && !PLAYOFF.includes(opt.playoff)) { console.error('--playoff debe ser uno de: ' + PLAYOFF.join(', ')); return 1; }
  const players = parsePerGame(fs.readFileSync(csvPath, 'utf8'), opt.team);
  const file = path.join(SEASONS_DIR, `${season}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const res = {
    season,
    wins: opt.wins !== undefined ? Number(opt.wins) : prev.wins ?? null,
    losses: opt.losses !== undefined ? Number(opt.losses) : prev.losses ?? null,
    coach: opt.coach ?? prev.coach ?? null,
    playoff: opt.playoff ?? prev.playoff ?? null,
  };
  const note = opt.note ?? prev.note;
  if (note) res.note = note;
  res.players = players;
  fs.mkdirSync(SEASONS_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(res, null, 1) + '\n');
  const r = buildIndexes();
  console.log(`${season}: ${players.length} jugadores escritos en ${path.relative(process.cwd(), file)}; indices regenerados (${r.seasons} temporadas, ${r.players} jugadores)`);
  return 0;
}

import { pathToFileURL } from 'node:url';
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exit(main(process.argv.slice(2)));
