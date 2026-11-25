import { el, t, api, registerStrings, isAdmin, toast, loadCSS, fmtDateTime, navigate } from '../core.js';
import { renderMarkdown } from '../lib/markdown.js';

registerStrings({
  es: {
    'admin.title': 'Admin', 'admin.kicker': 'Sala de prensa', 'admin.h1': 'Panel de administración', 'admin.forbidden': 'Acceso solo para administradores.',
    'admin.tab.games': 'Partidos', 'admin.tab.diary': 'Diario', 'admin.tab.roster': 'Plantel', 'admin.tab.dallas': 'Dallas',
    'admin.newGame': 'Nuevo partido', 'admin.date': 'Fecha y hora (tu zona)', 'admin.opponent': 'Rival', 'admin.abbr': 'Sigla', 'admin.home': 'Local', 'admin.season': 'Temporada',
    'admin.create': 'Crear', 'admin.created': 'Creado', 'admin.updated': 'Guardado', 'admin.deleted': 'Borrado', 'admin.confirm': '¿Seguro?',
    'admin.sync': 'Sincronizar ESPN', 'admin.syncOk': 'Sincronizado: {n} partidos importados', 'admin.syncErr': 'Error de sincronización: {e}',
    'admin.demo': 'Borrar datos demo', 'admin.demoDone': 'Datos demo borrados', 'admin.demoConfirm': '¿Borrar todos los datos de demostración?',
    'admin.status': 'Estado', 'admin.scheduled': 'Programado', 'admin.live': 'En vivo', 'admin.final': 'Final',
    'admin.mavsScore': 'Puntos Mavs', 'admin.oppScore': 'Puntos rival', 'admin.leaderPts': 'Líder puntos', 'admin.leaderReb': 'Líder rebotes', 'admin.leaderAst': 'Líder asistencias',
    'admin.value': 'Valor', 'admin.leadersHint': 'En empates, separá los nombres con " / "', 'admin.noGames': 'No hay partidos.', 'admin.diaryId': 'Diario',
    'admin.newEntry': 'Nueva nota', 'admin.editEntry': 'Editando nota #{id}', 'admin.noEntries': 'No hay notas.', 'admin.etitle': 'Título', 'admin.subtitle': 'Subtítulo',
    'admin.game': 'Partido', 'admin.noGame': '— sin partido —', 'admin.lang': 'Idioma', 'admin.body': 'Cuerpo (markdown liviano)', 'admin.preview': 'Vista previa',
    'admin.bodyHint': 'Párrafos separados por línea en blanco, "## Título", "- lista", **negrita**', 'admin.reset': 'Nueva', 'admin.view': 'Ver',
    'admin.rosterHint': 'Un jugador por línea.', 'admin.rosterSaved': 'Plantel guardado ({n} jugadores)',
    'admin.dallasHint': 'Último resultado por equipo. El override manual pisa a ESPN.', 'admin.opp': 'Rival', 'admin.score': 'Mavs/Equipo', 'admin.oppScore2': 'Rival (pts)',
    'admin.result': 'Resultado', 'admin.override': 'Guardar override', 'admin.clear': 'Quitar override', 'admin.manual': 'manual', 'admin.espn': 'ESPN', 'admin.noTeamData': 'Sin datos',
    'admin.edit': 'Editar resultado',
  },
  en: {
    'admin.title': 'Admin', 'admin.kicker': 'Press room', 'admin.h1': 'Admin panel', 'admin.forbidden': 'Administrators only.',
    'admin.tab.games': 'Games', 'admin.tab.diary': 'Diary', 'admin.tab.roster': 'Roster', 'admin.tab.dallas': 'Dallas',
    'admin.newGame': 'New game', 'admin.date': 'Date & time (your zone)', 'admin.opponent': 'Opponent', 'admin.abbr': 'Abbr', 'admin.home': 'Home', 'admin.season': 'Season',
    'admin.create': 'Create', 'admin.created': 'Created', 'admin.updated': 'Saved', 'admin.deleted': 'Deleted', 'admin.confirm': 'Are you sure?',
    'admin.sync': 'Sync ESPN', 'admin.syncOk': 'Synced: {n} games imported', 'admin.syncErr': 'Sync error: {e}',
    'admin.demo': 'Delete demo data', 'admin.demoDone': 'Demo data deleted', 'admin.demoConfirm': 'Delete all demo data?',
    'admin.status': 'Status', 'admin.scheduled': 'Scheduled', 'admin.live': 'Live', 'admin.final': 'Final',
    'admin.mavsScore': 'Mavs score', 'admin.oppScore': 'Opp score', 'admin.leaderPts': 'Points leader', 'admin.leaderReb': 'Rebounds leader', 'admin.leaderAst': 'Assists leader',
    'admin.value': 'Value', 'admin.leadersHint': 'For ties, separate names with " / "', 'admin.noGames': 'No games.', 'admin.diaryId': 'Diary',
    'admin.newEntry': 'New story', 'admin.editEntry': 'Editing story #{id}', 'admin.noEntries': 'No stories.', 'admin.etitle': 'Title', 'admin.subtitle': 'Subtitle',
    'admin.game': 'Game', 'admin.noGame': '— no game —', 'admin.lang': 'Language', 'admin.body': 'Body (light markdown)', 'admin.preview': 'Preview',
    'admin.bodyHint': 'Paragraphs split by blank line, "## Heading", "- list", **bold**', 'admin.reset': 'New', 'admin.view': 'View',
    'admin.rosterHint': 'One player per line.', 'admin.rosterSaved': 'Roster saved ({n} players)',
    'admin.dallasHint': 'Latest result per team. A manual override beats ESPN.', 'admin.opp': 'Opponent', 'admin.score': 'Team score', 'admin.oppScore2': 'Opp score',
    'admin.result': 'Result', 'admin.override': 'Save override', 'admin.clear': 'Remove override', 'admin.manual': 'manual', 'admin.espn': 'ESPN', 'admin.noTeamData': 'No data',
    'admin.edit': 'Edit result',
  },
  pt: {
    'admin.title': 'Admin', 'admin.kicker': 'Sala de imprensa', 'admin.h1': 'Painel de administração', 'admin.forbidden': 'Acesso apenas para administradores.',
    'admin.tab.games': 'Jogos', 'admin.tab.diary': 'Diário', 'admin.tab.roster': 'Elenco', 'admin.tab.dallas': 'Dallas',
    'admin.newGame': 'Novo jogo', 'admin.date': 'Data e hora (seu fuso)', 'admin.opponent': 'Adversário', 'admin.abbr': 'Sigla', 'admin.home': 'Em casa', 'admin.season': 'Temporada',
    'admin.create': 'Criar', 'admin.created': 'Criado', 'admin.updated': 'Salvo', 'admin.deleted': 'Apagado', 'admin.confirm': 'Tem certeza?',
    'admin.sync': 'Sincronizar ESPN', 'admin.syncOk': 'Sincronizado: {n} jogos importados', 'admin.syncErr': 'Erro de sincronização: {e}',
    'admin.demo': 'Apagar dados demo', 'admin.demoDone': 'Dados demo apagados', 'admin.demoConfirm': 'Apagar todos os dados de demonstração?',
    'admin.status': 'Status', 'admin.scheduled': 'Agendado', 'admin.live': 'Ao vivo', 'admin.final': 'Final',
    'admin.mavsScore': 'Pontos Mavs', 'admin.oppScore': 'Pontos adversário', 'admin.leaderPts': 'Líder em pontos', 'admin.leaderReb': 'Líder em rebotes', 'admin.leaderAst': 'Líder em assistências',
    'admin.value': 'Valor', 'admin.leadersHint': 'Em empates, separe os nomes com " / "', 'admin.noGames': 'Sem jogos.', 'admin.diaryId': 'Diário',
    'admin.newEntry': 'Nova matéria', 'admin.editEntry': 'Editando matéria #{id}', 'admin.noEntries': 'Sem matérias.', 'admin.etitle': 'Título', 'admin.subtitle': 'Subtítulo',
    'admin.game': 'Jogo', 'admin.noGame': '— sem jogo —', 'admin.lang': 'Idioma', 'admin.body': 'Corpo (markdown leve)', 'admin.preview': 'Pré-visualização',
    'admin.bodyHint': 'Parágrafos separados por linha em branco, "## Título", "- lista", **negrito**', 'admin.reset': 'Nova', 'admin.view': 'Ver',
    'admin.rosterHint': 'Um jogador por linha.', 'admin.rosterSaved': 'Elenco salvo ({n} jogadores)',
    'admin.dallasHint': 'Último resultado por time. O override manual vence o ESPN.', 'admin.opp': 'Adversário', 'admin.score': 'Pontos do time', 'admin.oppScore2': 'Pontos adv.',
    'admin.result': 'Resultado', 'admin.override': 'Salvar override', 'admin.clear': 'Remover override', 'admin.manual': 'manual', 'admin.espn': 'ESPN', 'admin.noTeamData': 'Sem dados',
    'admin.edit': 'Editar resultado',
  },
});

const field = (label, input) => el('label', { class: 'field' }, el('span', {}, label), input);
const inp = (attrs = {}) => el('input', { class: 'input', ...attrs });
const err = e => toast(e.message || t('common.error'), 'error');
const pad = n => String(n).padStart(2, '0');
const toLocalInput = iso => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const seasonOf = d => { const y = d.getFullYear(), m = d.getMonth() + 1; const s = m >= 8 ? y : y - 1; return `${s}-${String(s + 1).slice(2)}`; };

let rosterCache = [];
async function rosterList() {
  try { rosterCache = (await api('/roster')).players || []; } catch { /* keep */ }
  return rosterCache;
}
function rosterDatalist(id) { return el('datalist', { id }, rosterCache.map(p => el('option', { value: p }))); }

// ---------------- Games ----------------
async function gamesTab(box) {
  await rosterList();
  box.replaceChildren(rosterDatalist('ad-roster'));
  const listBox = el('div', { class: 'stack' }, el('div', { class: 'spinner' }));

  // create form
  const now = new Date(Date.now() + 86400000); now.setMinutes(0);
  const f = { date: inp({ type: 'datetime-local', required: true, value: toLocalInput(now) }), opp: inp({ required: true, maxlength: 40 }), abbr: inp({ maxlength: 4, style: { textTransform: 'uppercase' } }),
    home: el('input', { type: 'checkbox', checked: true }), season: inp({ value: seasonOf(now) }) };
  const createForm = el('form', { class: 'card stack ad-card', onsubmit: async ev => {
    ev.preventDefault();
    try {
      await api('/games', { method: 'POST', body: { date: new Date(f.date.value).toISOString(), opponent: f.opp.value.trim(), opponent_abbr: f.abbr.value.trim().toUpperCase(), home: f.home.checked, season: f.season.value.trim(), status: 'scheduled' } });
      toast(t('admin.created'), 'ok'); f.opp.value = ''; f.abbr.value = ''; load();
    } catch (e) { err(e); }
  } },
    el('h3', { class: 'ad-h3' }, t('admin.newGame')),
    el('div', { class: 'grid grid-3' }, field(t('admin.date'), f.date), field(t('admin.opponent'), f.opp), field(t('admin.abbr'), f.abbr), field(t('admin.season'), f.season),
      el('label', { class: 'field ad-check' }, f.home, el('span', {}, t('admin.home')))),
    el('div', {}, el('button', { class: 'btn btn-primary', type: 'submit' }, t('admin.create'))));

  const syncOut = el('span', { class: 'muted' });
  const tools = el('div', { class: 'card row ad-card' },
    el('button', { class: 'btn btn-ghost', onclick: async e => {
      e.target.disabled = true; syncOut.textContent = '…';
      try { const r = await api('/admin/sync', { method: 'POST', body: {} });
        syncOut.textContent = r.ok === false || r.error ? t('admin.syncErr', { e: r.error || '?' }) : t('admin.syncOk', { n: r.imported ?? 0 });
        if (r.ok !== false && !r.error) load();
      } catch (er) { syncOut.textContent = t('admin.syncErr', { e: er.message }); } finally { e.target.disabled = false; }
    } }, '⟳ ' + t('admin.sync')),
    el('button', { class: 'btn btn-ghost ad-danger', onclick: async () => {
      if (!confirm(t('admin.demoConfirm'))) return;
      try { await api('/admin/demo', { method: 'DELETE' }); toast(t('admin.demoDone'), 'ok'); load(); } catch (e) { err(e); }
    } }, t('admin.demo')), syncOut);

  box.append(tools, createForm, listBox);

  function editor(g) {
    const status = el('select', { class: 'select' }, ['scheduled', 'live', 'final'].map(s => el('option', { value: s }, t(`admin.${s}`))));
    status.value = g.status;
    const ms = inp({ type: 'number', min: 0, value: g.mavs_score ?? '' }), os = inp({ type: 'number', min: 0, value: g.opp_score ?? '' });
    const L = g.leaders || {};
    const lead = (k) => ({ p: inp({ list: 'ad-roster', value: L[k]?.player ?? '', placeholder: t('common.player') }), v: inp({ type: 'number', min: 0, value: L[k]?.value ?? '', placeholder: t('admin.value') }) });
    const lp = lead('points'), lr = lead('rebounds'), la = lead('assists');
    const when = inp({ type: 'datetime-local', value: toLocalInput(g.date) });
    const opp = inp({ value: g.opponent }), abbr = inp({ value: g.opponent_abbr || '', maxlength: 4 });
    const num = v => v === '' ? null : Number(v);
    const leaderObj = (x) => x.p.value.trim() ? { player: x.p.value.trim(), value: num(x.v.value) ?? 0 } : null;
    return el('form', { class: 'ad-editor stack', onsubmit: async ev => {
      ev.preventDefault();
      const lps = leaderObj(lp), lrs = leaderObj(lr), las = leaderObj(la);
      const body = { date: new Date(when.value).toISOString(), opponent: opp.value.trim(), opponent_abbr: abbr.value.trim().toUpperCase(), status: status.value, mavs_score: num(ms.value), opp_score: num(os.value),
        leaders: lps || lrs || las ? { points: lps, rebounds: lrs, assists: las } : null };
      try { await api(`/games/${g.id}`, { method: 'PUT', body }); toast(t('admin.updated'), 'ok'); load(); } catch (e) { err(e); }
    } },
      el('div', { class: 'grid grid-3' }, field(t('admin.date'), when), field(t('admin.opponent'), opp), field(t('admin.abbr'), abbr)),
      el('div', { class: 'grid grid-3' }, field(t('admin.status'), status), field(t('admin.mavsScore'), ms), field(t('admin.oppScore'), os)),
      el('div', { class: 'ad-leaders' },
        [[t('admin.leaderPts'), lp], [t('admin.leaderReb'), lr], [t('admin.leaderAst'), la]].map(([label, x]) => el('div', { class: 'ad-leader' }, el('span', { class: 'ad-lbl' }, label), x.p, x.v))),
      el('p', { class: 'muted ad-hint' }, t('admin.leadersHint')),
      el('div', {}, el('button', { class: 'btn btn-primary btn-sm', type: 'submit' }, t('common.save'))));
  }

  async function load() {
    try {
      const { games } = await api('/games?status=all&limit=200');
      listBox.replaceChildren();
      if (!games.length) { listBox.append(el('div', { class: 'empty' }, t('admin.noGames'))); return; }
      for (const g of games) {
        const d = el('details', { class: 'card ad-game' },
          el('summary', { class: 'ad-sum' },
            el('span', { class: 'ad-date num' }, fmtDateTime(g.date)),
            el('strong', {}, `${g.home ? t('common.vs') : t('common.at')} ${g.opponent}`),
            el('span', { class: `badge ${g.status === 'final' ? (g.mavs_score > g.opp_score ? 'badge-win' : 'badge-loss') : ''}` }, g.status === 'final' ? `${g.mavs_score}-${g.opp_score}` : t(`admin.${g.status}`)),
            g.diary_id ? el('span', { class: 'muted' }, `📰 #${g.diary_id}`) : null),
          editor(g),
          el('div', { class: 'row' }, el('button', { class: 'btn btn-ghost btn-sm ad-danger', onclick: async () => {
            if (!confirm(t('admin.confirm'))) return;
            try { await api(`/games/${g.id}`, { method: 'DELETE' }); toast(t('admin.deleted'), 'ok'); load(); } catch (e) { err(e); }
          } }, t('common.delete'))));
        listBox.append(d);
      }
    } catch (e) { listBox.replaceChildren(el('div', { class: 'empty' }, e.message)); }
  }
  load();
}

// ---------------- Diary ----------------
async function diaryTab(box, openId) {
  await rosterList();
  const listBox = el('div', { class: 'stack ad-diary-list' });
  const formBox = el('div', {});
  box.replaceChildren(el('div', { class: 'ad-diary' }, formBox, listBox));
  let games = [];
  try { games = (await api('/games?status=all&limit=200')).games; } catch { /* ignore */ }

  function form(entry) {
    const e = entry || { title: '', subtitle: '', body: '', lang: 'es', game_id: null };
    const title = inp({ required: true, maxlength: 160, value: e.title }), subtitle = inp({ maxlength: 240, value: e.subtitle || '' });
    const game = el('select', { class: 'select' }, el('option', { value: '' }, t('admin.noGame')),
      games.map(g => el('option', { value: g.id }, `${new Date(g.date).toLocaleDateString()} · ${g.home ? 'vs' : '@'} ${g.opponent}`)));
    game.value = e.game_id ? String(e.game_id) : '';
    const lang = el('select', { class: 'select' }, ['es', 'en', 'pt'].map(l => el('option', { value: l }, l.toUpperCase()))); lang.value = e.lang || 'es';
    const body = el('textarea', { class: 'textarea ad-body', rows: 14 }); body.value = e.body || '';
    const preview = el('div', { class: 'ad-preview' });
    const upd = () => preview.replaceChildren(renderMarkdown(body.value, 'md dy-body'));
    body.addEventListener('input', upd); upd();
    const f = el('form', { class: 'card stack ad-card', onsubmit: async ev => {
      ev.preventDefault();
      const payload = { title: title.value.trim(), subtitle: subtitle.value.trim(), body: body.value, lang: lang.value, game_id: game.value ? Number(game.value) : null };
      try {
        if (entry) { await api(`/diary/${entry.id}`, { method: 'PUT', body: payload }); toast(t('admin.updated'), 'ok'); }
        else { const r = await api('/diary', { method: 'POST', body: payload }); toast(t('admin.created'), 'ok'); entry = r.entry; }
        formBox.replaceChildren(form(null)); loadList();
      } catch (er) { err(er); }
    } },
      el('h3', { class: 'ad-h3' }, entry ? t('admin.editEntry', { id: entry.id }) : t('admin.newEntry')),
      field(t('admin.etitle'), title), field(t('admin.subtitle'), subtitle),
      el('div', { class: 'grid grid-2' }, field(t('admin.game'), game), field(t('admin.lang'), lang)),
      el('div', { class: 'ad-split' },
        el('div', { class: 'stack' }, field(t('admin.body'), body), el('p', { class: 'muted ad-hint' }, t('admin.bodyHint'))),
        el('div', { class: 'stack' }, el('span', { class: 'ad-lbl' }, t('admin.preview')), preview)),
      el('div', { class: 'row' },
        el('button', { class: 'btn btn-primary', type: 'submit' }, t('common.save')),
        entry ? el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { formBox.replaceChildren(form(null)); } }, t('admin.reset')) : null));
    return f;
  }

  async function loadList() {
    try {
      const { entries } = await api('/diary?limit=100');
      listBox.replaceChildren(el('h3', { class: 'ad-h3' }, t('admin.tab.diary')));
      if (!entries.length) listBox.append(el('div', { class: 'empty' }, t('admin.noEntries')));
      for (const e of entries) {
        listBox.append(el('div', { class: 'card row ad-entry' },
          el('div', { class: 'ad-entry-t' }, el('strong', {}, e.title), el('span', { class: 'muted' }, ` · ${e.lang?.toUpperCase() || ''} · #${e.id}`)),
          el('div', { class: 'row' },
            el('a', { class: 'btn btn-ghost btn-sm', href: `#/diary/${e.id}` }, t('admin.view')),
            el('button', { class: 'btn btn-ghost btn-sm', onclick: async () => {
              try { const r = await api(`/diary/${e.id}`); formBox.replaceChildren(form(r.entry)); formBox.scrollIntoView({ behavior: 'smooth' }); } catch (er) { err(er); }
            } }, t('common.edit')),
            el('button', { class: 'btn btn-ghost btn-sm ad-danger', onclick: async () => {
              if (!confirm(t('admin.confirm'))) return;
              try { await api(`/diary/${e.id}`, { method: 'DELETE' }); toast(t('admin.deleted'), 'ok'); loadList(); } catch (er) { err(er); }
            } }, t('common.delete')))));
      }
    } catch (e) { listBox.replaceChildren(el('div', { class: 'empty' }, e.message)); }
  }

  let initial = null;
  if (openId) { try { initial = (await api(`/diary/${openId}`)).entry; } catch (e) { err(e); } }
  formBox.append(form(initial));
  loadList();
}

// ---------------- Roster ----------------
async function rosterTab(box) {
  const players = await rosterList();
  const ta = el('textarea', { class: 'textarea', rows: 18 }); ta.value = players.join('\n');
  box.replaceChildren(el('form', { class: 'card stack ad-card', onsubmit: async ev => {
    ev.preventDefault();
    const list = [...new Set(ta.value.split('\n').map(s => s.trim()).filter(Boolean))];
    try { await api('/roster', { method: 'PUT', body: { players: list } }); toast(t('admin.rosterSaved', { n: list.length }), 'ok'); } catch (e) { err(e); }
  } }, el('p', { class: 'muted' }, t('admin.rosterHint')), ta, el('div', {}, el('button', { class: 'btn btn-primary', type: 'submit' }, t('common.save')))));
}

// ---------------- Dallas ----------------
const TEAMS = ['mavericks', 'wings', 'cowboys', 'stars', 'rangers', 'fcdallas'];
async function dallasTab(box) {
  box.replaceChildren(el('p', { class: 'muted' }, t('admin.dallasHint')), el('div', { class: 'spinner' }));
  let teams = [];
  try { teams = (await api('/dallas')).teams || []; } catch (e) { box.append(el('div', { class: 'empty' }, e.message)); }
  box.querySelector('.spinner')?.remove();
  const grid = el('div', { class: 'grid grid-2' });
  box.append(grid);
  for (const key of TEAMS) {
    const d = teams.find(x => x.key === key) || { key, name: key };
    const opp = inp({ value: d.opponent ?? '' }), sc = inp({ type: 'number', min: 0, value: d.score ?? '' }), os = inp({ type: 'number', min: 0, value: d.opp_score ?? '' });
    const res = el('select', { class: 'select' }, ['W', 'L', 'T', 'OTL'].map(r => el('option', { value: r }, r))); res.value = d.result || 'W';
    const date = inp({ type: 'datetime-local', value: d.date ? toLocalInput(d.date) : '' });
    const home = el('input', { type: 'checkbox', checked: d.home !== false });
    const num = v => v === '' ? null : Number(v);
    grid.append(el('form', { class: 'card stack ad-card', onsubmit: async ev => {
      ev.preventDefault();
      try {
        await api(`/dallas/${key}`, { method: 'PUT', body: { opponent: opp.value.trim(), score: num(sc.value), opp_score: num(os.value), result: res.value, date: date.value ? new Date(date.value).toISOString() : null, home: home.checked } });
        toast(t('admin.updated'), 'ok'); dallasTab(box);
      } catch (e) { err(e); }
    } },
      el('div', { class: 'row ad-team-h' }, el('h3', { class: 'ad-h3' }, d.name || key), d.league ? el('span', { class: 'badge' }, d.league) : null,
        d.result ? el('span', { class: 'badge' }, t(d.source === 'manual' ? 'admin.manual' : 'admin.espn')) : null),
      el('p', { class: 'ad-cur' }, d.result ? `${d.result} · ${d.home ? t('common.vs') : t('common.at')} ${d.opponent} ${d.score}-${d.opp_score} · ${d.date ? fmtDateTime(d.date) : ''}` : t('admin.noTeamData')),
      el('div', { class: 'grid grid-2' }, field(t('admin.opp'), opp), field(t('admin.result'), res), field(t('admin.score'), sc), field(t('admin.oppScore2'), os)),
      field(t('common.date'), date),
      el('label', { class: 'field ad-check' }, home, el('span', {}, t('admin.home'))),
      el('div', { class: 'row' },
        el('button', { class: 'btn btn-primary btn-sm', type: 'submit' }, t('admin.override')),
        el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => {
          try { await api(`/dallas/${key}`, { method: 'DELETE' }); toast(t('admin.deleted'), 'ok'); dallasTab(box); } catch (e) { err(e); }
        } }, t('admin.clear')))));
  }
}

// ---------------- Page ----------------
const TABS = [['games', gamesTab], ['diary', diaryTab], ['roster', rosterTab], ['dallas', dallasTab]];

function render(container, params, query) {
  loadCSS('/css/pages/admin.css'); loadCSS('/css/pages/diary.css');
  const wrap = el('div', { class: 'admin-page stack' }, el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, t('admin.kicker')), el('h1', {}, t('admin.h1'))));
  container.append(wrap);
  if (!isAdmin()) { wrap.append(el('div', { class: 'card empty' }, t('admin.forbidden'))); return; }
  const diaryId = query?.get?.('diary');
  let current = diaryId ? 'diary' : 'games';
  const tabs = el('div', { class: 'tabs' });
  const body = el('div', { class: 'stack' });
  wrap.append(tabs, body);
  const show = (key, first) => {
    current = key;
    tabs.replaceChildren(...TABS.map(([k]) => el('button', { class: k === current ? 'active' : '', type: 'button', onclick: () => show(k) }, t(`admin.tab.${k}`))));
    body.replaceChildren(el('div', { class: 'spinner' }));
    const fn = TABS.find(([k]) => k === key)[1];
    Promise.resolve(fn(body, key === 'diary' && first ? diaryId : null)).catch(e => { body.replaceChildren(el('div', { class: 'empty' }, e.message)); });
  };
  show(current, true);
}

export default { path: '/admin', titleKey: 'admin.title', render };
