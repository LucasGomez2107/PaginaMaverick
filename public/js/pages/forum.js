import { el, t, api, registerStrings, getUser, isAdmin, toast, loadCSS, fmtDate, fmtDateTime } from '../core.js';

registerStrings({
  es: {
    'forum.title': 'Foro', 'forum.kicker': 'Tribuna', 'forum.h1': 'Foro del partido',
    'forum.upcoming': 'Próximos partidos', 'forum.recent': 'Resultados recientes', 'forum.none': 'No hay partidos para mostrar.',
    'forum.comments': '{n} comentarios', 'forum.comment1': '1 comentario', 'forum.final': 'Final', 'forum.live': 'En vivo', 'forum.scheduled': 'Programado',
    'forum.back': '← Todos los partidos', 'forum.notFound': 'Partido no encontrado.', 'forum.newComment': 'Nuevo comentario',
    'forum.placeholder': 'Escribí tu comentario (máx. 1000 caracteres)…', 'forum.post': 'Comentar', 'forum.loginPrompt': 'Iniciá sesión para comentar',
    'forum.empty': 'Nadie comentó todavía. ¡Rompé el hielo!', 'forum.reply': 'Responder', 'forum.replyTo': 'Respondiendo a {user}',
    'forum.delete': 'Borrar', 'forum.confirmDel': '¿Borrar este comentario?', 'forum.diary': 'Leer el diario del partido', 'forum.prode': 'Hacer tu pronóstico',
    'forum.ago.now': 'ahora', 'forum.ago.m': 'hace {n} min', 'forum.ago.h': 'hace {n} h', 'forum.ago.d': 'hace {n} d',
    'forum.posted': 'Comentario publicado', 'forum.refreshing': 'Se actualiza solo cada 30 s',
  },
  en: {
    'forum.title': 'Forum', 'forum.kicker': 'The stands', 'forum.h1': 'Game forum',
    'forum.upcoming': 'Upcoming games', 'forum.recent': 'Recent results', 'forum.none': 'No games to show.',
    'forum.comments': '{n} comments', 'forum.comment1': '1 comment', 'forum.final': 'Final', 'forum.live': 'Live', 'forum.scheduled': 'Scheduled',
    'forum.back': '← All games', 'forum.notFound': 'Game not found.', 'forum.newComment': 'New comment',
    'forum.placeholder': 'Write your comment (max 1000 characters)…', 'forum.post': 'Post', 'forum.loginPrompt': 'Log in to comment',
    'forum.empty': 'No comments yet. Break the ice!', 'forum.reply': 'Reply', 'forum.replyTo': 'Replying to {user}',
    'forum.delete': 'Delete', 'forum.confirmDel': 'Delete this comment?', 'forum.diary': 'Read the game diary', 'forum.prode': 'Make your prediction',
    'forum.ago.now': 'now', 'forum.ago.m': '{n} min ago', 'forum.ago.h': '{n} h ago', 'forum.ago.d': '{n} d ago',
    'forum.posted': 'Comment posted', 'forum.refreshing': 'Auto-refreshes every 30 s',
  },
  pt: {
    'forum.title': 'Fórum', 'forum.kicker': 'Arquibancada', 'forum.h1': 'Fórum do jogo',
    'forum.upcoming': 'Próximos jogos', 'forum.recent': 'Resultados recentes', 'forum.none': 'Não há jogos para mostrar.',
    'forum.comments': '{n} comentários', 'forum.comment1': '1 comentário', 'forum.final': 'Final', 'forum.live': 'Ao vivo', 'forum.scheduled': 'Agendado',
    'forum.back': '← Todos os jogos', 'forum.notFound': 'Jogo não encontrado.', 'forum.newComment': 'Novo comentário',
    'forum.placeholder': 'Escreva seu comentário (máx. 1000 caracteres)…', 'forum.post': 'Comentar', 'forum.loginPrompt': 'Entre para comentar',
    'forum.empty': 'Ninguém comentou ainda. Quebre o gelo!', 'forum.reply': 'Responder', 'forum.replyTo': 'Respondendo a {user}',
    'forum.delete': 'Apagar', 'forum.confirmDel': 'Apagar este comentário?', 'forum.diary': 'Ler o diário do jogo', 'forum.prode': 'Fazer seu palpite',
    'forum.ago.now': 'agora', 'forum.ago.m': 'há {n} min', 'forum.ago.h': 'há {n} h', 'forum.ago.d': 'há {n} d',
    'forum.posted': 'Comentário publicado', 'forum.refreshing': 'Atualiza sozinho a cada 30 s',
  },
});

export function ago(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso.includes('Z') || iso.includes('+') ? iso : iso.replace(' ', 'T') + 'Z').getTime()) / 1000);
  if (s < 60) return t('forum.ago.now');
  if (s < 3600) return t('forum.ago.m', { n: Math.floor(s / 60) });
  if (s < 86400) return t('forum.ago.h', { n: Math.floor(s / 3600) });
  if (s < 86400 * 7) return t('forum.ago.d', { n: Math.floor(s / 86400) });
  return fmtDate(iso);
}

function statusBadge(g) {
  if (g.status === 'final') {
    const w = g.mavs_score > g.opp_score;
    return el('span', { class: `badge ${w ? 'badge-win' : 'badge-loss'}` }, `${w ? 'W' : 'L'} ${g.mavs_score}-${g.opp_score}`);
  }
  if (g.status === 'live') return el('span', { class: 'badge fo-live' }, t('forum.live'));
  return el('span', { class: 'badge' }, t('forum.scheduled'));
}

const commentsLabel = n => n === 1 ? t('forum.comment1') : t('forum.comments', { n });

function gameCard(g) {
  return el('a', { class: `ticket fo-game fo-${g.status}`, href: `#/forum/${g.id}` },
    el('div', { class: 'fo-game-date' }, el('span', { class: 'kicker' }, fmtDateTime(g.date))),
    el('div', { class: 'fo-game-vs' },
      el('span', { class: 'fo-ha' }, g.home ? t('common.vs') : t('common.at')),
      el('span', { class: 'fo-opp' }, g.opponent),
      el('span', { class: 'fo-abbr' }, g.opponent_abbr || '')),
    el('div', { class: 'fo-game-foot' }, statusBadge(g), el('span', { class: 'muted' }, '💬 ' + commentsLabel(g.comment_count || 0))));
}

async function renderList(container) {
  loadCSS('/css/pages/forum.css');
  const wrap = el('div', { class: 'forum-page stack' }, el('div', { class: 'page-head' }, el('span', { class: 'kicker' }, t('forum.kicker')), el('h1', {}, t('forum.h1'))), el('div', { class: 'spinner' }));
  container.append(wrap);
  try {
    const { games } = await api('/games?status=all&limit=40');
    wrap.querySelector('.spinner')?.remove();
    const up = games.filter(g => g.status !== 'final').sort((a, b) => new Date(a.date) - new Date(b.date));
    const done = games.filter(g => g.status === 'final').sort((a, b) => new Date(b.date) - new Date(a.date));
    const section = (title, list) => el('section', { class: 'stack' }, el('h2', { class: 'fo-h2' }, title),
      list.length ? el('div', { class: 'grid grid-3 fo-grid' }, list.map(gameCard)) : el('div', { class: 'empty' }, t('forum.none')));
    wrap.append(section(t('forum.upcoming'), up), section(t('forum.recent'), done));
  } catch (e) {
    wrap.querySelector('.spinner')?.remove();
    wrap.append(el('div', { class: 'empty' }, e.message || t('common.error')));
  }
}

async function renderGame(container, params) {
  loadCSS('/css/pages/forum.css');
  const id = params.id;
  const wrap = el('div', { class: 'forum-page stack' }, el('a', { class: 'fo-back', href: '#/forum' }, t('forum.back')), el('div', { class: 'spinner' }));
  container.append(wrap);
  let game;
  try { game = (await api(`/games/${id}`)).game; } catch (e) {
    wrap.querySelector('.spinner')?.remove();
    wrap.append(el('div', { class: 'empty' }, e.status === 404 ? t('forum.notFound') : (e.message || t('common.error'))));
    return;
  }
  wrap.querySelector('.spinner')?.remove();
  const links = el('div', { class: 'row' },
    game.diary_id ? el('a', { class: 'btn btn-ghost btn-sm', href: `#/diary/${game.diary_id}` }, '📰 ' + t('forum.diary')) : null,
    !game.locked ? el('a', { class: 'btn btn-primary btn-sm', href: '#/prode' }, '🎯 ' + t('forum.prode')) : null);
  wrap.append(el('div', { class: 'ticket fo-head' },
    el('span', { class: 'kicker' }, `${fmtDateTime(game.date)} · ${game.season || ''}`),
    el('h1', { class: 'fo-title' }, `Mavericks ${game.home ? t('common.vs') : t('common.at')} ${game.opponent}`),
    el('div', { class: 'row' }, statusBadge(game), el('span', { class: 'muted' }, game.home ? t('common.home') : t('common.away'))),
    links));

  const formBox = el('div', {});
  const listBox = el('div', { class: 'stack fo-comments' });
  wrap.append(formBox, listBox, el('p', { class: 'muted fo-note' }, t('forum.refreshing')));

  let replyTo = null; // comment
  let comments = [];
  let draft = '';

  function buildForm() {
    formBox.replaceChildren();
    const user = getUser();
    if (!user) {
      const next = encodeURIComponent(location.hash.slice(1) || '/');
      formBox.append(el('div', { class: 'card row fo-login' }, el('span', {}, t('forum.loginPrompt')),
        el('a', { class: 'btn btn-primary btn-sm', href: `#/login?next=${next}` }, t('common.login')),
        el('a', { class: 'btn btn-ghost btn-sm', href: `#/register?next=${next}` }, t('common.register'))));
      return;
    }
    const ta = el('textarea', { class: 'textarea', rows: 3, maxlength: 1000, placeholder: t('forum.placeholder'), oninput: e => { draft = e.target.value; } });
    ta.value = draft;
    const btn = el('button', { class: 'btn btn-primary', type: 'submit' }, t('forum.post'));
    formBox.append(el('form', { class: 'card stack fo-form', onsubmit: async ev => {
      ev.preventDefault();
      const body = ta.value.trim();
      if (!body) return;
      btn.disabled = true;
      try {
        await api(`/games/${id}/comments`, { method: 'POST', body: { body, parent_id: replyTo ? replyTo.id : undefined } });
        draft = ''; replyTo = null; toast(t('forum.posted'), 'ok');
        buildForm(); await load();
      } catch (e) { toast(e.message, 'error'); btn.disabled = false; }
    } },
      el('span', { class: 'kicker' }, replyTo ? t('forum.replyTo', { user: replyTo.user.username }) : t('forum.newComment')),
      ta,
      el('div', { class: 'row' }, btn, replyTo ? el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { replyTo = null; buildForm(); } }, t('common.cancel')) : null)));
    if (replyTo) ta.focus();
  }

  function commentNode(c, isReply) {
    const user = getUser();
    const can = user && (user.id === c.user.id || isAdmin());
    return el('article', { class: `fo-comment ${isReply ? 'is-reply' : ''}`, id: `c${c.id}` },
      el('header', { class: 'fo-c-head' },
        el('span', { class: 'fo-avatar' }, (c.user.username || '?')[0].toUpperCase()),
        el('strong', {}, c.user.username), el('span', { class: 'muted fo-time', title: fmtDateTime(c.created_at) }, ago(c.created_at))),
      el('p', { class: 'fo-c-body' }, c.body),
      el('footer', { class: 'row fo-c-actions' },
        !isReply && user ? el('button', { class: 'btn btn-ghost btn-sm', onclick: () => { replyTo = c; buildForm(); formBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, t('forum.reply')) : null,
        can ? el('button', { class: 'btn btn-ghost btn-sm fo-del', onclick: async () => {
          if (!confirm(t('forum.confirmDel'))) return;
          try { await api(`/comments/${c.id}`, { method: 'DELETE' }); await load(); } catch (e) { toast(e.message, 'error'); }
        } }, t('forum.delete')) : null));
  }

  function drawComments() {
    listBox.replaceChildren();
    const tops = comments.filter(c => !c.parent_id);
    const byParent = {};
    comments.filter(c => c.parent_id).forEach(c => (byParent[c.parent_id] ||= []).push(c));
    if (!comments.length) { listBox.append(el('div', { class: 'empty' }, t('forum.empty'))); return; }
    listBox.append(el('h2', { class: 'fo-h2' }, commentsLabel(comments.length)));
    for (const c of tops) {
      listBox.append(el('div', { class: 'fo-thread' }, commentNode(c, false), (byParent[c.id] || []).map(r => commentNode(r, true))));
    }
    // orphans (parent deleted)
    const ids = new Set(tops.map(c => c.id));
    comments.filter(c => c.parent_id && !ids.has(c.parent_id) && !comments.some(x => x.id === c.parent_id)).forEach(c => listBox.append(el('div', { class: 'fo-thread' }, commentNode(c, true))));
  }

  async function load() {
    try {
      comments = (await api(`/games/${id}/comments`)).comments || [];
      drawComments();
    } catch (e) { if (!comments.length) listBox.replaceChildren(el('div', { class: 'empty' }, e.message)); }
  }

  buildForm();
  await load();
  const timer = setInterval(() => {
    // do not refresh while user is typing
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA' && document.activeElement.value) return;
    load();
  }, 30000);
  return () => clearInterval(timer);
}

export default [
  { path: '/forum', titleKey: 'forum.title', render: renderList },
  { path: '/forum/:id', titleKey: 'forum.title', render: renderGame },
];
