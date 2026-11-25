import { el, t, registerStrings, loadCSS, fmtNum, api } from '../core.js';

registerStrings({
  es: {
    'stats.title': 'Estadísticas', 'stats.kicker': 'Archivo histórico', 'stats.h1': 'Estadísticas de los Mavs',
    'stats.all': 'Todas', 'stats.record': 'Récord', 'stats.coach': 'Entrenador', 'stats.playoff': 'Playoffs',
    'stats.noSeasons': 'No se pudo cargar el listado de temporadas.', 'stats.noSeason': 'No hay datos para la temporada {season}.',
    'stats.filter': 'Filtrar jugador…', 'stats.backAll': '← Todas las temporadas', 'stats.backSeason': '← Temporada {season}',
    'stats.pos': 'Pos', 'stats.age': 'Edad', 'stats.gp': 'PJ', 'stats.gs': 'TI', 'stats.mpg': 'MIN', 'stats.ppg': 'PTS',
    'stats.rpg': 'REB', 'stats.apg': 'AST', 'stats.spg': 'ROB', 'stats.bpg': 'TAP', 'stats.fgp': 'TC%', 'stats.tpp': '3P%', 'stats.ftp': 'TL%',
    'stats.perGame': 'Promedios por partido', 'stats.sortHint': 'Tocá una columna para ordenar',
    'stats.career': 'Con los Mavs', 'stats.careerAvg': 'Promedio ponderado con Dallas', 'stats.seasons': 'temporadas',
    'stats.ppgTrend': 'Puntos por partido por temporada', 'stats.noPlayer': 'No encontramos a este jugador.',
    'stats.footnote': 'Datos: ESPN. La temporada en curso se actualiza sola; antes de 1994-95 algunos jugadores aparecen sin números.',
    'stats.po.champion': 'Campeón', 'stats.po.finals': 'Finales', 'stats.po.conf_finals': 'Final de conferencia',
    'stats.po.second_round': 'Segunda ronda', 'stats.po.first_round': 'Primera ronda', 'stats.po.missed': 'Sin playoffs', 'stats.po.in_progress': 'En curso',
    'stats.games': 'PJ', 'stats.team': 'Equipo', 'stats.players': 'Jugadores', 'stats.wpct': 'Efectividad',
  },
  en: {
    'stats.title': 'Stats', 'stats.kicker': 'Historical archive', 'stats.h1': 'Mavs Stats',
    'stats.all': 'All', 'stats.record': 'Record', 'stats.coach': 'Coach', 'stats.playoff': 'Playoffs',
    'stats.noSeasons': 'Could not load the season list.', 'stats.noSeason': 'No data for season {season}.',
    'stats.filter': 'Filter player…', 'stats.backAll': '← All seasons', 'stats.backSeason': '← Season {season}',
    'stats.pos': 'Pos', 'stats.age': 'Age', 'stats.gp': 'GP', 'stats.gs': 'GS', 'stats.mpg': 'MPG', 'stats.ppg': 'PPG',
    'stats.rpg': 'RPG', 'stats.apg': 'APG', 'stats.spg': 'SPG', 'stats.bpg': 'BPG', 'stats.fgp': 'FG%', 'stats.tpp': '3P%', 'stats.ftp': 'FT%',
    'stats.perGame': 'Per-game averages', 'stats.sortHint': 'Tap a column to sort',
    'stats.career': 'With the Mavs', 'stats.careerAvg': 'Games-weighted average with Dallas', 'stats.seasons': 'seasons',
    'stats.ppgTrend': 'Points per game by season', 'stats.noPlayer': 'We could not find this player.',
    'stats.footnote': 'Data: ESPN. The current season updates automatically; before 1994-95 some players have no numbers.',
    'stats.po.champion': 'Champions', 'stats.po.finals': 'Finals', 'stats.po.conf_finals': 'Conference finals',
    'stats.po.second_round': 'Second round', 'stats.po.first_round': 'First round', 'stats.po.missed': 'Missed playoffs', 'stats.po.in_progress': 'In progress',
    'stats.games': 'GP', 'stats.team': 'Team', 'stats.players': 'Players', 'stats.wpct': 'Win %',
  },
  pt: {
    'stats.title': 'Estatísticas', 'stats.kicker': 'Arquivo histórico', 'stats.h1': 'Estatísticas dos Mavs',
    'stats.all': 'Todas', 'stats.record': 'Campanha', 'stats.coach': 'Técnico', 'stats.playoff': 'Playoffs',
    'stats.noSeasons': 'Não foi possível carregar a lista de temporadas.', 'stats.noSeason': 'Sem dados para a temporada {season}.',
    'stats.filter': 'Filtrar jogador…', 'stats.backAll': '← Todas as temporadas', 'stats.backSeason': '← Temporada {season}',
    'stats.pos': 'Pos', 'stats.age': 'Idade', 'stats.gp': 'J', 'stats.gs': 'TI', 'stats.mpg': 'MIN', 'stats.ppg': 'PTS',
    'stats.rpg': 'REB', 'stats.apg': 'AST', 'stats.spg': 'ROU', 'stats.bpg': 'TOC', 'stats.fgp': 'FG%', 'stats.tpp': '3P%', 'stats.ftp': 'LL%',
    'stats.perGame': 'Médias por jogo', 'stats.sortHint': 'Toque numa coluna para ordenar',
    'stats.career': 'Com os Mavs', 'stats.careerAvg': 'Média ponderada por jogos com Dallas', 'stats.seasons': 'temporadas',
    'stats.ppgTrend': 'Pontos por jogo por temporada', 'stats.noPlayer': 'Não encontramos este jogador.',
    'stats.footnote': 'Dados: ESPN. A temporada atual se atualiza sozinha; antes de 1994-95 alguns jogadores aparecem sem números.',
    'stats.po.champion': 'Campeão', 'stats.po.finals': 'Finais', 'stats.po.conf_finals': 'Final de conferência',
    'stats.po.second_round': 'Segunda rodada', 'stats.po.first_round': 'Primeira rodada', 'stats.po.missed': 'Sem playoffs', 'stats.po.in_progress': 'Em andamento',
    'stats.games': 'J', 'stats.team': 'Time', 'stats.players': 'Jogadores', 'stats.wpct': 'Aproveit.',
  },
});

const COLS = ['gp', 'gs', 'mpg', 'ppg', 'rpg', 'apg', 'spg', 'bpg', 'fgp', 'tpp', 'ftp'];
const PCT = new Set(['fgp', 'tpp', 'ftp']);
const INT = new Set(['gp', 'gs']);

async function getJSON(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

const fmtCell = (k, v) => {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (INT.has(k)) return String(Math.round(v));
  if (PCT.has(k)) return fmtNum(v * 100, 1);
  return fmtNum(v, 1);
};

const startYear = s => parseInt(String(s).slice(0, 4), 10);
const wpct = s => (s.wins + s.losses) ? s.wins / (s.wins + s.losses) : 0;

function poBadge(po) {
  if (!po) return null;
  const cls = po === 'champion' ? 'st-po st-po-champ' : po === 'finals' ? 'st-po st-po-finals' : po === 'missed' ? 'st-po st-po-missed' : 'st-po';
  return el('span', { class: `badge ${cls}` }, po === 'champion' ? ['★ ', t('stats.po.champion')] : t(`stats.po.${po}`));
}

function footnote() { return el('p', { class: 'muted st-foot' }, t('stats.footnote')); }

function seasonRow(s) {
  const pct = wpct(s);
  return el('a', { class: `st-row ${s.playoff === 'champion' ? 'is-champ' : ''}`, href: `#/stats/${s.season}` },
    el('span', { class: 'st-row-season' }, s.season),
    el('span', { class: 'st-row-rec num' }, `${s.wins}-${s.losses}`),
    el('span', { class: 'st-bar', title: `${Math.round(pct * 100)}%` },
      el('i', { style: { width: `${Math.round(pct * 100)}%` } })),
    el('span', { class: 'st-row-coach muted' }, s.coach || ''),
    el('span', { class: 'st-row-po' }, poBadge(s.playoff)),
    s.note ? el('span', { class: 'st-row-note muted' }, s.note) : null,
  );
}

async function renderOverview(container) {
  const wrap = el('div', { class: 'stats-page stack' });
  container.append(wrap);
  wrap.append(el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, t('stats.kicker')), el('h1', {}, t('stats.h1'))));
  const body = el('div', { class: 'stack' }, el('div', { class: 'spinner' }));
  wrap.append(body);
  const seasons = await getJSON('/data/seasons/index.json');
  // The season in progress gets its live record (synced games) instead of the static one.
  if (Array.isArray(seasons)) for (const s of seasons) if (s.playoff === 'in_progress') await mergeLiveSeason(s);
  body.replaceChildren();
  if (!Array.isArray(seasons) || !seasons.length) {
    body.append(el('div', { class: 'empty' }, t('stats.noSeasons')));
    wrap.append(footnote());
    return;
  }
  const decades = [...new Set(seasons.map(s => Math.floor(startYear(s.season) / 10) * 10))].sort((a, b) => b - a);
  let active = 'all';
  const chips = el('div', { class: 'row st-chips' });
  const list = el('div', { class: 'st-list card' });
  const draw = () => {
    chips.replaceChildren(
      el('button', { class: `chip ${active === 'all' ? 'active' : ''}`, onclick: () => { active = 'all'; draw(); } }, t('stats.all')),
      ...decades.map(d => el('button', { class: `chip ${active === d ? 'active' : ''}`, onclick: () => { active = d; draw(); } }, `${d}s`)),
    );
    list.replaceChildren(
      el('div', { class: 'st-row st-row-head' },
        el('span', {}, t('common.season')), el('span', {}, t('stats.record')), el('span', {}, t('stats.wpct')),
        el('span', {}, t('stats.coach')), el('span', {}, t('stats.playoff'))),
      ...seasons.filter(s => active === 'all' || Math.floor(startYear(s.season) / 10) * 10 === active).map(seasonRow));
  };
  draw();
  body.append(chips, list);
  wrap.append(footnote());
}

// Season in progress: players, averages and coach come live from the server (ESPN roster sync),
// and the record is counted from the synced games.
async function mergeLiveSeason(data) {
  try {
    const r = await api('/roster');
    const live = (r.details || []).filter(p => p.stats);
    if (live.length) {
      data.players = live.map(p => ({
        name: p.name, slug: p.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), pos: p.position, age: p.age, gs: null, ...p.stats,
      }));
    }
    if (r.coach) data.coach = r.coach;
  } catch { /* keep static file */ }
  try {
    const { games } = await api('/games?status=final&limit=120');
    const mine = games.filter(g => g.season === data.season && !g.demo && g.mavs_score != null);
    if (mine.length) {
      data.wins = mine.filter(g => g.mavs_score > g.opp_score).length;
      data.losses = mine.length - data.wins;
    }
  } catch { /* ignore */ }
  data.wins ??= 0; data.losses ??= 0;
}

async function renderSeason(container, params) {
  const season = params.season;
  const wrap = el('div', { class: 'stats-page stack' });
  container.append(wrap);
  wrap.append(el('a', { class: 'st-back', href: '#/stats' }, t('stats.backAll')), el('div', { class: 'spinner' }));
  const data = await getJSON(`/data/seasons/${encodeURIComponent(season)}.json`);
  if (data && data.playoff === 'in_progress') await mergeLiveSeason(data);
  wrap.querySelector('.spinner')?.remove();
  if (!data) {
    wrap.append(el('div', { class: 'empty' }, t('stats.noSeason', { season })), footnote());
    return;
  }
  const pct = (data.wins + data.losses) ? data.wins / (data.wins + data.losses) : 0;
  wrap.append(el('div', { class: `ticket st-hero ${data.playoff === 'champion' ? 'is-champ' : ''}` },
    el('div', {},
      el('span', { class: 'kicker' }, t('common.season')),
      el('h1', { class: 'st-hero-season' }, data.season)),
    el('div', { class: 'st-hero-rec' },
      el('span', { class: 'st-big num' }, `${data.wins}-${data.losses}`),
      el('span', { class: 'muted' }, `${fmtNum(pct * 100, 1)}%`)),
    el('div', { class: 'stack st-hero-meta' },
      data.coach ? el('span', {}, el('span', { class: 'muted' }, t('stats.coach') + ': '), data.coach) : null,
      poBadge(data.playoff))));

  const players = (data.players || []).slice();
  if (!players.length) { wrap.append(el('div', { class: 'empty' }, t('common.noData')), footnote()); return; }
  let sortKey = 'ppg', dir = -1, q = '';
  const input = el('input', { class: 'input', type: 'search', placeholder: t('stats.filter'), 'aria-label': t('common.search'),
    oninput: e => { q = e.target.value.trim().toLowerCase(); drawBody(); } });
  const thead = el('thead'); const tbody = el('tbody');
  const cmp = (a, b) => {
    const x = a[sortKey], y = b[sortKey];
    if (x == null && y == null) return 0;
    if (x == null) return 1; if (y == null) return -1;
    if (typeof x === 'string') return dir * x.localeCompare(y);
    return dir * (x - y);
  };
  const drawHead = () => {
    const th = (k, label, cls = '') => el('th', { class: `${cls} st-th ${sortKey === k ? 'sorted' : ''}`, onclick: () => {
      if (sortKey === k) dir = -dir; else { sortKey = k; dir = k === 'name' ? 1 : -1; }
      drawHead(); drawBody();
    }, 'aria-sort': sortKey === k ? (dir < 0 ? 'descending' : 'ascending') : 'none' }, label, sortKey === k ? (dir < 0 ? ' ▾' : ' ▴') : '');
    thead.replaceChildren(el('tr', {}, th('name', t('common.player')), th('pos', t('stats.pos')), th('age', t('stats.age'), 'num'),
      ...COLS.map(k => th(k, t(`stats.${k}`), 'num'))));
  };
  const drawBody = () => {
    const rows = players.filter(p => !q || (p.name || '').toLowerCase().includes(q)).sort(cmp);
    tbody.replaceChildren(...rows.map(p => el('tr', {},
      el('td', { class: 'st-name' }, p.slug ? el('a', { href: `#/stats/player/${p.slug}` }, p.name) : p.name),
      el('td', {}, p.pos || '—'), el('td', { class: 'num' }, p.age ?? '—'),
      ...COLS.map(k => el('td', { class: `num ${sortKey === k ? 'sorted' : ''}` }, fmtCell(k, p[k]))))));
    if (!rows.length) tbody.append(el('tr', {}, el('td', { colspan: 14, class: 'muted' }, t('common.noData'))));
  };
  drawHead(); drawBody();
  wrap.append(el('div', { class: 'row st-tools' }, el('h2', { class: 'st-h2' }, t('stats.perGame')), input),
    el('p', { class: 'muted st-hint' }, t('stats.sortHint')),
    el('div', { class: 'table-wrap' }, el('table', { class: 'table-stats st-table' }, thead, tbody)),
    footnote());
}

function sparkline(points) {
  const W = 320, H = 90, P = 14;
  const vals = points.map(p => p.v);
  const max = Math.max(...vals, 1), min = Math.min(...vals, 0);
  const x = i => points.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (points.length - 1);
  const y = v => H - P - ((v - min) / ((max - min) || 1)) * (H - 2 * P);
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
  const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'st-spark', role: 'img', 'aria-label': t('stats.ppgTrend') });
  svg.append(mk('polyline', { points: points.map((p, i) => `${x(i)},${y(p.v)}`).join(' '), fill: 'none', class: 'st-spark-line' }));
  points.forEach((p, i) => {
    const c = mk('circle', { cx: x(i), cy: y(p.v), r: 3.5, class: 'st-spark-dot' });
    const ti = mk('title', {}); ti.textContent = `${p.season}: ${fmtNum(p.v, 1)}`; c.append(ti);
    svg.append(c);
  });
  return svg;
}

async function renderPlayer(container, params) {
  const slug = params.slug;
  const wrap = el('div', { class: 'stats-page stack' });
  container.append(wrap);
  wrap.append(el('a', { class: 'st-back', href: '#/stats' }, t('stats.backAll')), el('div', { class: 'spinner' }));
  const idx = await getJSON('/data/seasons/players-index.json');
  let name = idx?.[slug]?.name || null;
  let seasonList = idx?.[slug]?.seasons || null;
  if (!seasonList) {
    const all = await getJSON('/data/seasons/index.json');
    seasonList = Array.isArray(all) ? all.map(s => s.season) : [];
  }
  const files = await Promise.all(seasonList.map(s => getJSON(`/data/seasons/${encodeURIComponent(s)}.json`)));
  const rows = [];
  for (const f of files) {
    if (!f?.players) continue;
    const p = f.players.find(x => x.slug === slug);
    if (p) { rows.push({ season: f.season, ...p }); name = name || p.name; }
  }
  wrap.querySelector('.spinner')?.remove();
  if (!rows.length) { wrap.append(el('div', { class: 'empty' }, t('stats.noPlayer')), footnote()); return; }
  rows.sort((a, b) => startYear(a.season) - startYear(b.season));

  // weighted career averages
  const career = {};
  for (const k of ['mpg', 'ppg', 'rpg', 'apg', 'spg', 'bpg', 'fgp', 'tpp', 'ftp']) {
    let sum = 0, w = 0;
    for (const r of rows) if (r[k] != null && r.gp) { sum += r[k] * r.gp; w += r.gp; }
    career[k] = w ? sum / w : null;
  }
  career.gp = rows.reduce((a, r) => a + (r.gp || 0), 0);
  career.gs = rows.reduce((a, r) => a + (r.gs || 0), 0);

  wrap.append(el('div', { class: 'page-head' },
    el('span', { class: 'kicker' }, `${rows.length} ${t('stats.seasons')} · ${rows[0].season} → ${rows[rows.length - 1].season}`),
    el('h1', {}, name)));
  const tile = (k) => el('div', { class: 'st-tile' }, el('span', { class: 'st-tile-v num' }, fmtCell(k, career[k])), el('span', { class: 'st-tile-k' }, t(`stats.${k}`)));
  wrap.append(el('div', { class: 'ticket stack' },
    el('span', { class: 'kicker' }, t('stats.careerAvg')),
    el('div', { class: 'st-tiles' }, ['gp', 'ppg', 'rpg', 'apg', 'spg', 'bpg', 'fgp', 'tpp', 'ftp'].map(tile))));

  const pts = rows.filter(r => r.ppg != null).map(r => ({ season: r.season, v: r.ppg }));
  if (pts.length) wrap.append(el('div', { class: 'card stack' }, el('span', { class: 'kicker' }, t('stats.ppgTrend')), sparkline(pts),
    el('div', { class: 'st-spark-ends muted' }, el('span', {}, pts[0].season), el('span', {}, pts[pts.length - 1].season))));

  const head = el('tr', {}, el('th', {}, t('common.season')), el('th', {}, t('stats.pos')), el('th', { class: 'num' }, t('stats.age')),
    ...COLS.map(k => el('th', { class: 'num' }, t(`stats.${k}`))));
  const body = rows.map(r => el('tr', {},
    el('td', {}, el('a', { href: `#/stats/${r.season}` }, r.season)), el('td', {}, r.pos || '—'), el('td', { class: 'num' }, r.age ?? '—'),
    ...COLS.map(k => el('td', { class: 'num' }, fmtCell(k, r[k])))));
  const foot = el('tr', { class: 'st-career-row' }, el('td', { colspan: 3 }, t('stats.career')),
    ...COLS.map(k => el('td', { class: 'num' }, fmtCell(k, career[k]))));
  wrap.append(el('div', { class: 'table-wrap' }, el('table', { class: 'table-stats st-table' }, el('thead', {}, head), el('tbody', {}, body), el('tfoot', {}, foot))),
    footnote());
}

export default [
  { path: '/stats', titleKey: 'stats.title', render(c) { loadCSS('/css/pages/stats.css'); return renderOverview(c); } },
  { path: '/stats/player/:slug', titleKey: 'stats.title', render(c, p) { loadCSS('/css/pages/stats.css'); return renderPlayer(c, p); } },
  { path: '/stats/:season', titleKey: 'stats.title', render(c, p) { loadCSS('/css/pages/stats.css'); return renderSeason(c, p); } },
];
