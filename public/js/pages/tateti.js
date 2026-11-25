// Tateti Mavs: "immaculate grid" style tic-tac-toe with Dallas Mavericks players.
import { t, registerStrings, el, loadCSS } from '../core.js';
import {
  loadPlayers, generateGrid, criterionLabel, rarityBonus, playerInput, scoreBox,
} from '../games/players.js';

registerStrings({
  es: {
    'tateti.title': 'Tateti Mavs',
    'tateti.kicker': 'Mini-juego',
    'tateti.lead': 'Cada casilla cruza una fila y una columna. Nombrá a un jugador de los Mavs que cumpla las dos condiciones. Ningún jugador se repite en el tablero.',
    'tateti.tab2p': '2 jugadores', 'tateti.tabSolo': 'Solitario',
    'tateti.newGrid': 'Nueva grilla', 'tateti.reset': 'Reiniciar tablero', 'tateti.pass': 'Pasar turno',
    'tateti.timer': 'Reloj de 30 s', 'tateti.turn': 'Turno de {p}', 'tateti.pickCell': 'Elegí una casilla del tablero.',
    'tateti.cellFor': 'Casilla: {r} × {c}', 'tateti.placeholder': 'Escribí un jugador…', 'tateti.inputLabel': 'Nombre del jugador',
    'tateti.used': '{name} ya está en el tablero.', 'tateti.wrong': '{name} no cumple esa casilla.',
    'tateti.wrongTurn': '{name} no cumple esa casilla. Pierde el turno {p}.', 'tateti.timeout': 'Se acabó el tiempo. Pierde el turno {p}.',
    'tateti.right': '¡Bien! {name} entra.', 'tateti.win': '¡Ganó {p}! Tres en línea.', 'tateti.draw': 'Empate: tablero lleno sin tres en línea.',
    'tateti.score2p': 'Marcador', 'tateti.passed': '{p} pasó el turno.',
    'tateti.attempts': 'Intentos', 'tateti.attemptsLeft': 'Te quedan {n} intentos', 'tateti.points': 'Puntos',
    'tateti.soloRules': '12 intentos para llenar las 9 casillas. Cada acierto vale 10 pts + bonus por rareza (hasta +15). Grilla completa: +20.',
    'tateti.giveUp': 'Terminar', 'tateti.over': 'Fin del juego', 'tateti.final': 'Puntaje final',
    'tateti.correctOf': '{n} de 9 casillas', 'tateti.complete': '¡Grilla completa! +20',
    'tateti.showAnswers': 'Ver respuestas', 'tateti.hideAnswers': 'Ocultar respuestas', 'tateti.answers': 'Algunas respuestas válidas',
    'tateti.possible': '{n} posibles', 'tateti.rare': 'Rareza +{n}', 'tateti.loadError': 'No se pudo cargar la lista de jugadores.',
    'tateti.corner': 'MS', 'tateti.legendX': 'Jugador X', 'tateti.legendO': 'Jugador O', 'tateti.cellAria': 'Casilla {r} y {c}',
    'tateti.save.anon': 'Ingresá con tu cuenta para guardar tus puntos en el ranking.', 'tateti.save.login': 'Ingresar',
    'tateti.save.saving': 'Guardando puntaje…', 'tateti.save.ok': 'Puntaje guardado en el ranking ✓',
    'tateti.save.dup': 'Este puntaje ya estaba guardado.', 'tateti.save.err': 'No se pudo guardar el puntaje.',
    'tateti.c.team': 'Jugó en {team}', 'tateti.c.ppg15': '15+ puntos por partido en Dallas', 'tateti.c.ppg20': '20+ puntos por partido en Dallas',
    'tateti.c.rpg7': '7+ rebotes por partido en Dallas', 'tateti.c.apg5': '5+ asistencias por partido en Dallas',
    'tateti.c.gp300': '300+ partidos con Dallas', 'tateti.c.gp500': '500+ partidos con Dallas',
    'tateti.c.allStar': 'All-Star (en su carrera)', 'tateti.c.allStarMavs': 'All-Star con los Mavs',
    'tateti.c.champ2011': 'Campeón 2011', 'tateti.c.champion': 'Campeón NBA (con cualquier equipo)',
    'tateti.c.intl': 'Internacional (no estadounidense)', 'tateti.c.posG': 'Base o escolta (G)', 'tateti.c.posF': 'Alero o ala-pívot (F)',
    'tateti.c.posC': 'Pívot (C)', 'tateti.c.drafted': 'Drafteado por Dallas', 'tateti.c.top10': 'Elegido top 10 en el draft',
    'tateti.c.dec1980': 'Jugó en Dallas en los 80', 'tateti.c.dec1990': 'Jugó en Dallas en los 90', 'tateti.c.dec2000': 'Jugó en Dallas en los 2000',
    'tateti.c.dec2010': 'Jugó en Dallas en los 2010', 'tateti.c.dec2020': 'Jugó en Dallas en los 2020', 'tateti.c.mvp': 'MVP de la temporada',
  },
  en: {
    'tateti.title': 'Mavs Tic-Tac-Toe',
    'tateti.kicker': 'Mini-game',
    'tateti.lead': 'Every square crosses a row and a column. Name a Mavericks player who fits both. No player can be used twice on the board.',
    'tateti.tab2p': '2 players', 'tateti.tabSolo': 'Solo',
    'tateti.newGrid': 'New grid', 'tateti.reset': 'Reset board', 'tateti.pass': 'Pass turn',
    'tateti.timer': '30 s shot clock', 'tateti.turn': "{p}'s turn", 'tateti.pickCell': 'Pick a square on the board.',
    'tateti.cellFor': 'Square: {r} × {c}', 'tateti.placeholder': 'Type a player…', 'tateti.inputLabel': 'Player name',
    'tateti.used': '{name} is already on the board.', 'tateti.wrong': "{name} doesn't fit that square.",
    'tateti.wrongTurn': "{name} doesn't fit that square. {p} loses the turn.", 'tateti.timeout': 'Time is up. {p} loses the turn.',
    'tateti.right': 'Nice! {name} is in.', 'tateti.win': '{p} wins! Three in a row.', 'tateti.draw': 'Draw: board full, no three in a row.',
    'tateti.score2p': 'Scoreboard', 'tateti.passed': '{p} passed.',
    'tateti.attempts': 'Attempts', 'tateti.attemptsLeft': '{n} attempts left', 'tateti.points': 'Points',
    'tateti.soloRules': '12 attempts to fill all 9 squares. Each hit is worth 10 pts + a rarity bonus (up to +15). Full grid: +20.',
    'tateti.giveUp': 'Finish', 'tateti.over': 'Game over', 'tateti.final': 'Final score',
    'tateti.correctOf': '{n} of 9 squares', 'tateti.complete': 'Full grid! +20',
    'tateti.showAnswers': 'Show answers', 'tateti.hideAnswers': 'Hide answers', 'tateti.answers': 'Some valid answers',
    'tateti.possible': '{n} possible', 'tateti.rare': 'Rarity +{n}', 'tateti.loadError': 'Could not load the player list.',
    'tateti.corner': 'MS', 'tateti.legendX': 'Player X', 'tateti.legendO': 'Player O', 'tateti.cellAria': 'Square {r} and {c}',
    'tateti.save.anon': 'Log in to save your points to the ranking.', 'tateti.save.login': 'Log in',
    'tateti.save.saving': 'Saving score…', 'tateti.save.ok': 'Score saved to the ranking ✓',
    'tateti.save.dup': 'This score was already saved.', 'tateti.save.err': 'Could not save the score.',
    'tateti.c.team': 'Played for the {team}', 'tateti.c.ppg15': '15+ points per game in Dallas', 'tateti.c.ppg20': '20+ points per game in Dallas',
    'tateti.c.rpg7': '7+ rebounds per game in Dallas', 'tateti.c.apg5': '5+ assists per game in Dallas',
    'tateti.c.gp300': '300+ games with Dallas', 'tateti.c.gp500': '500+ games with Dallas',
    'tateti.c.allStar': 'All-Star (any time)', 'tateti.c.allStarMavs': 'All-Star with the Mavs',
    'tateti.c.champ2011': '2011 champion', 'tateti.c.champion': 'NBA champion (any team)',
    'tateti.c.intl': 'International (non-American)', 'tateti.c.posG': 'Guard (G)', 'tateti.c.posF': 'Forward (F)',
    'tateti.c.posC': 'Center (C)', 'tateti.c.drafted': 'Drafted by Dallas', 'tateti.c.top10': 'Top-10 draft pick',
    'tateti.c.dec1980': 'Played in Dallas in the 80s', 'tateti.c.dec1990': 'Played in Dallas in the 90s', 'tateti.c.dec2000': 'Played in Dallas in the 2000s',
    'tateti.c.dec2010': 'Played in Dallas in the 2010s', 'tateti.c.dec2020': 'Played in Dallas in the 2020s', 'tateti.c.mvp': 'League MVP',
  },
  pt: {
    'tateti.title': 'Jogo da Velha Mavs',
    'tateti.kicker': 'Mini-jogo',
    'tateti.lead': 'Cada casa cruza uma linha e uma coluna. Diga um jogador dos Mavs que cumpra as duas condições. Nenhum jogador se repete no tabuleiro.',
    'tateti.tab2p': '2 jogadores', 'tateti.tabSolo': 'Solo',
    'tateti.newGrid': 'Nova grade', 'tateti.reset': 'Reiniciar tabuleiro', 'tateti.pass': 'Passar a vez',
    'tateti.timer': 'Relógio de 30 s', 'tateti.turn': 'Vez de {p}', 'tateti.pickCell': 'Escolha uma casa do tabuleiro.',
    'tateti.cellFor': 'Casa: {r} × {c}', 'tateti.placeholder': 'Digite um jogador…', 'tateti.inputLabel': 'Nome do jogador',
    'tateti.used': '{name} já está no tabuleiro.', 'tateti.wrong': '{name} não cumpre essa casa.',
    'tateti.wrongTurn': '{name} não cumpre essa casa. {p} perde a vez.', 'tateti.timeout': 'O tempo acabou. {p} perde a vez.',
    'tateti.right': 'Boa! {name} entrou.', 'tateti.win': '{p} venceu! Três em linha.', 'tateti.draw': 'Empate: tabuleiro cheio sem três em linha.',
    'tateti.score2p': 'Placar', 'tateti.passed': '{p} passou a vez.',
    'tateti.attempts': 'Tentativas', 'tateti.attemptsLeft': 'Restam {n} tentativas', 'tateti.points': 'Pontos',
    'tateti.soloRules': '12 tentativas para preencher as 9 casas. Cada acerto vale 10 pts + bônus de raridade (até +15). Grade completa: +20.',
    'tateti.giveUp': 'Encerrar', 'tateti.over': 'Fim de jogo', 'tateti.final': 'Pontuação final',
    'tateti.correctOf': '{n} de 9 casas', 'tateti.complete': 'Grade completa! +20',
    'tateti.showAnswers': 'Ver respostas', 'tateti.hideAnswers': 'Ocultar respostas', 'tateti.answers': 'Algumas respostas válidas',
    'tateti.possible': '{n} possíveis', 'tateti.rare': 'Raridade +{n}', 'tateti.loadError': 'Não foi possível carregar a lista de jogadores.',
    'tateti.corner': 'MS', 'tateti.legendX': 'Jogador X', 'tateti.legendO': 'Jogador O', 'tateti.cellAria': 'Casa {r} e {c}',
    'tateti.save.anon': 'Entre com sua conta para salvar seus pontos no ranking.', 'tateti.save.login': 'Entrar',
    'tateti.save.saving': 'Salvando pontuação…', 'tateti.save.ok': 'Pontuação salva no ranking ✓',
    'tateti.save.dup': 'Esta pontuação já estava salva.', 'tateti.save.err': 'Não foi possível salvar a pontuação.',
    'tateti.c.team': 'Jogou nos {team}', 'tateti.c.ppg15': '15+ pontos por jogo em Dallas', 'tateti.c.ppg20': '20+ pontos por jogo em Dallas',
    'tateti.c.rpg7': '7+ rebotes por jogo em Dallas', 'tateti.c.apg5': '5+ assistências por jogo em Dallas',
    'tateti.c.gp300': '300+ jogos por Dallas', 'tateti.c.gp500': '500+ jogos por Dallas',
    'tateti.c.allStar': 'All-Star (na carreira)', 'tateti.c.allStarMavs': 'All-Star pelos Mavs',
    'tateti.c.champ2011': 'Campeão de 2011', 'tateti.c.champion': 'Campeão da NBA (qualquer time)',
    'tateti.c.intl': 'Internacional (não americano)', 'tateti.c.posG': 'Armador ou ala-armador (G)', 'tateti.c.posF': 'Ala ou ala-pivô (F)',
    'tateti.c.posC': 'Pivô (C)', 'tateti.c.drafted': 'Draftado por Dallas', 'tateti.c.top10': 'Escolha top 10 no draft',
    'tateti.c.dec1980': 'Jogou em Dallas nos anos 80', 'tateti.c.dec1990': 'Jogou em Dallas nos anos 90', 'tateti.c.dec2000': 'Jogou em Dallas nos anos 2000',
    'tateti.c.dec2010': 'Jogou em Dallas nos anos 2010', 'tateti.c.dec2020': 'Jogou em Dallas nos anos 2020', 'tateti.c.mvp': 'MVP da temporada',
  },
});

const TURN_MS = 30000;
const SOLO_ATTEMPTS = 12;
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

// Module-level state survives re-renders (language change) within the session.
const S = { mode: '2p', timerOn: true, two: null, solo: null };

function newTwo(players, keepWins) {
  return {
    grid: generateGrid(players), board: Array(9).fill(null), turn: 'X', selected: null,
    winner: null, line: null, draw: false, deadline: null, msg: null,
    wins: keepWins || { X: 0, O: 0 },
  };
}
function newSolo(players) {
  return {
    grid: generateGrid(players), board: Array(9).fill(null), attempts: 0, selected: null,
    done: false, save: null, msg: null, showAnswers: false, flash: null,
  };
}
const cellLabels = (g, i) => ({ r: criterionLabel(g.rows[Math.floor(i / 3)]), c: criterionLabel(g.cols[i % 3]) });
const usedIds = st => new Set(st.board.filter(Boolean).map(b => b.player.id));
const soloPoints = st => {
  const filled = st.board.filter(Boolean);
  return filled.reduce((s, b) => s + b.pts, 0) + (filled.length === 9 ? 20 : 0);
};

export default {
  path: '/tateti',
  titleKey: 'tateti.title',
  async render(container) {
    loadCSS('/css/pages/tateti.css');
    let timer = null;
    let alive = true;

    container.append(el('header', { class: 'page-head' },
      el('span', { class: 'kicker' }, t('tateti.kicker')),
      el('h1', {}, t('tateti.title')),
      el('p', {}, t('tateti.lead')),
    ));
    const loading = el('p', { class: 'muted' }, t('common.loading'));
    container.append(loading);

    let players;
    try { players = await loadPlayers(); } catch {
      loading.replaceWith(el('div', { class: 'card empty' }, t('tateti.loadError')));
      return;
    }
    if (!alive) return;
    if (!S.two) S.two = newTwo(players);
    if (!S.solo) S.solo = newSolo(players);

    const tabs = el('div', { class: 'tabs', role: 'tablist' });
    const area = el('div', { class: 'tt-area' });
    loading.replaceWith(tabs, area);

    function drawTabs() {
      tabs.replaceChildren(...[['2p', 'tateti.tab2p'], ['solo', 'tateti.tabSolo']].map(([m, k]) => el('button', {
        type: 'button', role: 'tab', class: S.mode === m ? 'active' : null, 'aria-selected': S.mode === m ? 'true' : 'false',
        onclick: () => { if (S.mode !== m) { S.mode = m; if (m === '2p') startTurn(S.two); drawTabs(); draw(); } },
      }, t(k))));
    }

    // ---------- shared board ----------
    function boardEl(st, { onCell, cellContent, cellClass }) {
      const g = st.grid;
      const kids = [el('div', { class: 'tt-corner', 'aria-hidden': 'true' }, el('span', {}, t('tateti.corner')))];
      g.cols.forEach(c => kids.push(el('div', { class: 'tt-head tt-col' }, el('span', {}, criterionLabel(c)))));
      for (let r = 0; r < 3; r++) {
        kids.push(el('div', { class: 'tt-head tt-row' }, el('span', {}, criterionLabel(g.rows[r]))));
        for (let c = 0; c < 3; c++) {
          const i = r * 3 + c;
          const lab = cellLabels(g, i);
          kids.push(el('button', {
            type: 'button', class: 'tt-cell ' + (cellClass(i) || ''),
            'aria-label': t('tateti.cellAria', lab), 'aria-pressed': st.selected === i ? 'true' : 'false',
            onclick: () => onCell(i),
          }, cellContent(i)));
        }
      }
      return el('div', { class: 'tt-court' }, el('div', { class: 'tt-board' }, kids));
    }

    function answersEl(st) {
      const g = st.grid;
      return el('div', { class: 'card tt-answers stack-sm' },
        el('h3', {}, t('tateti.answers')),
        el('ol', { class: 'tt-answer-list' }, g.cells.map((list, i) => {
          const lab = cellLabels(g, i);
          const sample = list.slice().sort((a, b) => b.mavs.gp - a.mavs.gp).slice(0, 6).map(p => p.name).join(', ');
          return el('li', {},
            el('strong', {}, `${lab.r} × ${lab.c}`), ' ',
            el('span', { class: 'badge' }, t('tateti.possible', { n: list.length })),
            el('div', { class: 'muted' }, sample));
        })));
    }

    function inputPanel(st, onPick, disabled) {
      const box = el('div', { class: 'tt-input stack-sm' });
      if (st.selected == null || disabled) {
        box.append(el('p', { class: 'muted' }, disabled ? '' : t('tateti.pickCell')));
        return { box, focus() {} };
      }
      const used = usedIds(st);
      const pi = playerInput(players, {
        placeholder: t('tateti.placeholder'), label: t('tateti.inputLabel'),
        isUsed: p => used.has(p.id), onPick,
      });
      box.append(el('p', { class: 'tt-cellfor' }, t('tateti.cellFor', cellLabels(st.grid, st.selected))), pi.root);
      return { box, focus: () => pi.focus() };
    }

    const msgEl = st => st.msg ? el('p', { class: `tt-msg tt-msg-${st.msg.type}`, role: 'status' }, st.msg.text) : el('p', { class: 'tt-msg', role: 'status' });

    // ---------- 2 players ----------
    function startTurn(st) { st.deadline = S.timerOn && !st.winner && !st.draw ? Date.now() + TURN_MS : null; }
    function endTurn(st) { st.turn = st.turn === 'X' ? 'O' : 'X'; st.selected = null; startTurn(st); }
    function checkEnd(st) {
      for (const ln of LINES) {
        if (ln.every(i => st.board[i] && st.board[i].owner === st.turn)) {
          st.winner = st.turn; st.line = ln; st.wins[st.turn]++; st.deadline = null;
          st.msg = { type: 'win', text: t('tateti.win', { p: st.turn }) };
          return true;
        }
      }
      if (st.board.every(Boolean)) { st.draw = true; st.deadline = null; st.msg = { type: 'info', text: t('tateti.draw') }; return true; }
      return false;
    }

    function drawTwo() {
      const st = S.two;
      const over = st.winner || st.draw;
      const pick = p => {
        const i = st.selected;
        if (i == null || over) return;
        if (usedIds(st).has(p.id)) { st.msg = { type: 'warn', text: t('tateti.used', { name: p.name }) }; draw(); return; }
        if (st.grid.cells[i].some(x => x.id === p.id)) {
          st.board[i] = { owner: st.turn, player: p };
          st.msg = { type: 'ok', text: t('tateti.right', { name: p.name }) };
          if (!checkEnd(st)) endTurn(st);
        } else {
          st.msg = { type: 'bad', text: t('tateti.wrongTurn', { name: p.name, p: st.turn }) };
          endTurn(st);
        }
        draw();
      };
      const board = boardEl(st, {
        onCell: i => { if (over || st.board[i]) return; st.selected = i; draw(true); },
        cellClass: i => [
          st.board[i] ? 'claimed own-' + st.board[i].owner : 'open',
          st.selected === i ? 'selected' : '',
          st.line && st.line.includes(i) ? 'winline' : '',
        ].join(' '),
        cellContent: i => st.board[i]
          ? [el('span', { class: 'tt-mark', 'aria-hidden': 'true' }, st.board[i].owner), el('span', { class: 'tt-pname' }, st.board[i].player.name)]
          : el('span', { class: 'tt-plus', 'aria-hidden': 'true' }, '+'),
      });
      const inp = inputPanel(st, pick, over);
      const clock = el('span', { class: 'tt-clock mono', 'aria-live': 'off' });
      const turnBox = el('div', { class: `tt-turn turn-${st.turn}` },
        over ? el('strong', {}, st.winner ? t('tateti.win', { p: st.winner }) : t('tateti.draw'))
          : [el('span', { class: 'tt-turn-mark' }, st.turn), el('strong', {}, t('tateti.turn', { p: st.turn })), clock]);
      const side = el('aside', { class: 'tt-side stack-sm' },
        el('div', { class: 'ticket tt-score' },
          el('span', { class: 'kicker' }, t('tateti.score2p')),
          el('div', { class: 'tt-scoreline' },
            el('span', { class: 'sx' }, el('i', {}, 'X'), el('b', {}, String(st.wins.X))),
            el('span', { class: 'muted' }, ':'),
            el('span', { class: 'so' }, el('b', {}, String(st.wins.O)), el('i', {}, 'O')))),
        turnBox,
        msgEl(st),
        inp.box,
        el('label', { class: 'tt-toggle' },
          el('input', {
            type: 'checkbox', checked: S.timerOn ? true : null,
            onchange: e => { S.timerOn = e.target.checked; startTurn(st); draw(); },
          }), ' ', t('tateti.timer')),
        el('div', { class: 'row' },
          !over ? el('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => { st.msg = { type: 'info', text: t('tateti.passed', { p: st.turn }) }; endTurn(st); draw(); } }, t('tateti.pass')) : null,
          el('button', { type: 'button', class: 'btn btn-sm', onclick: () => { S.two = { ...newTwo(players, st.wins), grid: st.grid }; startTurn(S.two); draw(); } }, t('tateti.reset')),
          el('button', { type: 'button', class: 'btn btn-primary btn-sm', onclick: () => { S.two = newTwo(players, st.wins); startTurn(S.two); draw(); } }, t('tateti.newGrid')),
        ),
      );
      const updateClock = () => {
        if (!st.deadline) { clock.textContent = ''; return; }
        const left = Math.max(0, st.deadline - Date.now());
        clock.textContent = `0:${String(Math.ceil(left / 1000)).padStart(2, '0')}`;
        clock.classList.toggle('low', left < 10000);
        if (left <= 0) {
          st.msg = { type: 'bad', text: t('tateti.timeout', { p: st.turn }) };
          endTurn(st);
          draw();
        }
      };
      if (S.timerOn && !over && !st.deadline) startTurn(st);
      if (st.deadline) clock.textContent = `0:${String(Math.max(0, Math.ceil((st.deadline - Date.now()) / 1000))).padStart(2, '0')}`;
      return { node: el('div', { class: 'tt-layout' }, board, side), focus: inp.focus, tick: st.deadline ? updateClock : null };
    }

    // ---------- solo ----------
    function drawSolo() {
      const st = S.solo;
      const left = SOLO_ATTEMPTS - st.attempts;
      const finish = () => { st.done = true; st.selected = null; };
      const pick = p => {
        const i = st.selected;
        if (i == null || st.done) return;
        if (usedIds(st).has(p.id)) { st.msg = { type: 'warn', text: t('tateti.used', { name: p.name }) }; draw(true); return; }
        st.attempts++;
        const list = st.grid.cells[i];
        if (list.some(x => x.id === p.id)) {
          const bonus = rarityBonus(list.length);
          st.board[i] = { player: p, pts: 10 + bonus, bonus };
          st.msg = { type: 'ok', text: t('tateti.right', { name: p.name }) };
          st.selected = null;
          st.flash = { i, ok: true };
        } else {
          st.msg = { type: 'bad', text: t('tateti.wrong', { name: p.name }) };
          st.flash = { i, ok: false };
        }
        if (st.board.every(Boolean) || st.attempts >= SOLO_ATTEMPTS) finish();
        draw(!st.done && st.selected != null);
      };
      const flash = st.flash; st.flash = null;
      const board = boardEl(st, {
        onCell: i => { if (st.done || st.board[i]) return; st.selected = i; draw(true); },
        cellClass: i => [
          st.board[i] ? 'claimed solo' : (st.done ? 'missed' : 'open'),
          st.selected === i ? 'selected' : '',
          flash && flash.i === i ? (flash.ok ? 'flash-ok' : 'shake') : '',
        ].join(' '),
        cellContent: i => {
          const b = st.board[i];
          if (b) return [el('span', { class: 'tt-pname' }, b.player.name), el('span', { class: 'tt-pts mono' }, `+${b.pts}`)];
          if (st.done && st.showAnswers) return el('span', { class: 'tt-hint' }, t('tateti.possible', { n: st.grid.cells[i].length }));
          return el('span', { class: 'tt-plus', 'aria-hidden': 'true' }, '+');
        },
      });
      const filled = st.board.filter(Boolean).length;
      const pts = soloPoints(st);
      const inp = inputPanel(st, pick, st.done);
      const dots = el('div', { class: 'tt-dots', 'aria-label': t('tateti.attemptsLeft', { n: left }) },
        Array.from({ length: SOLO_ATTEMPTS }, (_, k) => el('span', { class: k < st.attempts ? 'used' : '' })));
      const side = el('aside', { class: 'tt-side stack-sm' },
        el('div', { class: 'ticket tt-score' },
          el('span', { class: 'kicker' }, t('tateti.points')),
          el('div', { class: 'tt-bigpts' }, String(pts)),
          el('p', { class: 'muted mono' }, t('tateti.correctOf', { n: filled }))),
        el('div', { class: 'stack-sm' },
          el('strong', {}, t('tateti.attemptsLeft', { n: left })), dots),
        st.done ? null : el('p', { class: 'muted tt-rules' }, t('tateti.soloRules')),
        msgEl(st),
        inp.box,
        st.done ? endBox(st, pts, filled) : null,
        el('div', { class: 'row' },
          !st.done ? el('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => { finish(); draw(); } }, t('tateti.giveUp')) : null,
          st.done ? el('button', { type: 'button', class: 'btn btn-sm', onclick: () => { st.showAnswers = !st.showAnswers; draw(); } }, t(st.showAnswers ? 'tateti.hideAnswers' : 'tateti.showAnswers')) : null,
          el('button', { type: 'button', class: 'btn btn-primary btn-sm', onclick: () => { S.solo = newSolo(players); draw(); } }, t('tateti.newGrid')),
        ),
      );
      const wrap = el('div', { class: 'stack' }, el('div', { class: 'tt-layout' }, board, side), st.done && st.showAnswers ? answersEl(st) : null);
      return { node: wrap, focus: inp.focus };
    }

    function endBox(st, pts, filled) {
      const box = el('div', { class: 'ticket ticket-dark tt-end stack-sm' },
        el('span', { class: 'kicker' }, t('tateti.over')),
        el('div', { class: 'tt-end-pts' }, el('span', {}, t('tateti.final')), el('b', {}, String(pts))),
        filled === 9 ? el('p', {}, t('tateti.complete')) : null);
      if (!st.save) st.save = {};
      box.append(scoreBox('tateti', 'tateti', pts, {
        correct: filled, attempts: st.attempts,
        grid: { rows: st.grid.rows.map(c => c.id), cols: st.grid.cols.map(c => c.id) },
      }, { route: '/tateti', state: st.save }));
      return box;
    }

    function draw(focusInput) {
      if (!alive) return;
      if (timer) { clearInterval(timer); timer = null; }
      const view = S.mode === '2p' ? drawTwo() : drawSolo();
      area.replaceChildren(view.node);
      if (view.tick) timer = setInterval(view.tick, 250);
      if (focusInput) view.focus();
    }

    drawTabs();
    draw();
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  },
};

