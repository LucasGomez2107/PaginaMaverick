import { t, registerStrings, el, api, loadCSS, getUser } from '../core.js';

registerStrings({
  es: { 'ranking.title': 'Ranking', 'ranking.sub': 'Los mejores de la comunidad', 'ranking.prode': 'Prode', 'ranking.tateti': 'Tateti', 'ranking.guess': 'Adiviná', 'ranking.all': 'General',
    'ranking.user': 'Usuario', 'ranking.exact': 'Plenos', 'ranking.preds': 'Pronósticos', 'ranking.best': 'Mejor', 'ranking.plays': 'Partidas', 'ranking.total': 'Total', 'ranking.empty': 'Todavía no hay puntajes. ¡Jugá y aparecé acá!' },
  en: { 'ranking.title': 'Ranking', 'ranking.sub': 'The best of the community', 'ranking.prode': 'Prode', 'ranking.tateti': 'Tic-tac-toe', 'ranking.guess': 'Guess', 'ranking.all': 'Overall',
    'ranking.user': 'User', 'ranking.exact': 'Perfect', 'ranking.preds': 'Predictions', 'ranking.best': 'Best', 'ranking.plays': 'Plays', 'ranking.total': 'Total', 'ranking.empty': 'No scores yet. Play and show up here!' },
  pt: { 'ranking.title': 'Ranking', 'ranking.sub': 'Os melhores da comunidade', 'ranking.prode': 'Bolão', 'ranking.tateti': 'Jogo da velha', 'ranking.guess': 'Adivinhe', 'ranking.all': 'Geral',
    'ranking.user': 'Usuário', 'ranking.exact': 'Cravadas', 'ranking.preds': 'Palpites', 'ranking.best': 'Melhor', 'ranking.plays': 'Partidas', 'ranking.total': 'Total', 'ranking.empty': 'Ainda sem pontuações. Jogue e apareça aqui!' },
});

const TABS = ['prode', 'tateti', 'guess', 'all'];

function podium(rows, valKey) {
  const order = [rows[1], rows[0], rows[2]].map((r, i) => r && { r, rank: [2, 1, 3][i] }).filter(Boolean);
  const me = getUser()?.username;
  return el('div', { class: 'podium' }, order.map(({ r, rank }) => el('div', { class: `pod pod-${rank}` + (r.username === me ? ' me' : '') },
    el('span', { class: 'outline-num rk' }, rank), el('b', { class: 'pn' }, r.username), el('span', { class: 'num pv' }, r[valKey]))));
}

export default {
  path: '/ranking', titleKey: 'ranking.title',
  render(container, params, query) {
    loadCSS('/css/pages/leaderboard.css');
    let tab = TABS.includes(query.get('tab')) ? query.get('tab') : 'prode';
    const body = el('div', { class: 'stack' });
    const tabs = el('div', { class: 'tabs', role: 'tablist' });
    container.append(el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, 'Top'), el('h1', {}, t('ranking.title')), el('p', {}, t('ranking.sub'))), tabs, body);
    const drawTabs = () => tabs.replaceChildren(...TABS.map(k => el('button', { type: 'button', role: 'tab', 'aria-selected': String(k === tab), class: k === tab ? 'active' : '', onclick: () => { tab = k; drawTabs(); load(); } }, t('ranking.' + k))));
    async function load() {
      body.replaceChildren(el('div', { class: 'spinner' }));
      let rows = [];
      try {
        const r = tab === 'prode' ? await api('/prode/leaderboard') : await api('/scores/leaderboard?game=' + tab);
        rows = r.rows || [];
      } catch { rows = []; }
      body.replaceChildren();
      if (!rows.length) { body.append(el('div', { class: 'empty' }, t('ranking.empty'))); return; }
      const key = tab === 'prode' ? 'points' : 'total';
      const me = getUser()?.username;
      const cols = tab === 'prode' ? [['points', 'common.points'], ['exact', 'ranking.exact'], ['predictions', 'ranking.preds']] : [['total', 'ranking.total'], ['best', 'ranking.best'], ['plays', 'ranking.plays']];
      body.append(podium(rows.slice(0, 3), key));
      body.append(el('div', { class: 'table-wrap' }, el('table', { class: 'table-stats' },
        el('thead', {}, el('tr', {}, el('th', {}, '#'), el('th', {}, t('ranking.user')), cols.map(([k, l]) => el('th', { class: 'num' }, t(l))))),
        el('tbody', {}, rows.map((r, i) => el('tr', { class: r.username === me ? 'me' : '' }, el('td', { class: 'num' }, i + 1), el('td', {}, r.username), cols.map(([k]) => el('td', { class: 'num' }, r[k] ?? 0))))))));
    }
    drawTabs(); load();
  },
};
