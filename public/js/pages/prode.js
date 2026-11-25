import { el, t, api, registerStrings, getUser, requireLogin, toast, loadCSS, fmtDate, fmtDateTime } from '../core.js';

registerStrings({
  es: {
    'prode.title': 'Prode', 'prode.kicker': 'Pronosticá y sumá', 'prode.h1': 'El Prode de los Mavs',
    'prode.rulesTitle': 'Cómo se juega', 'prode.r1': 'Ganador del partido: 3 pts', 'prode.r2': 'Líder de los Mavs en puntos, rebotes y asistencias: 2 pts cada uno',
    'prode.r3': 'Pleno (los 4 aciertos): +3 pts de bonus. Máximo 12 por partido', 'prode.r4': 'Necesitás una cuenta. Podés cambiar tu pronóstico hasta el salto inicial.',
    'prode.upcoming': 'Próximos partidos', 'prode.none': 'No hay partidos programados por ahora.', 'prode.winner': '¿Quién gana?',
    'prode.dal': 'Mavericks', 'prode.points': 'Máx. anotador', 'prode.rebounds': 'Máx. reboteador', 'prode.assists': 'Máx. asistidor',
    'prode.choose': 'Elegir jugador…', 'prode.save': 'Guardar pronóstico', 'prode.saved': 'Pronóstico guardado', 'prode.locked': 'Cerrado', 'prode.savedTag': 'Guardado',
    'prode.fillAll': 'Completá ganador y los tres líderes', 'prode.mine': 'Mis pronósticos', 'prode.mineEmpty': 'Todavía no pronosticaste ningún partido.',
    'prode.pending': 'Pendiente', 'prode.pts': '{n} pts', 'prode.leaderboard': 'Tabla de posiciones', 'prode.lbEmpty': 'Todavía no hay puntajes.',
    'prode.user': 'Usuario', 'prode.total': 'Pts', 'prode.played': 'Jug.', 'prode.exact': 'Plenos', 'prode.game': 'Partido', 'prode.pick': 'Tu elección',
    'prode.loginHint': 'Iniciá sesión para pronosticar',
  },
  en: {
    'prode.title': 'Prode', 'prode.kicker': 'Predict and score', 'prode.h1': 'The Mavs Prode',
    'prode.rulesTitle': 'How it works', 'prode.r1': 'Game winner: 3 pts', 'prode.r2': 'Mavs leader in points, rebounds and assists: 2 pts each',
    'prode.r3': 'Perfect pick (all 4 right): +3 bonus. Max 12 per game', 'prode.r4': 'Account required. You can change your pick until tip-off.',
    'prode.upcoming': 'Upcoming games', 'prode.none': 'No scheduled games right now.', 'prode.winner': 'Who wins?',
    'prode.dal': 'Mavericks', 'prode.points': 'Top scorer', 'prode.rebounds': 'Top rebounder', 'prode.assists': 'Top passer',
    'prode.choose': 'Choose player…', 'prode.save': 'Save prediction', 'prode.saved': 'Prediction saved', 'prode.locked': 'Closed', 'prode.savedTag': 'Saved',
    'prode.fillAll': 'Pick a winner and all three leaders', 'prode.mine': 'My predictions', 'prode.mineEmpty': 'You have not predicted any game yet.',
    'prode.pending': 'Pending', 'prode.pts': '{n} pts', 'prode.leaderboard': 'Leaderboard', 'prode.lbEmpty': 'No scores yet.',
    'prode.user': 'User', 'prode.total': 'Pts', 'prode.played': 'Pld', 'prode.exact': 'Perfect', 'prode.game': 'Game', 'prode.pick': 'Your pick',
    'prode.loginHint': 'Log in to predict',
  },
  pt: {
    'prode.title': 'Bolão', 'prode.kicker': 'Palpite e pontue', 'prode.h1': 'O Bolão dos Mavs',
    'prode.rulesTitle': 'Como funciona', 'prode.r1': 'Vencedor do jogo: 3 pts', 'prode.r2': 'Líder dos Mavs em pontos, rebotes e assistências: 2 pts cada',
    'prode.r3': 'Cravada (os 4 acertos): +3 de bônus. Máximo de 12 por jogo', 'prode.r4': 'Precisa de conta. Você pode mudar o palpite até a bola ao alto.',
    'prode.upcoming': 'Próximos jogos', 'prode.none': 'Nenhum jogo agendado por enquanto.', 'prode.winner': 'Quem ganha?',
    'prode.dal': 'Mavericks', 'prode.points': 'Cestinha', 'prode.rebounds': 'Líder em rebotes', 'prode.assists': 'Líder em assistências',
    'prode.choose': 'Escolher jogador…', 'prode.save': 'Salvar palpite', 'prode.saved': 'Palpite salvo', 'prode.locked': 'Fechado', 'prode.savedTag': 'Salvo',
    'prode.fillAll': 'Escolha o vencedor e os três líderes', 'prode.mine': 'Meus palpites', 'prode.mineEmpty': 'Você ainda não palpitou em nenhum jogo.',
    'prode.pending': 'Pendente', 'prode.pts': '{n} pts', 'prode.leaderboard': 'Classificação', 'prode.lbEmpty': 'Ainda sem pontuações.',
    'prode.user': 'Usuário', 'prode.total': 'Pts', 'prode.played': 'J', 'prode.exact': 'Cravadas', 'prode.game': 'Jogo', 'prode.pick': 'Seu palpite',
    'prode.loginHint': 'Entre para palpitar',
  },
});

function rules() {
  return el('section', { class: 'ticket pr-rules stack' },
    el('span', { class: 'kicker' }, t('prode.rulesTitle')),
    el('div', { class: 'pr-rule-grid' },
      el('div', { class: 'pr-rule' }, el('b', {}, '3'), el('span', {}, t('prode.r1'))),
      el('div', { class: 'pr-rule' }, el('b', {}, '3×2'), el('span', {}, t('prode.r2'))),
      el('div', { class: 'pr-rule' }, el('b', {}, '+3'), el('span', {}, t('prode.r3')))),
    el('p', { class: 'muted pr-r4' }, t('prode.r4')));
}

function gameCard(g, roster, pred) {
  const user = getUser();
  const locked = g.locked;
  let winner = pred?.winner || null;
  const sel = {};
  const mkSel = (k) => {
    const s = el('select', { class: 'select', disabled: locked || !user, 'aria-label': t(`prode.${k}`) },
      el('option', { value: '' }, t('prode.choose')), roster.map(p => el('option', { value: p }, p)));
    const cur = pred?.[`top_${k}`];
    if (cur) { if (!roster.includes(cur)) s.append(el('option', { value: cur }, cur)); s.value = cur; }
    sel[k] = s; return s;
  };
  const wBtn = (val, label) => el('button', { type: 'button', class: `pr-w ${winner === val ? 'on' : ''}`, 'data-w': val, disabled: locked || !user, onclick: () => {
    winner = val; card.querySelectorAll('.pr-w').forEach(b => b.classList.toggle('on', b.dataset.w === val));
  } }, label);
  const tag = el('span', { class: 'badge badge-win' }, '✓ ' + t('prode.savedTag'));
  tag.hidden = !pred;
  const saveBtn = el('button', { class: 'btn btn-primary', type: 'submit', disabled: locked || !user }, t('prode.save'));
  const card = el('form', { class: `ticket pr-game stack ${locked ? 'is-locked' : ''}`, onsubmit: async ev => {
    ev.preventDefault();
    if (!winner || !sel.points.value || !sel.rebounds.value || !sel.assists.value) { toast(t('prode.fillAll'), 'error'); return; }
    saveBtn.disabled = true;
    try {
      const r = await api(`/prode/games/${g.id}`, { method: 'POST', body: { winner, top_points: sel.points.value, top_rebounds: sel.rebounds.value, top_assists: sel.assists.value } });
      toast(t('prode.saved'), 'ok'); tag.hidden = false; return r;
    } catch (e) { toast(e.message, 'error'); } finally { saveBtn.disabled = false; }
  } },
    el('div', { class: 'row pr-game-head' },
      el('span', { class: 'kicker' }, fmtDateTime(g.date)),
      locked ? el('span', { class: 'badge' }, '🔒 ' + t('prode.locked')) : null),
    el('h3', { class: 'pr-vs' }, `Mavericks ${g.home ? t('common.vs') : t('common.at')} ${g.opponent}`),
    el('div', { class: 'stack' }, el('span', { class: 'pr-label' }, t('prode.winner')),
      el('div', { class: 'pr-winner' }, wBtn('DAL', t('prode.dal')), wBtn('OPP', g.opponent_abbr || g.opponent))),
    el('div', { class: 'grid grid-3 pr-sels' },
      ['points', 'rebounds', 'assists'].map(k => el('label', { class: 'field' }, el('span', {}, t(`prode.${k}`)), mkSel(k)))),
    el('div', { class: 'row' }, user ? saveBtn : el('span', { class: 'muted' }, t('prode.loginHint')), tag));
  return card;
}

async function renderProde(container) {
  loadCSS('/css/pages/prode.css');
  const wrap = el('div', { class: 'prode-page stack' },
    el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, t('prode.kicker')), el('h1', {}, t('prode.h1'))), rules());
  container.append(wrap);
  const user = getUser();

  // games
  const gamesBox = el('section', { class: 'stack' }, el('h2', { class: 'pr-h2' }, t('prode.upcoming')), el('div', { class: 'spinner' }));
  wrap.append(gamesBox);
  if (!user) requireLogin(wrap);
  const mineBox = el('section', { class: 'stack' });
  const lbBox = el('section', { class: 'stack' }, el('h2', { class: 'pr-h2' }, t('prode.leaderboard')), el('div', { class: 'spinner' }));
  wrap.append(mineBox, lbBox);

  (async () => {
    try {
      const [{ games }, rosterRes] = await Promise.all([api('/games?status=scheduled&limit=10'), api('/roster').catch(() => ({ players: [] }))]);
      const roster = rosterRes.players || [];
      const preds = await Promise.all(games.map(g => user ? api(`/prode/games/${g.id}`).then(r => r.prediction).catch(() => null) : null));
      gamesBox.querySelector('.spinner')?.remove();
      if (!games.length) gamesBox.append(el('div', { class: 'empty' }, t('prode.none')));
      else gamesBox.append(el('div', { class: 'grid grid-2' }, games.map((g, i) => gameCard(g, roster, preds[i]))));
    } catch (e) { gamesBox.querySelector('.spinner')?.remove(); gamesBox.append(el('div', { class: 'empty' }, e.message)); }
  })();

  if (user) (async () => {
    mineBox.append(el('h2', { class: 'pr-h2' }, t('prode.mine')));
    try {
      const { predictions } = await api('/prode/mine');
      if (!predictions.length) { mineBox.append(el('div', { class: 'empty' }, t('prode.mineEmpty'))); return; }
      mineBox.append(el('div', { class: 'table-wrap' }, el('table', { class: 'table-stats' },
        el('thead', {}, el('tr', {}, el('th', {}, t('prode.game')), el('th', {}, t('prode.pick')), el('th', { class: 'num' }, t('prode.total')))),
        el('tbody', {}, predictions.map(p => el('tr', {},
          el('td', {}, p.game ? [el('a', { href: `#/forum/${p.game.id}` }, `${p.game.opponent_abbr || p.game.opponent}`), el('span', { class: 'muted' }, ` · ${fmtDate(p.game.date)}${p.game.status === 'final' ? ` · ${p.game.mavs_score}-${p.game.opp_score}` : ''}`)] : p.game_id),
          el('td', { class: 'pr-pick' }, `${p.winner === 'DAL' ? 'DAL' : (p.game?.opponent_abbr || 'OPP')} · ${p.top_points} / ${p.top_rebounds} / ${p.top_assists}`),
          el('td', { class: 'num' }, p.points_awarded == null ? el('span', { class: 'muted' }, t('prode.pending')) : el('span', { class: `badge ${p.points_awarded > 0 ? 'badge-win' : ''}` }, p.points_awarded))))))));
    } catch (e) { mineBox.append(el('div', { class: 'empty' }, e.message)); }
  })();

  (async () => {
    try {
      const { rows } = await api('/prode/leaderboard');
      lbBox.querySelector('.spinner')?.remove();
      const top = (rows || []).slice(0, 10);
      if (!top.length) { lbBox.append(el('div', { class: 'empty' }, t('prode.lbEmpty'))); return; }
      lbBox.append(el('div', { class: 'table-wrap' }, el('table', { class: 'table-stats' },
        el('thead', {}, el('tr', {}, el('th', {}, '#'), el('th', {}, t('prode.user')), el('th', { class: 'num' }, t('prode.total')), el('th', { class: 'num' }, t('prode.played')), el('th', { class: 'num' }, t('prode.exact')))),
        el('tbody', {}, top.map((r, i) => el('tr', { class: i === 0 ? 'pr-first' : '' },
          el('td', { class: 'num' }, i + 1), el('td', {}, r.username), el('td', { class: 'num' }, r.points), el('td', { class: 'num' }, r.predictions), el('td', { class: 'num' }, r.exact)))))));
    } catch (e) { lbBox.querySelector('.spinner')?.remove(); lbBox.append(el('div', { class: 'empty' }, e.message)); }
  })();
}

export default { path: '/prode', titleKey: 'prode.title', render: renderProde };
