// Current Mavericks roster (synced from ESPN by the server, see server/espn.js syncRoster).
import { el, t, registerStrings, api, loadCSS, fmtNum, fmtDateTime } from '../core.js';

registerStrings({
  es: {
    'roster.title': 'Roster', 'roster.kicker': 'Temporada {season}', 'roster.h1': 'El plantel de los Mavs',
    'roster.coach': 'Entrenador', 'roster.updated': 'Actualizado', 'roster.source.espn': 'Datos: ESPN, se actualiza solo cada 30 min',
    'roster.source.other': 'Plantel cargado a mano', 'roster.all': 'Todos', 'roster.G': 'Bases/Escoltas', 'roster.F': 'Aleros/Ala-pívots', 'roster.C': 'Pívots',
    'roster.pos.G': 'Base/Escolta', 'roster.pos.F': 'Alero', 'roster.pos.C': 'Pívot',
    'roster.sort': 'Ordenar', 'roster.sort.ppg': 'Puntos', 'roster.sort.jersey': 'Número', 'roster.sort.name': 'Nombre',
    'roster.height': 'Altura', 'roster.weight': 'Peso', 'roster.age': 'Edad', 'roster.years': '{n} años',
    'roster.exp': 'Experiencia', 'roster.rookie': 'Novato', 'roster.seasons': '{n} temp.', 'roster.college': 'Universidad',
    'roster.ppg': 'PTS', 'roster.rpg': 'REB', 'roster.apg': 'AST', 'roster.mpg': 'MIN', 'roster.gp': 'PJ',
    'roster.fgp': 'TC%', 'roster.tpp': '3P%', 'roster.noStats': 'Sin minutos esta temporada',
    'roster.inj.Out': 'Lesionado', 'roster.inj.Day-To-Day': 'Día a día', 'roster.inj.other': 'Lesión',
    'roster.empty': 'No se pudo cargar el plantel.', 'roster.all-link': 'Ver plantel completo', 'roster.home': 'El plantel',
    'roster.statsLink': 'Ver estadísticas de la temporada',
  },
  en: {
    'roster.title': 'Roster', 'roster.kicker': '{season} season', 'roster.h1': 'The Mavs roster',
    'roster.coach': 'Head coach', 'roster.updated': 'Updated', 'roster.source.espn': 'Data: ESPN, refreshes every 30 min',
    'roster.source.other': 'Roster entered manually', 'roster.all': 'All', 'roster.G': 'Guards', 'roster.F': 'Forwards', 'roster.C': 'Centers',
    'roster.pos.G': 'Guard', 'roster.pos.F': 'Forward', 'roster.pos.C': 'Center',
    'roster.sort': 'Sort', 'roster.sort.ppg': 'Points', 'roster.sort.jersey': 'Number', 'roster.sort.name': 'Name',
    'roster.height': 'Height', 'roster.weight': 'Weight', 'roster.age': 'Age', 'roster.years': '{n} yrs',
    'roster.exp': 'Experience', 'roster.rookie': 'Rookie', 'roster.seasons': '{n} seas.', 'roster.college': 'College',
    'roster.ppg': 'PTS', 'roster.rpg': 'REB', 'roster.apg': 'AST', 'roster.mpg': 'MIN', 'roster.gp': 'GP',
    'roster.fgp': 'FG%', 'roster.tpp': '3P%', 'roster.noStats': 'No minutes this season',
    'roster.inj.Out': 'Out', 'roster.inj.Day-To-Day': 'Day-to-day', 'roster.inj.other': 'Injury',
    'roster.empty': 'Could not load the roster.', 'roster.all-link': 'See full roster', 'roster.home': 'The roster',
    'roster.statsLink': 'See season stats',
  },
  pt: {
    'roster.title': 'Elenco', 'roster.kicker': 'Temporada {season}', 'roster.h1': 'O elenco dos Mavs',
    'roster.coach': 'Técnico', 'roster.updated': 'Atualizado', 'roster.source.espn': 'Dados: ESPN, atualiza sozinho a cada 30 min',
    'roster.source.other': 'Elenco cadastrado manualmente', 'roster.all': 'Todos', 'roster.G': 'Armadores', 'roster.F': 'Alas', 'roster.C': 'Pivôs',
    'roster.pos.G': 'Armador', 'roster.pos.F': 'Ala', 'roster.pos.C': 'Pivô',
    'roster.sort': 'Ordenar', 'roster.sort.ppg': 'Pontos', 'roster.sort.jersey': 'Número', 'roster.sort.name': 'Nome',
    'roster.height': 'Altura', 'roster.weight': 'Peso', 'roster.age': 'Idade', 'roster.years': '{n} anos',
    'roster.exp': 'Experiência', 'roster.rookie': 'Novato', 'roster.seasons': '{n} temp.', 'roster.college': 'Universidade',
    'roster.ppg': 'PTS', 'roster.rpg': 'REB', 'roster.apg': 'AST', 'roster.mpg': 'MIN', 'roster.gp': 'J',
    'roster.fgp': 'FG%', 'roster.tpp': '3P%', 'roster.noStats': 'Sem minutos nesta temporada',
    'roster.inj.Out': 'Lesionado', 'roster.inj.Day-To-Day': 'Dia a dia', 'roster.inj.other': 'Lesão',
    'roster.empty': 'Não foi possível carregar o elenco.', 'roster.all-link': 'Ver elenco completo', 'roster.home': 'O elenco',
    'roster.statsLink': 'Ver estatísticas da temporada',
  },
});

const COUNTRY_CODES = {
  USA: 'US', Spain: 'ES', Australia: 'AU', Guinea: 'GN', England: 'GB', 'United Kingdom': 'GB', 'Bosnia & Herzegovina': 'BA',
  'Bosnia and Herzegovina': 'BA', France: 'FR', Germany: 'DE', Slovenia: 'SI', Latvia: 'LV', Argentina: 'AR', Brazil: 'BR',
  Canada: 'CA', Serbia: 'RS', Greece: 'GR', Lithuania: 'LT', Croatia: 'HR', Nigeria: 'NG', Cameroon: 'CM', 'Puerto Rico': 'PR',
  'Dominican Republic': 'DO', Italy: 'IT', Turkey: 'TR', Japan: 'JP', 'New Zealand': 'NZ', Montenegro: 'ME', Senegal: 'SN',
  Uruguay: 'UY', Venezuela: 'VE', Mexico: 'MX', Israel: 'IL', 'South Sudan': 'SS', Congo: 'CD', Ukraine: 'UA', Georgia: 'GE',
};
export const flag = country => {
  const c = COUNTRY_CODES[country];
  return c ? String.fromCodePoint(...[...c].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)) : '';
};
const posGroup = p => (p.position || '').charAt(0).toUpperCase();
const metres = cm => cm ? `${fmtNum(cm / 100, 2)} m` : '—';
const pct = v => v == null ? '—' : fmtNum(v * 100, 1);

export async function loadRoster() {
  try { return await api('/roster'); } catch { return null; }
}

function injuryBadge(p) {
  if (!p.injury?.status) return null;
  const key = `roster.inj.${p.injury.status}`;
  const label = t(key) === key ? t('roster.inj.other') : t(key);
  return el('span', { class: `badge rs-inj ${p.injury.status === 'Out' ? 'rs-out' : ''}`, title: p.injury.detail || '' }, '✚ ' + label);
}

/** Compact card used in the home strip. */
export function miniCard(p) {
  const s = p.stats;
  return el('a', { class: 'rs-mini', href: '#/roster' },
    el('span', { class: 'rs-mini-num' }, p.jersey ?? '–'),
    el('span', { class: 'rs-mini-name' }, p.name),
    el('span', { class: 'rs-mini-meta mono' }, [p.position, flag(p.country)].filter(Boolean).join(' · ')),
    s?.ppg != null ? el('span', { class: 'rs-mini-ppg mono' }, `${fmtNum(s.ppg, 1)} ${t('roster.ppg')}`) : null,
    injuryBadge(p));
}

function card(p) {
  const s = p.stats;
  const exp = p.experience == null ? null : (p.experience === 0 ? t('roster.rookie') : t('roster.seasons', { n: p.experience }));
  const fact = (label, value) => value == null || value === '' ? null : el('div', { class: 'rs-fact' }, el('small', {}, label), el('b', {}, value));
  return el('article', { class: `rs-card rs-${posGroup(p) || 'X'}` },
    el('div', { class: 'rs-top' },
      el('span', { class: 'rs-num', 'aria-label': '#' }, p.jersey ?? '–'),
      el('div', { class: 'rs-id' },
        el('h3', {}, p.name),
        el('span', { class: 'rs-pos' }, t(`roster.pos.${posGroup(p)}`) === `roster.pos.${posGroup(p)}` ? (p.position || '') : t(`roster.pos.${posGroup(p)}`)),
        injuryBadge(p))),
    el('div', { class: 'rs-facts' },
      fact(t('roster.height'), metres(p.height_cm)),
      fact(t('roster.weight'), p.weight_kg ? `${p.weight_kg} kg` : null),
      fact(t('roster.age'), p.age != null ? t('roster.years', { n: p.age }) : null),
      fact(t('roster.exp'), exp),
      p.country ? el('div', { class: 'rs-fact rs-wide' }, el('small', {}, '📍'), el('b', {}, `${flag(p.country)} ${[p.city, p.country].filter(Boolean).join(', ')}`)) : null,
      p.college ? el('div', { class: 'rs-fact rs-wide' }, el('small', {}, t('roster.college')), el('b', {}, p.college)) : null),
    s && s.gp
      ? el('div', { class: 'rs-stats' },
        ...[['ppg', 1], ['rpg', 1], ['apg', 1]].map(([k, d]) => el('div', { class: 'rs-stat rs-main' }, el('b', { class: 'mono' }, fmtNum(s[k], d)), el('small', {}, t(`roster.${k}`)))),
        el('div', { class: 'rs-stat' }, el('b', { class: 'mono' }, fmtNum(s.mpg, 1)), el('small', {}, t('roster.mpg'))),
        el('div', { class: 'rs-stat' }, el('b', { class: 'mono' }, s.gp), el('small', {}, t('roster.gp'))),
        el('div', { class: 'rs-stat' }, el('b', { class: 'mono' }, pct(s.fgp)), el('small', {}, t('roster.fgp'))),
        el('div', { class: 'rs-stat' }, el('b', { class: 'mono' }, pct(s.tpp)), el('small', {}, t('roster.tpp'))))
      : el('div', { class: 'rs-stats rs-nostats muted' }, t('roster.noStats')));
}

export default {
  path: '/roster', titleKey: 'roster.title',
  async render(container) {
    loadCSS('/css/pages/roster.css');
    const head = el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, t('roster.title')), el('h1', {}, t('roster.h1')));
    const body = el('div', { class: 'stack' }, el('div', { class: 'spinner' }));
    container.append(el('div', { class: 'roster-page stack' }, head, body));
    const r = await loadRoster();
    const players = r?.details || [];
    body.replaceChildren();
    if (!players.length) { body.append(el('div', { class: 'empty' }, t('roster.empty'))); return; }
    const season = r.season || '';
    if (season) head.querySelector('.kicker').textContent = t('roster.kicker', { season });

    body.append(el('div', { class: 'ticket rs-bar' },
      r.coach ? el('div', {}, el('small', { class: 'muted' }, t('roster.coach')), el('b', { class: 'rs-coach' }, r.coach)) : null,
      el('div', {}, el('small', { class: 'muted' }, t('roster.updated')), el('b', {}, r.updated_at ? fmtDateTime(r.updated_at) : '—')),
      el('p', { class: 'muted rs-src' }, r.source === 'espn' ? t('roster.source.espn') : t('roster.source.other')),
      season ? el('a', { class: 'btn btn-ghost btn-sm', href: `#/stats/${season}` }, t('roster.statsLink')) : null));

    let group = 'all', sort = 'ppg';
    const chips = el('div', { class: 'row' });
    const sel = el('select', { class: 'select rs-sort', 'aria-label': t('roster.sort'), onchange: e => { sort = e.target.value; draw(); } },
      ['ppg', 'jersey', 'name'].map(k => el('option', { value: k }, `${t('roster.sort')}: ${t('roster.sort.' + k)}`)));
    const grid = el('div', { class: 'rs-grid' });
    const cmp = {
      ppg: (a, b) => (b.stats?.ppg ?? -1) - (a.stats?.ppg ?? -1),
      jersey: (a, b) => (parseInt(a.jersey, 10) || 0) - (parseInt(b.jersey, 10) || 0),
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
    };
    function draw() {
      const groups = ['all', ...['G', 'F', 'C'].filter(g => players.some(p => posGroup(p) === g))];
      chips.replaceChildren(...groups.map(g => el('button', { class: `chip ${group === g ? 'active' : ''}`, type: 'button',
        onclick: () => { group = g; draw(); } }, t(g === 'all' ? 'roster.all' : `roster.${g}`),
        ' ', el('span', { class: 'muted' }, g === 'all' ? players.length : players.filter(p => posGroup(p) === g).length))));
      grid.replaceChildren(...players.filter(p => group === 'all' || posGroup(p) === group).sort(cmp[sort]).map(card));
    }
    draw();
    body.append(el('div', { class: 'row-between rs-tools' }, chips, sel), grid);
  },
};
