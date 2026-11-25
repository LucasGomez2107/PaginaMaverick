import { t, registerStrings, el, api, loadCSS, requireLogin, getUser, getLang, setLang, LANGS, fmtDate } from '../core.js';

registerStrings({
  es: { 'profile.title': 'Mi perfil', 'profile.since': 'Miembro desde {d}', 'profile.tateti': 'Tateti', 'profile.guess': 'Adiviná', 'profile.prode': 'Prode',
    'profile.recent': 'Últimos puntajes', 'profile.preds': 'Mis pronósticos', 'profile.noScores': 'Todavía no jugaste. ¡Probá el Tateti!', 'profile.noPreds': 'Todavía no hiciste ningún pronóstico.',
    'profile.lang': 'Idioma preferido', 'profile.pending': 'pendiente', 'profile.game': 'Juego' },
  en: { 'profile.title': 'My profile', 'profile.since': 'Member since {d}', 'profile.tateti': 'Tic-tac-toe', 'profile.guess': 'Guess', 'profile.prode': 'Prode',
    'profile.recent': 'Recent scores', 'profile.preds': 'My predictions', 'profile.noScores': "You haven't played yet. Try Tic-tac-toe!", 'profile.noPreds': 'No predictions yet.',
    'profile.lang': 'Preferred language', 'profile.pending': 'pending', 'profile.game': 'Game' },
  pt: { 'profile.title': 'Meu perfil', 'profile.since': 'Membro desde {d}', 'profile.tateti': 'Jogo da velha', 'profile.guess': 'Adivinhe', 'profile.prode': 'Bolão',
    'profile.recent': 'Últimas pontuações', 'profile.preds': 'Meus palpites', 'profile.noScores': 'Você ainda não jogou. Experimente o Jogo da velha!', 'profile.noPreds': 'Ainda sem palpites.',
    'profile.lang': 'Idioma preferido', 'profile.pending': 'pendente', 'profile.game': 'Jogo' },
});

export default {
  path: '/profile', titleKey: 'profile.title',
  async render(container) {
    loadCSS('/css/pages/profile.css');
    if (requireLogin(container)) return;
    const u = getUser();
    container.append(el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, t('profile.title')), el('h1', {}, u.username),
      el('p', {}, t('profile.since', { d: fmtDate(u.created_at) }))));
    const stats = el('div', { class: 'grid-3' }), recent = el('div', { class: 'card' }), preds = el('div', { class: 'card' });
    const langSel = el('div', { class: 'row' }, LANGS.map(l => el('button', { class: 'chip' + (getLang() === l ? ' active' : ''), type: 'button', 'aria-pressed': String(getLang() === l), onclick: () => setLang(l) },
      l === 'es' ? 'Español' : l === 'en' ? 'English' : 'Português')));
    container.append(stats, el('div', { class: 'card lang-card' }, el('h3', {}, t('profile.lang')), langSel),
      el('div', { class: 'grid-2' }, el('section', { class: 'stack' }, el('h2', {}, t('profile.recent')), recent), el('section', { class: 'stack' }, el('h2', {}, t('profile.preds')), preds)));
    const [sc, pr] = await Promise.all([api('/scores/me').catch(() => null), api('/prode/mine').catch(() => null)]);
    const tot = sc?.totals || {};
    [['tateti', 'profile.tateti'], ['guess', 'profile.guess'], ['prode', 'profile.prode']].forEach(([k, lab]) =>
      stats.append(el('div', { class: 'ticket stat' }, el('span', { class: 'mono muted' }, t(lab)), el('b', { class: 'outline-num big' }, tot[k] ?? 0), el('span', { class: 'muted' }, t('common.pts')))));
    const list = sc?.scores || [];
    if (!list.length) recent.append(el('p', { class: 'muted' }, t('profile.noScores')));
    else recent.append(el('ul', { class: 'plain-list' }, list.slice(0, 10).map(s => el('li', {},
      el('span', { class: 'badge badge-navy' }, s.game), el('span', { class: 'muted' }, fmtDate(s.created_at)), el('b', { class: 'num' }, '+' + s.points)))));
    const pl = pr?.predictions || [];
    if (!pl.length) preds.append(el('p', { class: 'muted' }, t('profile.noPreds')));
    else preds.append(el('ul', { class: 'plain-list' }, pl.slice(0, 10).map(p => el('li', {},
      el('span', {}, p.game ? `${t('common.vs')} ${p.game.opponent_abbr || p.game.opponent}` : '#' + p.game_id),
      el('span', { class: 'muted' }, p.game ? fmtDate(p.game.date) : ''),
      el('b', { class: 'num' }, p.points_awarded == null ? t('profile.pending') : '+' + p.points_awarded)))));
  },
};
