import { el, t, api, registerStrings, loadCSS, fmtDateTime } from '../core.js';

registerStrings({
  es: {
    'game.title': 'Estadísticas del partido', 'game.back': '← Volver al foro', 'game.final': 'Final', 'game.live': 'En vivo',
    'game.notFound': 'Partido no encontrado.', 'game.empty': 'Las estadísticas todavía no están disponibles',
    'game.emptyHint': 'Aparecen cuando arranca el partido.', 'game.forum': 'Foro del partido', 'game.diary': 'Diario',
    'game.quarters': 'Cuarto por cuarto', 'game.team': 'Equipo', 'game.total': 'Total', 'game.ot': 'TE',
    'game.compare': 'Comparación de equipos', 'game.players': 'Jugadores', 'game.starters': 'Titulares', 'game.bench': 'Suplentes',
    'game.dnp': 'No jugó', 'game.totals': 'Totales', 'game.refreshing': 'Se actualiza solo cada 60 s', 'game.leadChanges': 'Cambios de ventaja',
    'game.fg': 'Tiros de campo', 'game.fgp': 'TC %', 'game.tp': 'Triples', 'game.tpp': 'Triples %', 'game.ft': 'Tiros libres', 'game.ftp': 'TL %',
    'game.reb': 'Rebotes', 'game.rebSub': '{o} of. / {d} def.', 'game.ast': 'Asistencias', 'game.stl': 'Robos', 'game.blk': 'Tapas',
    'game.tov': 'Pérdidas', 'game.pf': 'Faltas', 'game.paint': 'Puntos en la pintura', 'game.fastbreak': 'Puntos de contraataque',
    'game.tovpts': 'Puntos tras pérdidas', 'game.largestLead': 'Máxima ventaja',
    'game.c.player': 'Jugador', 'game.c.min': 'MIN', 'game.c.pts': 'PTS', 'game.c.fg': 'TC', 'game.c.tp': '3P', 'game.c.ft': 'TL',
    'game.c.reb': 'REB', 'game.c.ast': 'AST', 'game.c.tov': 'PER', 'game.c.stl': 'ROB', 'game.c.blk': 'TAP', 'game.c.oreb': 'RO', 'game.c.dreb': 'RD', 'game.c.pf': 'FAL', 'game.c.pm': '+/-',
  },
  en: {
    'game.title': 'Box score', 'game.back': '← Back to forum', 'game.final': 'Final', 'game.live': 'Live',
    'game.notFound': 'Game not found.', 'game.empty': 'Stats are not available yet',
    'game.emptyHint': 'They show up once the game starts.', 'game.forum': 'Game forum', 'game.diary': 'Diary',
    'game.quarters': 'Quarter by quarter', 'game.team': 'Team', 'game.total': 'T', 'game.ot': 'OT',
    'game.compare': 'Team comparison', 'game.players': 'Players', 'game.starters': 'Starters', 'game.bench': 'Bench',
    'game.dnp': 'Did not play', 'game.totals': 'Totals', 'game.refreshing': 'Auto-refreshes every 60 s', 'game.leadChanges': 'Lead changes',
    'game.fg': 'Field goals', 'game.fgp': 'FG %', 'game.tp': '3-pointers', 'game.tpp': '3P %', 'game.ft': 'Free throws', 'game.ftp': 'FT %',
    'game.reb': 'Rebounds', 'game.rebSub': '{o} off / {d} def', 'game.ast': 'Assists', 'game.stl': 'Steals', 'game.blk': 'Blocks',
    'game.tov': 'Turnovers', 'game.pf': 'Fouls', 'game.paint': 'Points in the paint', 'game.fastbreak': 'Fast-break points',
    'game.tovpts': 'Points off turnovers', 'game.largestLead': 'Largest lead',
    'game.c.player': 'Player', 'game.c.min': 'MIN', 'game.c.pts': 'PTS', 'game.c.fg': 'FG', 'game.c.tp': '3PT', 'game.c.ft': 'FT',
    'game.c.reb': 'REB', 'game.c.ast': 'AST', 'game.c.tov': 'TO', 'game.c.stl': 'STL', 'game.c.blk': 'BLK', 'game.c.oreb': 'OR', 'game.c.dreb': 'DR', 'game.c.pf': 'PF', 'game.c.pm': '+/-',
  },
  pt: {
    'game.title': 'Estatísticas do jogo', 'game.back': '← Voltar ao fórum', 'game.final': 'Final', 'game.live': 'Ao vivo',
    'game.notFound': 'Jogo não encontrado.', 'game.empty': 'As estatísticas ainda não estão disponíveis',
    'game.emptyHint': 'Elas aparecem quando o jogo começa.', 'game.forum': 'Fórum do jogo', 'game.diary': 'Diário',
    'game.quarters': 'Quarto a quarto', 'game.team': 'Time', 'game.total': 'T', 'game.ot': 'PR',
    'game.compare': 'Comparação dos times', 'game.players': 'Jogadores', 'game.starters': 'Titulares', 'game.bench': 'Reservas',
    'game.dnp': 'Não jogou', 'game.totals': 'Totais', 'game.refreshing': 'Atualiza sozinho a cada 60 s', 'game.leadChanges': 'Mudanças de liderança',
    'game.fg': 'Arremessos de quadra', 'game.fgp': 'AQ %', 'game.tp': 'Bolas de 3', 'game.tpp': '3P %', 'game.ft': 'Lances livres', 'game.ftp': 'LL %',
    'game.reb': 'Rebotes', 'game.rebSub': '{o} of. / {d} def.', 'game.ast': 'Assistências', 'game.stl': 'Roubos', 'game.blk': 'Tocos',
    'game.tov': 'Turnovers', 'game.pf': 'Faltas', 'game.paint': 'Pontos no garrafão', 'game.fastbreak': 'Pontos de contra-ataque',
    'game.tovpts': 'Pontos após turnovers', 'game.largestLead': 'Maior vantagem',
    'game.c.player': 'Jogador', 'game.c.min': 'MIN', 'game.c.pts': 'PTS', 'game.c.fg': 'AQ', 'game.c.tp': '3P', 'game.c.ft': 'LL',
    'game.c.reb': 'REB', 'game.c.ast': 'AST', 'game.c.tov': 'TO', 'game.c.stl': 'ROU', 'game.c.blk': 'TOC', 'game.c.oreb': 'RO', 'game.c.dreb': 'RD', 'game.c.pf': 'FAL', 'game.c.pm': '+/-',
  },
});

// [stat key, label key, lowerIsBetter, sortable numeric getter]
const ROWS = [
  ['fg', 'game.fg', false, s => pctOf(s.fg)], ['fgp', 'game.fgp', false], ['tp', 'game.tp', false, s => madeOf(s.tp)], ['tpp', 'game.tpp', false],
  ['ft', 'game.ft', false, s => madeOf(s.ft)], ['ftp', 'game.ftp', false], ['reb', 'game.reb', false], ['ast', 'game.ast', false],
  ['stl', 'game.stl', false], ['blk', 'game.blk', false], ['tov', 'game.tov', true], ['pf', 'game.pf', true],
  ['paint', 'game.paint', false], ['fastbreak', 'game.fastbreak', false], ['tovpts', 'game.tovpts', false], ['largest_lead', 'game.largestLead', false],
];
function madeOf(v) { const n = parseInt(String(v ?? '').split('-')[0], 10); return Number.isFinite(n) ? n : null; }
function pctOf(v) { const [m, a] = String(v ?? '').split('-').map(Number); return a > 0 ? m / a : null; }

const PLAYER_COLS = ['min', 'pts', 'fg', 'tp', 'ft', 'reb', 'ast', 'tov', 'stl', 'blk', 'oreb', 'dreb', 'pf', 'pm'];
const show = v => (v === null || v === undefined || v === '' ? '–' : (typeof v === 'number' && v > 0 && false ? '+' + v : String(v)));
const showPm = v => (typeof v === 'number' && v > 0 ? '+' + v : show(v));

function ticket(game, box) {
  const [us, them] = box?.teams || [];
  const live = (box?.status || game.status) === 'live';
  const sc = us && them && us.score != null && them.score != null ? [us.score, them.score] : [game.mavs_score, game.opp_score];
  const oppName = them?.name || game.opponent;
  const done = !live && game.status === 'final' && sc[0] != null && sc[1] != null;
  const win = done && sc[0] > sc[1];
  return el('div', { class: 'ticket gm-head' },
    el('span', { class: 'kicker' }, `${fmtDateTime(game.date)} · ${game.season || ''}`),
    el('h1', { class: 'gm-title' },
      el('span', { class: 'gm-team' }, 'Mavericks'), el('b', { class: 'gm-score' }, sc[0] ?? '–'),
      el('i', {}, '–'),
      el('b', { class: 'gm-score' }, sc[1] ?? '–'), el('span', { class: 'gm-team' }, oppName)),
    el('div', { class: 'row' },
      live ? el('span', { class: 'badge gm-live' }, t('game.live')) : (game.status === 'final' ? el('span', { class: 'badge badge-navy' }, t('game.final')) : null),
      done ? el('span', { class: 'badge ' + (win ? 'badge-win' : 'badge-loss') }, win ? 'W' : 'L') : null,
      el('span', { class: 'muted' }, game.home ? t('common.home') : t('common.away'))),
    el('div', { class: 'row' },
      el('a', { class: 'btn btn-sm btn-ghost', href: '#/forum/' + game.id }, t('game.forum')),
      game.diary_id ? el('a', { class: 'btn btn-sm btn-ghost', href: '#/diary/' + game.diary_id }, t('game.diary')) : null));
}

function quarters(box) {
  const n = Math.max(4, ...box.teams.map(tm => tm.linescores.length));
  const head = ['', ...Array.from({ length: n }, (_, i) => i < 4 ? String(i + 1) : (n === 5 ? t('game.ot') : t('game.ot') + (i - 3))), t('game.total')];
  return el('section', { class: 'stack' }, el('h2', { class: 'gm-h2' }, t('game.quarters')),
    el('div', { class: 'table-wrap' }, el('table', { class: 'table-stats gm-quarters' },
      el('thead', {}, el('tr', {}, head.map((h, i) => el('th', { class: i ? 'num' : '' }, i ? h : t('game.team'))))),
      el('tbody', {}, box.teams.map((tm, ti) => el('tr', { class: ti === 0 ? 'gm-us' : '' },
        el('td', {}, tm.abbr),
        Array.from({ length: n }, (_, i) => el('td', { class: 'num' }, tm.linescores[i] ?? '–')),
        el('td', { class: 'num' }, el('b', {}, tm.score ?? '–'))))))));
}

function compare(box) {
  const [us, them] = box.teams;
  const rows = ROWS.map(([k, lab, lowerBetter, getter]) => {
    const a = us.stats[k], b = them.stats[k];
    const na = getter ? getter(us.stats) : (typeof a === 'number' ? a : null);
    const nb = getter ? getter(them.stats) : (typeof b === 'number' ? b : null);
    if (a == null && b == null) return null;
    let wa = 0, wb = 0, better = 0;
    if (na != null && nb != null) {
      const mx = Math.max(na, nb);
      if (mx > 0) { wa = na / mx; wb = nb / mx; }
      if (na !== nb) better = (na > nb) !== lowerBetter ? 1 : 2;
    }
    const sub = k === 'reb' ? side => side.stats.oreb != null ? el('small', {}, t('game.rebSub', { o: side.stats.oreb, d: side.stats.dreb })) : null : null;
    const pct = k === 'fgp' || k === 'tpp' || k === 'ftp' ? '%' : '';
    return el('div', { class: 'gm-cmp-row' },
      el('div', { class: 'gm-val gm-val-a' + (better === 1 ? ' best' : '') }, show(a) + (a != null ? pct : ''), sub?.(us)),
      el('div', { class: 'gm-lab' }, t(lab)),
      el('div', { class: 'gm-val gm-val-b' + (better === 2 ? ' best' : '') }, show(b) + (b != null ? pct : ''), sub?.(them)),
      el('div', { class: 'gm-bars' },
        el('span', { class: 'gm-bar gm-bar-a' + (better === 1 ? ' best' : '') }, el('i', { style: { width: Math.round(wa * 100) + '%' } })),
        el('span', { class: 'gm-bar gm-bar-b' + (better === 2 ? ' best' : '') }, el('i', { style: { width: Math.round(wb * 100) + '%' } }))));
  }).filter(Boolean);
  return el('section', { class: 'stack' }, el('h2', { class: 'gm-h2' }, t('game.compare')),
    el('div', { class: 'card gm-cmp' },
      el('div', { class: 'gm-cmp-head' }, el('b', { class: 'gm-ha' }, us.abbr), el('span', { class: 'muted' }, box.lead_changes != null ? `${t('game.leadChanges')}: ${box.lead_changes}` : ''), el('b', { class: 'gm-hb' }, them.abbr)),
      rows));
}

function playerTable(tm) {
  const cols = ['player', ...PLAYER_COLS];
  const trow = (p, cls) => el('tr', { class: cls || '' },
    el('td', {}, el('span', { class: 'gm-pname' }, p.name), el('small', { class: 'muted' }, [p.pos, p.jersey ? '#' + p.jersey : null].filter(Boolean).join(' · '))),
    PLAYER_COLS.map(c => el('td', { class: 'num' + (c === 'pts' ? ' gm-pts' : '') }, c === 'pm' ? showPm(p[c]) : show(p[c]))));
  const sep = label => el('tr', { class: 'gm-sep' }, el('td', { colspan: cols.length }, label));
  const played = tm.players.filter(p => !p.dnp);
  const starters = played.filter(p => p.starter), bench = played.filter(p => !p.starter), dnp = tm.players.filter(p => p.dnp);
  return el('div', { class: 'table-wrap' }, el('table', { class: 'table-stats gm-players' },
    el('thead', {}, el('tr', {}, cols.map(c => el('th', { class: c === 'player' ? '' : 'num' }, t('game.c.' + c))))),
    el('tbody', {},
      starters.length ? sep(t('game.starters')) : null, starters.map(p => trow(p)),
      bench.length ? sep(t('game.bench')) : null, bench.map(p => trow(p)),
      dnp.map(p => el('tr', { class: 'gm-dnp' },
        el('td', {}, el('span', { class: 'gm-pname' }, p.name)),
        el('td', { colspan: PLAYER_COLS.length }, `${t('game.dnp')}${p.reason ? ' — ' + p.reason : ''}`))),
      el('tr', { class: 'gm-totals' }, el('td', {}, t('game.totals')),
        PLAYER_COLS.map(c => el('td', { class: 'num' }, c === 'pm' || c === 'min' ? '' : show(tm.totals?.[c])))))));
}

function players(box, state) {
  const holder = el('div', {});
  const draw = () => holder.replaceChildren(playerTable(box.teams[state.tab] || box.teams[0]));
  const tabs = el('div', { class: 'tabs', role: 'tablist' });
  const paint = () => {
    tabs.replaceChildren(...box.teams.map((tm, i) => el('button', { type: 'button', role: 'tab', class: i === state.tab ? 'active' : '', onclick: () => { state.tab = i; paint(); draw(); } }, tm.name)));
  };
  paint(); draw();
  return el('section', { class: 'stack' }, el('h2', { class: 'gm-h2' }, t('game.players')), tabs, holder);
}

async function render(container, params) {
  loadCSS('/css/pages/game.css');
  const wrap = el('div', { class: 'game-page stack' }, el('a', { class: 'gm-back', href: '#/forum/' + params.id }, t('game.back')), el('div', { class: 'spinner' }));
  container.append(wrap);
  let game;
  try { game = (await api(`/games/${params.id}`)).game; } catch (e) {
    wrap.querySelector('.spinner')?.remove();
    wrap.append(el('div', { class: 'empty' }, e.status === 404 ? t('game.notFound') : (e.message || t('common.error'))));
    return;
  }
  const state = { tab: 0 };
  const body = el('div', { class: 'stack' });
  wrap.querySelector('.spinner')?.remove();
  wrap.append(body);

  async function load() {
    let box = null;
    try { box = (await api(`/games/${params.id}/boxscore`)).boxscore; } catch { /* empty state */ }
    if (!wrap.isConnected) return;
    if (box && box.teams?.length === 2) {
      const parts = [ticket(game, box), quarters(box), compare(box), players(box, state)];
      if (box.status === 'live') parts.push(el('p', { class: 'muted gm-note' }, t('game.refreshing')));
      body.replaceChildren(...parts);
    } else {
      body.replaceChildren(ticket(game, null), el('div', { class: 'empty' }, el('h3', {}, t('game.empty')), el('p', {}, t('game.emptyHint'))));
    }
    return box;
  }
  const first = await load();
  let timer = null;
  if ((first?.status || game.status) === 'live') {
    timer = setInterval(async () => {
      try { game = (await api(`/games/${params.id}`)).game; } catch { /* keep */ }
      load();
    }, 60000);
  }
  return () => { if (timer) clearInterval(timer); };
}

export default [{ path: '/game/:id', titleKey: 'game.title', render }];
