import { t, registerStrings, el, api, loadCSS, fmtDateTime, fmtDate, getUser } from '../core.js';
import { miniCard } from './roster.js';

registerStrings({
  es: {
    'home.title': 'Inicio', 'home.heroKicker': 'Mavs desde Sudamérica', 'home.heroTitle': 'Día de partido, todos los días',
    'home.heroText': 'Estadísticas, foro, diario, prode y juegos para los hinchas de Dallas en Sudamérica.',
    'home.next': 'Próximo partido', 'home.last': 'Último resultado', 'home.noNext': 'Todavía no hay un próximo partido cargado.',
    'home.noLast': 'Todavía no hay resultados.', 'home.predict': 'Hacer mi prode', 'home.discuss': 'Foro del partido',
    'home.leaders': 'Líderes de Dallas', 'home.pts': 'Puntos', 'home.reb': 'Rebotes', 'home.ast': 'Asistencias',
    'home.days': 'días', 'home.hours': 'hs', 'home.min': 'min', 'home.sec': 'seg', 'home.tipoff': 'Salta la pelota', 'home.live': 'En juego o por empezar',
    'home.diary': 'Diario del partido', 'home.diaryAll': 'Ver todo el diario', 'home.noDiary': 'El diario se estrena pronto.',
    'home.play': 'Jugá y sumá', 'home.tStats': 'Estadísticas', 'home.tStatsD': 'Temporada por temporada, jugador por jugador',
    'home.tTateti': 'Tateti', 'home.tTatetiD': 'Ganále a la máquina con jugadores de Dallas',
    'home.tGuess': 'Adiviná el jugador', 'home.tGuessD': 'Un desafío nuevo cada día',
    'home.tRanking': 'Ranking', 'home.tRankingD': 'Quién manda en la comunidad',
    'home.top5': 'Top 5 del prode', 'home.topAll': 'Ver ranking completo', 'home.noTop': 'Nadie sumó puntos todavía. ¡Sé el primero!',
    'home.final': 'Final', 'home.home': 'Local', 'home.away': 'Visitante', 'home.matchday': 'Matchday', 'home.comments': 'comentarios',
  },
  en: {
    'home.title': 'Home', 'home.heroKicker': 'Mavs from South America', 'home.heroTitle': 'Matchday, every day',
    'home.heroText': 'Stats, forum, diary, prode and games for Dallas fans across South America.',
    'home.next': 'Next game', 'home.last': 'Last result', 'home.noNext': 'No upcoming game loaded yet.',
    'home.noLast': 'No results yet.', 'home.predict': 'Make my prode', 'home.discuss': 'Game forum',
    'home.leaders': 'Dallas leaders', 'home.pts': 'Points', 'home.reb': 'Rebounds', 'home.ast': 'Assists',
    'home.days': 'days', 'home.hours': 'hrs', 'home.min': 'min', 'home.sec': 'sec', 'home.tipoff': 'Tip-off', 'home.live': 'Live or about to start',
    'home.diary': 'Game diary', 'home.diaryAll': 'See the whole diary', 'home.noDiary': 'The diary opens soon.',
    'home.play': 'Play and score', 'home.tStats': 'Stats', 'home.tStatsD': 'Season by season, player by player',
    'home.tTateti': 'Tic-tac-toe', 'home.tTatetiD': 'Beat the machine with Dallas players',
    'home.tGuess': 'Guess the player', 'home.tGuessD': 'A new challenge every day',
    'home.tRanking': 'Ranking', 'home.tRankingD': 'Who rules the community',
    'home.top5': 'Prode top 5', 'home.topAll': 'See full ranking', 'home.noTop': 'Nobody has scored yet. Be the first!',
    'home.final': 'Final', 'home.home': 'Home', 'home.away': 'Away', 'home.matchday': 'Matchday', 'home.comments': 'comments',
  },
  pt: {
    'home.title': 'Início', 'home.heroKicker': 'Mavs da América do Sul', 'home.heroTitle': 'Dia de jogo, todos os dias',
    'home.heroText': 'Estatísticas, fórum, diário, bolão e jogos para os torcedores de Dallas na América do Sul.',
    'home.next': 'Próximo jogo', 'home.last': 'Último resultado', 'home.noNext': 'Ainda não há próximo jogo cadastrado.',
    'home.noLast': 'Ainda não há resultados.', 'home.predict': 'Fazer meu bolão', 'home.discuss': 'Fórum do jogo',
    'home.leaders': 'Líderes de Dallas', 'home.pts': 'Pontos', 'home.reb': 'Rebotes', 'home.ast': 'Assistências',
    'home.days': 'dias', 'home.hours': 'h', 'home.min': 'min', 'home.sec': 'seg', 'home.tipoff': 'Bola ao alto', 'home.live': 'Ao vivo ou por começar',
    'home.diary': 'Diário do jogo', 'home.diaryAll': 'Ver todo o diário', 'home.noDiary': 'O diário estreia em breve.',
    'home.play': 'Jogue e pontue', 'home.tStats': 'Estatísticas', 'home.tStatsD': 'Temporada por temporada, jogador por jogador',
    'home.tTateti': 'Jogo da velha', 'home.tTatetiD': 'Vença a máquina com jogadores de Dallas',
    'home.tGuess': 'Adivinhe o jogador', 'home.tGuessD': 'Um desafio novo por dia',
    'home.tRanking': 'Ranking', 'home.tRankingD': 'Quem manda na comunidade',
    'home.top5': 'Top 5 do bolão', 'home.topAll': 'Ver ranking completo', 'home.noTop': 'Ninguém pontuou ainda. Seja o primeiro!',
    'home.final': 'Final', 'home.home': 'Casa', 'home.away': 'Fora', 'home.matchday': 'Matchday', 'home.comments': 'comentários',
  },
});

const first = async path => { try { return await api(path); } catch { return null; } };

function countdown(iso) {
  const nums = {};
  const box = el('div', { class: 'cd', role: 'timer' });
  const parts = ['days', 'hours', 'min', 'sec'].map(k => { const v = el('b', {}, '00'); nums[k] = v; return el('div', {}, v, el('small', {}, t('home.' + k))); });
  box.append(...parts);
  const tick = () => {
    let s = Math.floor((new Date(iso) - Date.now()) / 1000);
    if (s <= 0) { box.replaceChildren(el('span', { class: 'cd-live' }, t('home.live'))); return false; }
    const p = n => String(n).padStart(2, '0');
    nums.days.textContent = p(Math.floor(s / 86400)); nums.hours.textContent = p(Math.floor(s % 86400 / 3600));
    nums.min.textContent = p(Math.floor(s % 3600 / 60)); nums.sec.textContent = p(s % 60);
    return true;
  };
  const h = setInterval(() => { if (!tick()) clearInterval(h); }, 1000); tick();
  return { box, stop: () => clearInterval(h) };
}

function tile(href, num, title, desc) {
  return el('a', { class: 'tile', href }, el('span', { class: 'tile-n outline-num', 'aria-hidden': 'true' }, num), el('h3', {}, title), el('p', {}, desc));
}

export default {
  path: '/', titleKey: 'home.title',
  async render(container) {
    loadCSS('/css/pages/home.css'); loadCSS('/css/pages/roster.css');
    const stops = [];
    container.classList.add('home');
    container.append(el('section', { class: 'hero' },
      el('div', { class: 'hero-copy' },
        el('span', { class: 'kicker' }, t('home.heroKicker')),
        el('h1', {}, t('home.heroTitle')),
        el('p', {}, t('home.heroText'))),
      el('div', { class: 'hero-art', 'aria-hidden': 'true' }, el('span', { class: 'outline-num' }, 'MS'), el('span', { class: 'stamp' }, t('home.matchday')))));

    const nextBox = el('div', { class: 'ticket ticket-dark next' }, el('div', { class: 'spinner' }));
    const lastBox = el('div', { class: 'ticket last' }, el('div', { class: 'spinner' }));
    const diaryBox = el('div', { class: 'stack' });
    const topBox = el('div', { class: 'card' });
    container.append(el('div', { class: 'grid-2 match-row' }, nextBox, lastBox));
    const rosterBox = el('div', { class: 'rs-strip', role: 'list' });
    container.append(el('section', { class: 'stack home-roster' },
      el('div', { class: 'row-between' }, el('h2', {}, t('roster.home')), el('a', { class: 'btn btn-ghost btn-sm', href: '#/roster' }, t('roster.all-link'))),
      rosterBox));
    container.append(el('section', { class: 'tiles' },
      tile('#/stats', 'A', t('home.tStats'), t('home.tStatsD')), tile('#/tateti', 'B', t('home.tTateti'), t('home.tTatetiD')),
      tile('#/guess', 'C', t('home.tGuess'), t('home.tGuessD')), tile('#/ranking', 'D', t('home.tRanking'), t('home.tRankingD'))));
    container.append(el('div', { class: 'grid-2 lower' },
      el('section', { class: 'stack' }, el('h2', {}, t('home.diary')), diaryBox),
      el('section', { class: 'stack' }, el('h2', {}, t('home.top5')), topBox)));

    const [nx, ls, di, lb, ro] = await Promise.all([
      first('/games?status=scheduled&limit=1'), first('/games?status=final&limit=1'), first('/diary?limit=3'), first('/prode/leaderboard'),
      first('/roster')]);
    // roster strip
    const squad = ro?.details || [];
    if (squad.length) rosterBox.append(...squad.map(miniCard));
    else rosterBox.closest('section').remove();

    // next
    const g = nx?.games?.[0];
    nextBox.replaceChildren();
    nextBox.append(el('span', { class: 'label' }, t('home.next')));
    if (!g) nextBox.append(el('p', { class: 'muted-light' }, t('home.noNext')));
    else {
      const cd = countdown(g.date); stops.push(cd.stop);
      nextBox.append(
        el('h2', { class: 'vs' }, el('span', {}, 'DAL'), el('i', {}, g.home ? t('common.vs') : t('common.at')), el('span', {}, g.opponent_abbr || g.opponent)),
        el('p', { class: 'opp' }, g.opponent + ' · ' + (g.home ? t('home.home') : t('home.away'))),
        el('p', { class: 'mono when' }, t('home.tipoff') + ': ' + fmtDateTime(g.date)), cd.box,
        el('div', { class: 'row' }, el('a', { class: 'btn btn-primary', href: '#/prode' }, t('home.predict')),
          el('a', { class: 'btn', href: '#/forum/' + g.id }, t('home.discuss'))));
    }
    // last
    const l = ls?.games?.[0];
    lastBox.replaceChildren(el('span', { class: 'label' }, t('home.last')));
    if (!l) lastBox.append(el('p', { class: 'muted' }, t('home.noLast')));
    else {
      const win = l.mavs_score > l.opp_score;
      lastBox.append(
        el('div', { class: 'score' }, el('span', { class: 'sc' }, el('small', {}, 'DAL'), l.mavs_score), el('span', { class: 'dash' }, '–'),
          el('span', { class: 'sc' }, el('small', {}, l.opponent_abbr), l.opp_score),
          el('span', { class: 'badge ' + (win ? 'badge-win' : 'badge-loss') }, win ? 'W' : 'L')),
        el('p', { class: 'muted' }, `${l.opponent} · ${fmtDate(l.date)}`));
      const ld = l.leaders;
      if (ld) lastBox.append(el('div', { class: 'leaders' }, [['points', 'home.pts'], ['rebounds', 'home.reb'], ['assists', 'home.ast']].filter(([k]) => ld[k]).map(([k, lab]) =>
        el('div', {}, el('b', { class: 'num' }, ld[k].value), el('small', {}, t(lab)), el('span', {}, ld[k].player)))));
      lastBox.append(el('a', { class: 'btn btn-sm', href: '#/forum/' + l.id }, t('home.discuss')));
    }
    // diary
    const es = di?.entries || [];
    if (!es.length) diaryBox.append(el('div', { class: 'empty' }, t('home.noDiary')));
    else es.forEach(e => diaryBox.append(el('a', { class: 'card diary-item', href: '#/diary/' + e.id },
      el('span', { class: 'mono muted' }, fmtDate(e.created_at)), el('h3', {}, e.title), e.subtitle ? el('p', { class: 'muted' }, e.subtitle) : null)));
    if (es.length) diaryBox.append(el('a', { class: 'btn btn-ghost btn-sm', href: '#/diary' }, t('home.diaryAll')));
    // top 5
    const rows = (lb?.rows || []).slice(0, 5);
    if (!rows.length) topBox.append(el('p', { class: 'muted' }, t('home.noTop')));
    else topBox.append(el('ol', { class: 'mini-lb' }, rows.map((r, i) => el('li', { class: getUser()?.username === r.username ? 'me' : '' },
      el('span', { class: 'pos' }, i + 1), el('span', { class: 'nm' }, r.username), el('span', { class: 'num' }, r.points + ' ' + t('common.pts'))))));
    topBox.append(el('a', { class: 'btn btn-ghost btn-sm', href: '#/ranking' }, t('home.topAll')));
    return () => stops.forEach(f => f());
  },
};
