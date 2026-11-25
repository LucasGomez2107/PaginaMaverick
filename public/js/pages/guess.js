// Adiviná el jugador: guess the Mavericks player from a silhouette + progressive clues.
import { t, registerStrings, el, loadCSS, getLang, fmtNum } from '../core.js';
import {
  loadPlayers, playerInput, scoreBox, flag, teamLabel, jerseyLabel, seasonLabel, hashString,
} from '../games/players.js';

registerStrings({
  es: {
    'guess.title': 'Adiviná el jugador', 'guess.kicker': 'Mini-juego',
    'guess.lead': '¿Quién es la sombra? Cada error destapa una pista nueva. Cuantos menos intentos, más puntos.',
    'guess.tabDaily': 'Desafío diario', 'guess.tabFree': 'Libre',
    'guess.placeholder': 'Escribí un jugador de los Mavs…', 'guess.inputLabel': 'Tu respuesta',
    'guess.attempt': 'Intento {n} de {max}', 'guess.giveUp': 'Me rindo', 'guess.next': 'Otro jugador',
    'guess.already': 'Ya probaste con {name}.', 'guess.wrong': 'No es {name}: se destapa una pista.',
    'guess.win': '¡Era {name}!', 'guess.lose': 'La respuesta: {name}', 'guess.points': '{n} pts',
    'guess.wonIn': 'Lo sacaste en {n} intento(s).', 'guess.lostMsg': 'Esta vez no salió. ¡Revancha!',
    'guess.clues': 'Pistas', 'guess.locked': 'Se destapa con el error n.º {n}',
    'guess.c1': 'Posición', 'guess.c2': 'Años en Dallas', 'guess.c3': 'País', 'guess.c4': 'Camiseta',
    'guess.c5': 'Otros equipos', 'guess.c6': 'Números en Dallas', 'guess.c7': 'Draft', 'guess.c8': 'Iniciales',
    'guess.onlyDal': 'Solo jugó en Dallas', 'guess.undrafted': 'No fue drafteado',
    'guess.draftLine': 'Draft {year}, pick n.º {pick}', 'guess.draftDal': '(elegido por Dallas)',
    'guess.seasons': '{n} temporada(s)', 'guess.statsLine': '{gp} PJ · {ppg} PTS · {rpg} REB · {ast} AST',
    'guess.table': 'Tus intentos', 'guess.thPlayer': 'Jugador', 'guess.thPos': 'Pos', 'guess.thHeight': 'Altura',
    'guess.thEra': 'Llegó', 'guess.thPpg': 'PPG', 'guess.thCountry': 'País',
    'guess.higher': 'mayor', 'guess.lower': 'menor', 'guess.later': 'después', 'guess.earlier': 'antes',
    'guess.legend': 'Verde: coincide · Amarillo: cerca · ▲▼: el jugador oculto tiene más / menos (o llegó después / antes).',
    'guess.dailyDone': 'Ya jugaste el desafío de hoy.', 'guess.nextIn': 'Próximo desafío en {t}',
    'guess.dailyInfo': 'Desafío del {date}: el mismo jugador para todos. Un solo intento por día.',
    'guess.freeInfo': 'Modo libre: jugadores al azar, sin límite.',
    'guess.silAlt': 'Silueta de un jugador de básquet, de {h} m', 'guess.ruler': 'm',
    'guess.pos.PG': 'Base', 'guess.pos.SG': 'Escolta', 'guess.pos.SF': 'Alero', 'guess.pos.PF': 'Ala-pívot', 'guess.pos.C': 'Pívot',
    'guess.loadError': 'No se pudo cargar la lista de jugadores.',
    'guess.save.anon': 'Ingresá con tu cuenta para guardar tus puntos en el ranking.', 'guess.save.login': 'Ingresar',
    'guess.save.saving': 'Guardando puntaje…', 'guess.save.ok': 'Puntaje guardado en el ranking ✓',
    'guess.save.dup': 'Ya habías guardado el desafío de hoy.', 'guess.save.err': 'No se pudo guardar el puntaje.',
  },
  en: {
    'guess.title': 'Guess the player', 'guess.kicker': 'Mini-game',
    'guess.lead': 'Who is the silhouette? Every miss reveals a new clue. Fewer tries, more points.',
    'guess.tabDaily': 'Daily challenge', 'guess.tabFree': 'Free play',
    'guess.placeholder': 'Type a Mavs player…', 'guess.inputLabel': 'Your answer',
    'guess.attempt': 'Try {n} of {max}', 'guess.giveUp': 'Give up', 'guess.next': 'Another player',
    'guess.already': 'You already tried {name}.', 'guess.wrong': "It's not {name}: a clue is revealed.",
    'guess.win': 'It was {name}!', 'guess.lose': 'The answer: {name}', 'guess.points': '{n} pts',
    'guess.wonIn': 'You got it in {n} tries.', 'guess.lostMsg': 'Not this time. Run it back!',
    'guess.clues': 'Clues', 'guess.locked': 'Unlocks after miss #{n}',
    'guess.c1': 'Position', 'guess.c2': 'Years in Dallas', 'guess.c3': 'Country', 'guess.c4': 'Jersey',
    'guess.c5': 'Other teams', 'guess.c6': 'Dallas numbers', 'guess.c7': 'Draft', 'guess.c8': 'Initials',
    'guess.onlyDal': 'Only played for Dallas', 'guess.undrafted': 'Undrafted',
    'guess.draftLine': '{year} draft, pick #{pick}', 'guess.draftDal': '(taken by Dallas)',
    'guess.seasons': '{n} season(s)', 'guess.statsLine': '{gp} GP · {ppg} PTS · {rpg} REB · {ast} AST',
    'guess.table': 'Your tries', 'guess.thPlayer': 'Player', 'guess.thPos': 'Pos', 'guess.thHeight': 'Height',
    'guess.thEra': 'Joined', 'guess.thPpg': 'PPG', 'guess.thCountry': 'Country',
    'guess.higher': 'higher', 'guess.lower': 'lower', 'guess.later': 'later', 'guess.earlier': 'earlier',
    'guess.legend': 'Green: match · Yellow: close · ▲▼: the hidden player has more / less (or joined later / earlier).',
    'guess.dailyDone': "You already played today's challenge.", 'guess.nextIn': 'Next challenge in {t}',
    'guess.dailyInfo': 'Challenge for {date}: the same player for everyone. One shot per day.',
    'guess.freeInfo': 'Free play: random players, no limit.',
    'guess.silAlt': 'Silhouette of a basketball player, {h} m tall', 'guess.ruler': 'm',
    'guess.pos.PG': 'Point guard', 'guess.pos.SG': 'Shooting guard', 'guess.pos.SF': 'Small forward', 'guess.pos.PF': 'Power forward', 'guess.pos.C': 'Center',
    'guess.loadError': 'Could not load the player list.',
    'guess.save.anon': 'Log in to save your points to the ranking.', 'guess.save.login': 'Log in',
    'guess.save.saving': 'Saving score…', 'guess.save.ok': 'Score saved to the ranking ✓',
    'guess.save.dup': "Today's challenge was already saved.", 'guess.save.err': 'Could not save the score.',
  },
  pt: {
    'guess.title': 'Adivinhe o jogador', 'guess.kicker': 'Mini-jogo',
    'guess.lead': 'Quem é a sombra? Cada erro revela uma nova pista. Menos tentativas, mais pontos.',
    'guess.tabDaily': 'Desafio diário', 'guess.tabFree': 'Livre',
    'guess.placeholder': 'Digite um jogador dos Mavs…', 'guess.inputLabel': 'Sua resposta',
    'guess.attempt': 'Tentativa {n} de {max}', 'guess.giveUp': 'Desisto', 'guess.next': 'Outro jogador',
    'guess.already': 'Você já tentou {name}.', 'guess.wrong': 'Não é {name}: uma pista foi revelada.',
    'guess.win': 'Era {name}!', 'guess.lose': 'A resposta: {name}', 'guess.points': '{n} pts',
    'guess.wonIn': 'Você acertou em {n} tentativa(s).', 'guess.lostMsg': 'Não foi dessa vez. Revanche!',
    'guess.clues': 'Pistas', 'guess.locked': 'Revelada após o erro n.º {n}',
    'guess.c1': 'Posição', 'guess.c2': 'Anos em Dallas', 'guess.c3': 'País', 'guess.c4': 'Camisa',
    'guess.c5': 'Outros times', 'guess.c6': 'Números em Dallas', 'guess.c7': 'Draft', 'guess.c8': 'Iniciais',
    'guess.onlyDal': 'Só jogou em Dallas', 'guess.undrafted': 'Não foi draftado',
    'guess.draftLine': 'Draft de {year}, escolha n.º {pick}', 'guess.draftDal': '(escolhido por Dallas)',
    'guess.seasons': '{n} temporada(s)', 'guess.statsLine': '{gp} J · {ppg} PTS · {rpg} REB · {ast} AST',
    'guess.table': 'Suas tentativas', 'guess.thPlayer': 'Jogador', 'guess.thPos': 'Pos', 'guess.thHeight': 'Altura',
    'guess.thEra': 'Chegou', 'guess.thPpg': 'PPG', 'guess.thCountry': 'País',
    'guess.higher': 'maior', 'guess.lower': 'menor', 'guess.later': 'depois', 'guess.earlier': 'antes',
    'guess.legend': 'Verde: igual · Amarelo: perto · ▲▼: o jogador oculto tem mais / menos (ou chegou depois / antes).',
    'guess.dailyDone': 'Você já jogou o desafio de hoje.', 'guess.nextIn': 'Próximo desafio em {t}',
    'guess.dailyInfo': 'Desafio de {date}: o mesmo jogador para todos. Uma tentativa por dia.',
    'guess.freeInfo': 'Modo livre: jogadores aleatórios, sem limite.',
    'guess.silAlt': 'Silhueta de um jogador de basquete, de {h} m', 'guess.ruler': 'm',
    'guess.pos.PG': 'Armador', 'guess.pos.SG': 'Ala-armador', 'guess.pos.SF': 'Ala', 'guess.pos.PF': 'Ala-pivô', 'guess.pos.C': 'Pivô',
    'guess.loadError': 'Não foi possível carregar a lista de jogadores.',
    'guess.save.anon': 'Entre com sua conta para salvar seus pontos no ranking.', 'guess.save.login': 'Entrar',
    'guess.save.saving': 'Salvando pontuação…', 'guess.save.ok': 'Pontuação salva no ranking ✓',
    'guess.save.dup': 'O desafio de hoje já estava salvo.', 'guess.save.err': 'Não foi possível salvar a pontuação.',
  },
});

const MAX_TRIES = 9;          // 8 misses reveal 8 clues, the 9th miss loses
const DAILY_KEY = 'mavs_guess_daily_v1';
const S = { mode: 'daily', free: null, daily: null };

const todayUTC = () => new Date().toISOString().slice(0, 10);
const lsGet = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

export function dailyPlayer(players, date) {
  const pool = players.filter(p => p.mavs && p.mavs.gp >= 100).sort((a, b) => a.id.localeCompare(b.id));
  return pool[hashString('mavsudamerica-guess:' + date) % pool.length];
}
export function pointsFor(won, wrong) { return won ? Math.max(10, 100 - 12 * wrong) : 0; }

const wrongCount = g => g.guesses.length - (g.won ? 1 : 0);

// ---------- silhouette ----------
// Joint coordinates in a unit where standing height = 100 (y up is negative, feet at 0).
const POSES = {
  G: { // dribbling
    head: [5, -89], neck: [3, -81], sh: [[-7, -77], [10, -75]], hip: [[-7, -47], [5, -47]],
    legs: [[[-7, -47], [-15, -25], [-20, 0]], [[5, -47], [11, -24], [15, 0]]],
    arms: [[[-7, -77], [-18, -62], [-25, -54]], [[10, -75], [19, -57], [23, -41]]],
    ball: [25, -15], tilt: 8,
  },
  F: { // jump shot
    head: [0, -96], neck: [0, -89], sh: [[-10, -84], [10, -84]], hip: [[-6, -55], [6, -55]],
    legs: [[[-6, -55], [-9, -32], [-6, -10]], [[6, -55], [10, -33], [14, -12]]],
    arms: [[[-10, -84], [-12, -101], [-2, -115]], [[10, -84], [14, -102], [6, -116]]],
    ball: [2, -122], tilt: 0,
  },
  C: { // rebounding
    head: [0, -93], neck: [0, -86], sh: [[-12, -81], [12, -81]], hip: [[-8, -51], [8, -51]],
    legs: [[[-8, -51], [-15, -27], [-19, 0]], [[8, -51], [15, -27], [19, 0]]],
    arms: [[[-12, -81], [-22, -100], [-9, -119]], [[12, -81], [22, -100], [9, -119]]],
    ball: [0, -125], tilt: 0,
  },
};

export function silhouette(player, showNumber) {
  const NS = { svg: true };
  const W = 320, GROUND = 330, PX_PER_CM = 0.98; // 229 cm → ~224 px, leaves room for raised arms
  const H = player.heightCm * PX_PER_CM;
  const k = H / 100;
  const pose = POSES[player.posGroup] || POSES.F;
  const P = ([x, y]) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`;
  const line = (pts, w) => el('polyline', { ...NS, points: pts.map(P).join(' '), fill: 'none', 'stroke-width': (w * k).toFixed(1), class: 'sil-limb' });
  const [sl, sr] = pose.sh, [hl, hr] = pose.hip;
  const jerseyNo = showNumber ? String((player.jersey || [])[0] ?? '?') : '?';
  const cx = (sl[0] + sr[0] + hl[0] + hr[0]) / 4, cy = (sl[1] + hl[1]) / 2;
  const lerp = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
  const [legL, legR] = pose.legs;
  const kL = lerp(legL[0], legL[1], 0.62), kR = lerp(legR[0], legR[1], 0.62);
  const shorts = [[hl[0] - 3, hl[1] - 3], [hr[0] + 3, hr[1] - 3], [kR[0] + 5.5, kR[1]], [(kL[0] + kR[0]) / 2, Math.max(kL[1], kR[1]) - 9], [kL[0] - 5.5, kL[1]]];
  const dot = (pt, r, cls = 'sil-body') => el('circle', { ...NS, cx: (pt[0] * k).toFixed(1), cy: (pt[1] * k).toFixed(1), r: (r * k).toFixed(1), class: cls });
  const midY = (sl[1] + hl[1]) / 2;
  const torsoPath = `M${P([sl[0] - 1, sl[1] - 1])} L${P([sr[0] + 1, sr[1] - 1])} Q${P([sr[0] + 1, midY])} ${P([hr[0] + 2, hr[1]])} L${P([hl[0] - 2, hl[1]])} Q${P([sl[0] - 1, midY])} ${P([sl[0] - 1, sl[1] - 1])} Z`;

  const figure = el('g', { ...NS, transform: `translate(${W / 2 + 18},${GROUND})`, class: 'sil-fig' },
    // legs behind torso
    pose.legs.map(l => [line([l[0], l[1]], 12), line([l[1], l[2]], 9), dot(l[1], 5.2),
      line([[l[2][0] - 2, l[2][1] - 1], [l[2][0] + 5, l[2][1] - 1]], 6)]),
    el('polygon', { ...NS, points: shorts.map(P).join(' '), class: 'sil-shorts', 'stroke-width': (1.5 * k).toFixed(1) }),
    line([pose.neck, [pose.neck[0], pose.neck[1] + 5]], 7.5),
    el('path', { ...NS, d: torsoPath, class: 'sil-jersey', 'stroke-width': (2.4 * k).toFixed(1) }),
    el('text', {
      ...NS, x: (cx * k).toFixed(1), y: ((cy + 4) * k).toFixed(1), class: 'sil-num' + (showNumber ? ' shown' : ''),
      'font-size': (13 * k).toFixed(1), 'text-anchor': 'middle',
    }, jerseyNo),
    pose.arms.map(a => [dot(a[0], 5), line([a[0], a[1]], 8), line([a[1], a[2]], 6.5), dot(a[2], 3.6)]),
    dot(pose.head, 7),
    dot(pose.ball, 5.8, 'sil-ball'),
    el('path', {
      ...NS, class: 'sil-ball-seam', 'stroke-width': (0.9 * k).toFixed(1),
      d: `M${P([pose.ball[0] - 5.8, pose.ball[1]])} L${P([pose.ball[0] + 5.8, pose.ball[1]])} M${P([pose.ball[0], pose.ball[1] - 5.8])} L${P([pose.ball[0], pose.ball[1] + 5.8])}`,
    }),
  );

  // height ruler: 180 / 200 / 220 cm marks
  const ruler = el('g', { ...NS, class: 'sil-ruler' },
    el('line', { ...NS, x1: 34, x2: 34, y1: GROUND, y2: GROUND - 235 * PX_PER_CM }),
    [180, 200, 220].map(cm => el('g', { ...NS },
      el('line', { ...NS, x1: 28, x2: 300, y1: GROUND - cm * PX_PER_CM, y2: GROUND - cm * PX_PER_CM, class: 'sil-tick' }),
      el('text', { ...NS, x: 30, y: GROUND - cm * PX_PER_CM - 4, class: 'sil-tick-label' }, (cm / 100).toFixed(1) + ' ' + t('guess.ruler')))),
  );
  const h = (player.heightCm / 100).toFixed(2);
  return el('svg', { ...NS, viewBox: `0 0 ${W} 360`, class: 'sil-svg', role: 'img', 'aria-label': t('guess.silAlt', { h }) },
    el('defs', { ...NS },
      el('radialGradient', { ...NS, id: 'sil-spot', cx: '50%', cy: '8%', r: '85%' },
        el('stop', { ...NS, offset: '0', 'stop-color': '#3f74b5', 'stop-opacity': '.95' }),
        el('stop', { ...NS, offset: '.45', 'stop-color': '#123a6b', 'stop-opacity': '.85' }),
        el('stop', { ...NS, offset: '1', 'stop-color': '#030c18', 'stop-opacity': '1' })),
      el('linearGradient', { ...NS, id: 'sil-beam', x1: '0', y1: '0', x2: '0', y2: '1' },
        el('stop', { ...NS, offset: '0', 'stop-color': '#fff', 'stop-opacity': '.28' }),
        el('stop', { ...NS, offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }))),
    el('rect', { ...NS, x: 0, y: 0, width: W, height: 360, fill: 'url(#sil-spot)' }),
    el('polygon', { ...NS, points: `${W / 2 - 22},0 ${W / 2 + 58},0 ${W / 2 + 140},${GROUND + 12} ${W / 2 - 104},${GROUND + 12}`, fill: 'url(#sil-beam)' }),
    el('ellipse', { ...NS, cx: W / 2 + 18, cy: GROUND + 4, rx: 112, ry: 14, class: 'sil-floorlight' }),
    el('rect', { ...NS, x: 0, y: GROUND + 4, width: W, height: 360 - GROUND, class: 'sil-floor' }),
    ruler,
    el('ellipse', { ...NS, cx: W / 2 + 18, cy: GROUND + 3, rx: 40, ry: 5, class: 'sil-shadow' }),
    figure,
  );
}

// ---------- clues ----------
function stintsLabel(p) {
  const ys = p._years || [];
  const runs = [];
  for (const y of ys) {
    const last = runs[runs.length - 1];
    if (last && y === last[1] + 1) last[1] = y; else runs.push([y, y]);
  }
  return runs.map(([a, b]) => a === b ? seasonLabel(a) : `${a}–${b + 1}`).join(', ');
}
function countryName(p) {
  try { return new Intl.DisplayNames([getLang()], { type: 'region' }).of(p.countryCode) || p.country; } catch { return p.country; }
}
function initials(name) {
  return name.replace(/\b(Jr\.?|Sr\.?|II|III|IV)$/i, '').split(/[\s.]+/).filter(Boolean).map(w => w[0].toUpperCase() + '.').join(' ');
}
function clueValue(p, n) {
  switch (n) {
    case 1: return `${p.pos} · ${t('guess.pos.' + p.pos)}`;
    case 2: return `${stintsLabel(p)} · ${t('guess.seasons', { n: (p._years || []).length })}`;
    case 3: return `${flag(p.countryCode)} ${countryName(p)}`;
    case 4: return jerseyLabel(p);
    case 5: {
      const other = (p.teams || []).filter(x => x !== 'DAL');
      return other.length ? other.map(teamLabel).join(' · ') : t('guess.onlyDal');
    }
    case 6: return t('guess.statsLine', { gp: p.mavs.gp, ppg: fmtNum(p.mavs.ppg), rpg: fmtNum(p.mavs.rpg), ast: fmtNum(p.mavs.apg) });
    case 7: return p.draftPick == null ? t('guess.undrafted')
      : `${t('guess.draftLine', { year: p.draftYear, pick: p.draftPick })}${p.draftedByMavs ? ' ' + t('guess.draftDal') : ''}`;
    case 8: return initials(p.name);
    default: return '';
  }
}

// ---------- comparison ----------
function compare(g, target) {
  const arrow = (gv, tv) => tv > gv ? '▲' : tv < gv ? '▼' : '';
  const pos = g.pos === target.pos ? 'hit' : g.posGroup === target.posGroup ? 'near' : 'miss';
  const dh = target.heightCm - g.heightCm;
  const height = { cls: dh === 0 ? 'hit' : Math.abs(dh) <= 3 ? 'near' : 'miss', arrow: arrow(g.heightCm, target.heightCm), sr: dh > 0 ? 'higher' : dh < 0 ? 'lower' : '' };
  const gy = g._years[0], ty = target._years[0];
  const overlap = g._years.some(y => target._years.includes(y));
  const era = { cls: gy === ty ? 'hit' : overlap ? 'near' : 'miss', arrow: arrow(gy, ty), sr: ty > gy ? 'later' : ty < gy ? 'earlier' : '' };
  const dp = target.mavs.ppg - g.mavs.ppg;
  const ppg = { cls: Math.abs(dp) < 0.05 ? 'hit' : Math.abs(dp) <= 2 ? 'near' : 'miss', arrow: Math.abs(dp) < 0.05 ? '' : arrow(g.mavs.ppg, target.mavs.ppg), sr: dp > 0.05 ? 'higher' : dp < -0.05 ? 'lower' : '' };
  const country = g.countryCode === target.countryCode ? 'hit' : 'miss';
  return { pos, height, era, ppg, country };
}

function guessTable(game, byId) {
  const target = byId.get(game.targetId);
  const cell = (cls, text, arrow, sr) => el('td', { class: 'gx ' + cls },
    el('span', {}, text), arrow ? el('span', { class: 'gx-arrow', 'aria-hidden': 'true' }, arrow) : null,
    sr ? el('span', { class: 'sr-only' }, ' (' + t('guess.' + sr) + ')') : null);
  const rows = game.guesses.slice().reverse().map(id => {
    const g = byId.get(id);
    if (!g) return null;
    const c = compare(g, target);
    const right = g.id === target.id;
    return el('tr', { class: right ? 'gx-right' : null },
      el('th', { scope: 'row', class: 'gx-name' }, g.name),
      cell(c.pos, g.pos),
      cell(c.height.cls, (g.heightCm / 100).toFixed(2), c.height.arrow, c.height.sr),
      cell(c.era.cls, String(g._years[0]), c.era.arrow, c.era.sr),
      cell(c.ppg.cls, fmtNum(g.mavs.ppg), c.ppg.arrow, c.ppg.sr),
      cell(c.country, flag(g.countryCode) || g.countryCode));
  });
  return el('div', { class: 'card gx-card stack-sm' },
    el('h3', {}, t('guess.table')),
    el('div', { class: 'table-wrap' }, el('table', { class: 'gx-table' },
      el('thead', {}, el('tr', {}, ['thPlayer', 'thPos', 'thHeight', 'thEra', 'thPpg', 'thCountry'].map(k => el('th', { scope: 'col' }, t('guess.' + k))))),
      el('tbody', {}, rows))),
    el('p', { class: 'muted gx-legend' }, t('guess.legend')));
}

// ---------- page ----------
export default {
  path: '/guess',
  titleKey: 'guess.title',
  async render(container) {
    loadCSS('/css/pages/guess.css');
    let alive = true;
    let tick = null;
    container.append(el('header', { class: 'page-head' },
      el('span', { class: 'kicker' }, t('guess.kicker')),
      el('h1', {}, t('guess.title')),
      el('p', {}, t('guess.lead'))));
    const loading = el('p', { class: 'muted' }, t('common.loading'));
    container.append(loading);
    let players;
    try { players = await loadPlayers(); } catch {
      loading.replaceWith(el('div', { class: 'card empty' }, t('guess.loadError')));
      return;
    }
    if (!alive) return;
    const byId = new Map(players.map(p => [p.id, p]));

    const tabs = el('div', { class: 'tabs', role: 'tablist' });
    const area = el('div', { class: 'gs-area' });
    loading.replaceWith(tabs, area);

    function dailyGame() {
      const date = todayUTC();
      if (S.daily && S.daily.date === date) return S.daily;
      const target = dailyPlayer(players, date);
      let g = lsGet(DAILY_KEY);
      if (!g || g.date !== date || g.targetId !== target.id || !Array.isArray(g.guesses)) {
        g = { date, targetId: target.id, guesses: [], done: false, won: false };
        lsSet(DAILY_KEY, g);
      }
      g.guesses = g.guesses.filter(id => byId.has(id));
      g.daily = true;
      g.save = {};
      S.daily = g;
      return g;
    }
    function newFree(prevId) {
      let p;
      do { p = players[Math.floor(Math.random() * players.length)]; } while (players.length > 1 && p.id === prevId);
      return { targetId: p.id, guesses: [], done: false, won: false, daily: false, save: {} };
    }
    // The daily score-box state lives in memory only; the server rejects duplicates (409) anyway.
    function current() {
      if (S.mode === 'daily') return dailyGame();
      if (!S.free) S.free = newFree();
      return S.free;
    }
    function persist(g) {
      if (g.daily) lsSet(DAILY_KEY, { date: g.date, targetId: g.targetId, guesses: g.guesses, done: g.done, won: g.won, points: g.points });
    }

    function drawTabs() {
      tabs.replaceChildren(...[['daily', 'guess.tabDaily'], ['free', 'guess.tabFree']].map(([m, k]) => el('button', {
        type: 'button', role: 'tab', class: S.mode === m ? 'active' : null, 'aria-selected': S.mode === m ? 'true' : 'false',
        onclick: () => { if (S.mode !== m) { S.mode = m; drawTabs(); draw(); } },
      }, t(k))));
    }

    function draw(focus) {
      if (!alive) return;
      if (tick) { clearInterval(tick); tick = null; }
      const g = current();
      const target = byId.get(g.targetId);
      const wrong = wrongCount(g);
      const revealedClues = g.done ? 8 : Math.min(8, wrong);
      let msg = g.msg || null;
      g.msg = null;

      const submit = p => {
        if (g.done) return;
        if (g.guesses.includes(p.id)) { g.msg = { type: 'warn', text: t('guess.already', { name: p.name }) }; draw(true); return; }
        g.guesses.push(p.id);
        if (p.id === target.id) { g.won = true; g.done = true; }
        else if (g.guesses.length >= MAX_TRIES) { g.done = true; }
        else g.msg = { type: 'bad', text: t('guess.wrong', { name: p.name }) };
        if (g.done) g.points = pointsFor(g.won, wrongCount(g));
        persist(g);
        draw(!g.done);
      };
      const giveUp = () => { if (g.done) return; g.done = true; g.won = false; g.points = 0; persist(g); draw(); };

      // stage (silhouette)
      const stage = el('div', { class: 'gs-stage' + (g.done ? (g.won ? ' won' : ' lost') : '') },
        silhouette(target, g.done || revealedClues >= 4),
        g.done ? el('div', { class: 'gs-reveal' },
          el('span', { class: 'gs-reveal-name' }, target.name),
          el('span', { class: 'gs-reveal-sub mono' }, `${jerseyLabel(target)} · ${stintsLabel(target)}`)) : null);

      // clues
      const clues = el('ol', { class: 'gs-clues' }, Array.from({ length: 8 }, (_, i) => {
        const n = i + 1;
        const open = n <= revealedClues;
        return el('li', { class: 'gs-clue' + (open ? ' open' : '') },
          el('span', { class: 'gs-clue-n mono' }, String(n)),
          el('div', {},
            el('span', { class: 'gs-clue-label' }, t('guess.c' + n)),
            el('span', { class: 'gs-clue-val' }, open ? clueValue(target, n) : t('guess.locked', { n }))));
      }));

      // controls
      const ctrl = el('div', { class: 'gs-ctrl stack-sm' });
      const info = el('p', { class: 'muted gs-info' }, S.mode === 'daily' ? t('guess.dailyInfo', { date: g.date }) : t('guess.freeInfo'));
      let input = null;
      if (!g.done) {
        input = playerInput(players, {
          placeholder: t('guess.placeholder'), label: t('guess.inputLabel'),
          isUsed: p => g.guesses.includes(p.id), onPick: submit,
        });
        ctrl.append(
          el('div', { class: 'row row-between' },
            el('strong', { class: 'gs-try' }, t('guess.attempt', { n: g.guesses.length + 1, max: MAX_TRIES })),
            el('div', { class: 'gs-lives', 'aria-hidden': 'true' },
              Array.from({ length: MAX_TRIES }, (_, i) => el('span', { class: i < g.guesses.length ? 'used' : '' })))),
          input.root,
          msg ? el('p', { class: `gs-msg gs-msg-${msg.type}`, role: 'status' }, msg.text) : el('p', { class: 'gs-msg', role: 'status' }),
          el('div', { class: 'row' }, el('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: giveUp }, t('guess.giveUp'))));
      } else {
        const pts = g.points ?? pointsFor(g.won, wrongCount(g));
        const end = el('div', { class: 'ticket ticket-dark gs-end stack-sm' },
          el('span', { class: 'kicker' }, g.won ? t('guess.win', { name: target.name }) : t('guess.lose', { name: target.name })),
          el('div', { class: 'gs-end-pts' }, el('b', {}, String(pts)), el('span', {}, t('common.pts'))),
          el('p', {}, g.won ? t('guess.wonIn', { n: g.guesses.length }) : t('guess.lostMsg')));
        end.append(scoreBox('guess', 'guess', pts,
          g.daily ? { daily: true, date: g.date, tries: g.guesses.length, won: g.won }
            : { daily: false, player: target.id, tries: g.guesses.length, won: g.won },
          { route: '/guess', state: g.save }));
        ctrl.append(end);
        if (g.daily) {
          const cd = el('p', { class: 'mono gs-countdown' });
          const upd = () => {
            const now = new Date();
            const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
            const s = Math.max(0, Math.floor((next - now) / 1000));
            if (s === 0 && todayUTC() !== g.date) { draw(); return; }
            const hh = String(Math.floor(s / 3600)).padStart(2, '0'), mm = String(Math.floor(s / 60) % 60).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
            cd.textContent = t('guess.nextIn', { t: `${hh}:${mm}:${ss}` });
          };
          upd();
          tick = setInterval(upd, 1000);
          ctrl.append(el('p', { class: 'muted' }, t('guess.dailyDone')), cd,
            el('button', { type: 'button', class: 'btn btn-sm', onclick: () => { S.mode = 'free'; S.free = newFree(); drawTabs(); draw(); } }, t('guess.tabFree')));
        } else {
          ctrl.append(el('button', { type: 'button', class: 'btn btn-primary', onclick: () => { S.free = newFree(g.targetId); draw(true); } }, t('guess.next')));
        }
      }

      area.replaceChildren(el('div', { class: 'gs-layout' },
        el('div', { class: 'gs-left stack' }, stage, info),
        el('div', { class: 'gs-right stack' },
          ctrl,
          el('div', { class: 'card gs-clue-card' }, el('h3', {}, t('guess.clues')), clues),
          g.guesses.length ? guessTable(g, byId) : null)));
      if (focus && input) input.focus();
    }

    drawTabs();
    draw();
    return () => { alive = false; if (tick) clearInterval(tick); };
  },
};
