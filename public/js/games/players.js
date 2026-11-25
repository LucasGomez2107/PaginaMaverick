// Shared player pool + criteria engine + autocomplete for the mini-games (tateti, guess).
import { el, t, api, getUser } from '../core.js';

let poolPromise = null;

/** Loads /data/players.json once. Resolves to an array of players (see docs for schema). */
export function loadPlayers() {
  if (!poolPromise) {
    poolPromise = fetch('/data/players.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => prepare(Array.isArray(d) ? d : (d.players || [])))
      .catch(e => { poolPromise = null; throw e; });
  }
  return poolPromise;
}

/** Normalizes raw player objects (accepts mavsSeasons or mavsFrom/mavsTo). Exported for tests. */
export function prepare(list) {
  return list.map(p => {
    let years = (p.mavsSeasons || []).map(s => parseInt(s, 10)).filter(n => !Number.isNaN(n));
    if (!years.length && p.mavsFrom != null) {
      for (let y = p.mavsFrom; y <= (p.mavsTo ?? p.mavsFrom); y++) years.push(y);
    }
    years.sort((a, b) => a - b);
    return { ...p, _years: years, _norm: norm(p.name) };
  });
}

export function norm(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

export const FRANCHISES = {
  ATL: 'Hawks', BOS: 'Celtics', BKN: 'Nets', CHA: 'Hornets', CHI: 'Bulls', CLE: 'Cavaliers', DAL: 'Mavericks',
  DEN: 'Nuggets', DET: 'Pistons', GSW: 'Warriors', HOU: 'Rockets', IND: 'Pacers', LAC: 'Clippers', LAL: 'Lakers',
  MEM: 'Grizzlies', MIA: 'Heat', MIL: 'Bucks', MIN: 'Timberwolves', NOP: 'Pelicans', NYK: 'Knicks', OKC: 'Thunder',
  ORL: 'Magic', PHI: '76ers', PHX: 'Suns', POR: 'Trail Blazers', SAC: 'Kings', SAS: 'Spurs', TOR: 'Raptors',
  UTA: 'Jazz', WAS: 'Wizards',
};
export const teamLabel = abbr => `${FRANCHISES[abbr] || abbr} (${abbr})`;

/** Country code -> flag emoji. */
export function flag(cc) {
  if (!cc || cc.length !== 2) return '';
  return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

export const seasonLabel = y => `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
export const eraLabel = p => {
  const ys = p._years;
  if (!ys || !ys.length) return '—';
  return ys[0] === ys[ys.length - 1] ? seasonLabel(ys[0]) : `${ys[0]}–${ys[ys.length - 1] + 1}`;
};
export const jerseyLabel = p => (p.jersey || []).map(j => '#' + j).join(' / ') || '—';

// ---------- criteria ----------
// Each criterion: { id, group, test(p), label() }. Labels are resolved with t() at render time.
const decade = d => p => p._years.some(y => y >= d && y < d + 10);

const BASE = [
  { id: 'ppg15', group: 'ppg', test: p => p.mavs?.ppg >= 15 },
  { id: 'ppg20', group: 'ppg', test: p => p.mavs?.ppg >= 20 },
  { id: 'rpg7', group: 'rpg', test: p => p.mavs?.rpg >= 7 },
  { id: 'apg5', group: 'apg', test: p => p.mavs?.apg >= 5 },
  { id: 'gp300', group: 'gp', test: p => p.mavs?.gp >= 300 },
  { id: 'gp500', group: 'gp', test: p => p.mavs?.gp >= 500 },
  { id: 'allStar', group: 'as', test: p => !!p.allStar },
  { id: 'allStarMavs', group: 'as', test: p => !!p.allStarMavs },
  { id: 'champ2011', group: 'champ', test: p => !!p.champion2011 },
  { id: 'champion', group: 'champ', test: p => !!p.champion },
  { id: 'intl', group: 'intl', test: p => p.countryCode && p.countryCode !== 'US' },
  { id: 'posG', group: 'pos', test: p => p.posGroup === 'G' },
  { id: 'posF', group: 'pos', test: p => p.posGroup === 'F' },
  { id: 'posC', group: 'pos', test: p => p.posGroup === 'C' },
  { id: 'drafted', group: 'drafted', test: p => !!p.draftedByMavs },
  { id: 'top10', group: 'top10', test: p => p.draftPick != null && p.draftPick <= 10 },
  { id: 'dec1980', group: 'dec1980', test: decade(1980) },
  { id: 'dec1990', group: 'dec1990', test: decade(1990) },
  { id: 'dec2000', group: 'dec2000', test: decade(2000) },
  { id: 'dec2010', group: 'dec2010', test: decade(2010) },
  { id: 'dec2020', group: 'dec2020', test: decade(2020) },
  { id: 'mvp', group: 'mvp', test: p => !!p.mvp },
];

export function criterionLabel(c) {
  if (c.team) return t('tateti.c.team', { team: teamLabel(c.team) });
  return t('tateti.c.' + c.id);
}

/** All criteria available for a pool (franchise criteria only for teams with ≥ 3 pool players). */
export function buildCriteria(players) {
  const list = BASE.map(c => ({ ...c, kind: 'stat' }));
  const counts = {};
  for (const p of players) for (const tm of p.teams || []) if (tm !== 'DAL') counts[tm] = (counts[tm] || 0) + 1;
  for (const [abbr, n] of Object.entries(counts)) {
    if (n < 3) continue;
    list.push({ id: 'team:' + abbr, group: 'team:' + abbr, kind: 'team', team: abbr, test: p => (p.teams || []).includes(abbr) });
  }
  return list;
}

export function getCriterion(players, id) {
  return buildCriteria(players).find(c => c.id === id) || null;
}

export function cellMatches(players, a, b) {
  return players.filter(p => a.test(p) && b.test(p));
}

/** Seeded PRNG (mulberry32). */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  // extra avalanche
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15;
  return h >>> 0;
}

// Is there an assignment of 9 distinct players, one per cell? (bipartite matching)
function hasDistinctAssignment(cells) {
  const owner = new Map();
  const tryCell = (i, seen) => {
    for (const p of cells[i]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      if (!owner.has(p.id) || tryCell(owner.get(p.id), seen)) { owner.set(p.id, i); return true; }
    }
    return false;
  };
  return cells.every((_, i) => tryCell(i, new Set()));
}

/**
 * Generates a 3x3 grid: { rows:[c,c,c], cols:[c,c,c], cells:[[players]x9] } (cells row-major).
 * Every cell has ≥ minPerCell valid players and the board can be completed with 9 distinct players.
 */
export function generateGrid(players, { random = Math.random, minPerCell = 2, maxTries = 20000 } = {}) {
  const all = buildCriteria(players);
  const teams = all.filter(c => c.kind === 'team');
  const stats = all.filter(c => c.kind === 'stat');
  const pick = arr => arr[Math.floor(random() * arr.length)];
  for (let tries = 0; tries < maxTries; tries++) {
    const nTeams = 2 + Math.floor(random() * 3); // 2..4 franchise criteria
    const chosen = [];
    const groups = new Set();
    let guard = 0;
    while (chosen.length < 6 && guard++ < 60) {
      const c = pick(chosen.length < nTeams ? teams : stats);
      if (groups.has(c.group)) continue;
      if (c.id === 'mvp' && random() < 0.7) continue; // rare: only a couple of MVPs in the pool
      groups.add(c.group);
      chosen.push(c);
    }
    if (chosen.length < 6) continue;
    // shuffle and split into rows / cols
    for (let i = chosen.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [chosen[i], chosen[j]] = [chosen[j], chosen[i]]; }
    const rows = chosen.slice(0, 3), cols = chosen.slice(3);
    const cells = [];
    let ok = true;
    for (const r of rows) {
      for (const c of cols) {
        const m = cellMatches(players, r, c);
        if (m.length < minPerCell) { ok = false; break; }
        cells.push(m);
      }
      if (!ok) break;
    }
    if (!ok || !hasDistinctAssignment(cells)) continue;
    return { rows, cols, cells };
  }
  throw new Error('Could not generate a grid');
}

/** Rarity bonus for a cell with n valid answers: 2 → +15 ... ≥ 24 → 0. */
export function rarityBonus(n) {
  if (n <= 2) return 15;
  const v = 15 * (1 - Math.log(n / 2) / Math.log(12));
  return Math.max(0, Math.min(15, Math.round(v)));
}

// ---------- autocomplete input ----------
/**
 * Accent-insensitive autocomplete over the pool. Calls onPick(player) when a player is chosen
 * (click, Enter on highlighted suggestion, or Enter with an exact name).
 * Returns { root, input, focus(), clear(), setDisabled(bool) }.
 */
export function playerInput(players, { onPick, placeholder = '', isUsed = () => false, label = '' } = {}) {
  const listId = 'pac-' + Math.random().toString(36).slice(2, 8);
  const input = el('input', {
    class: 'input pac-input', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder,
    role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': listId,
    'aria-label': label || placeholder,
  });
  const list = el('ul', { class: 'pac-list', id: listId, role: 'listbox', hidden: true });
  const root = el('div', { class: 'pac' }, input, list);
  let items = [];
  let active = -1;

  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; };
  const choose = p => { if (!p) return; input.value = ''; close(); onPick && onPick(p); };

  function search(q) {
    const nq = norm(q);
    if (nq.length < 2) return [];
    const scored = [];
    for (const p of players) {
      const n = p._norm || norm(p.name);
      const idx = n.indexOf(nq);
      if (idx < 0) continue;
      const wordStart = idx === 0 || n[idx - 1] === ' ';
      scored.push([idx === 0 ? 0 : wordStart ? 1 : 2, p]);
    }
    scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name));
    return scored.slice(0, 8).map(s => s[1]);
  }

  function renderList() {
    list.replaceChildren(...items.map((p, i) => el('li', {
      class: 'pac-item' + (i === active ? ' active' : '') + (isUsed(p) ? ' used' : ''),
      role: 'option', 'aria-selected': i === active ? 'true' : 'false', id: `${listId}-${i}`,
      onmousedown: e => { e.preventDefault(); choose(p); },
    }, el('span', { class: 'pac-name' }, p.name), el('span', { class: 'pac-meta' }, p.pos))));
    list.hidden = items.length === 0;
    input.setAttribute('aria-expanded', items.length ? 'true' : 'false');
    if (active >= 0) input.setAttribute('aria-activedescendant', `${listId}-${active}`);
    else input.removeAttribute('aria-activedescendant');
  }

  input.addEventListener('input', () => { items = search(input.value); active = items.length ? 0 : -1; renderList(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); active = (active + 1) % items.length; renderList(); }
    else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); active = (active - 1 + items.length) % items.length; renderList(); }
    else if (e.key === 'Escape') close();
    else if (e.key === 'Enter') {
      e.preventDefault();
      const exact = players.find(p => (p._norm || norm(p.name)) === norm(input.value));
      if (exact) choose(exact);
      else if (active >= 0 && items[active]) choose(items[active]);
    }
  });
  input.addEventListener('blur', () => setTimeout(close, 120));

  return {
    root, input,
    focus: () => input.focus(),
    clear: () => { input.value = ''; items = []; close(); },
    setDisabled: d => { input.disabled = !!d; if (d) close(); },
  };
}

// ---------- score submission ----------
/**
 * Renders a score-saving box and submits the score once if logged in.
 * prefix: 'tateti' | 'guess' (uses keys `${prefix}.save.*`).
 * state: a persistent object owned by the caller ({} on first call); it remembers the submission result so
 * re-renders (language change) never submit twice.
 */
export function scoreBox(prefix, game, points, meta, { route, state = {} } = {}) {
  const status = el('p', { class: 'save-status', 'aria-live': 'polite' });
  const box = el('div', { class: 'save-box stack-sm' }, status);
  const show = () => {
    const s = state.status;
    status.textContent = t(`${prefix}.save.${s === 'pending' ? 'saving' : s}`);
    box.classList.toggle('ok', s === 'ok' || s === 'dup');
    box.classList.toggle('err', s === 'err');
    const link = box.querySelector('a');
    if (s === 'anon' && !link) {
      box.append(el('a', { class: 'btn btn-primary btn-sm', href: `#/login?next=${encodeURIComponent(route)}` }, t(`${prefix}.save.login`)));
    } else if (s !== 'anon' && link) link.remove();
  };
  if (!state.status) {
    if (!getUser()) state.status = 'anon';
    else {
      state.status = 'pending';
      api('/scores', { method: 'POST', body: { game, points, meta } })
        .then(() => { state.status = 'ok'; })
        .catch(e => { state.status = e.status === 401 ? 'anon' : e.status === 409 ? 'dup' : 'err'; })
        .finally(() => { if (box.isConnected) show(); });
    }
  }
  show();
  return box;
}
