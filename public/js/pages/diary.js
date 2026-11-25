import { el, t, api, registerStrings, isAdmin, loadCSS, fmtDate, fmtDateTime } from '../core.js';
import { renderMarkdown } from '../lib/markdown.js';

registerStrings({
  es: {
    'diary.title': 'El Diario', 'diary.paper': 'El Diario del Partido', 'diary.tagline': 'Crónicas, previas y análisis desde Sudamérica',
    'diary.empty': 'Todavía no hay crónicas publicadas.', 'diary.read': 'Leer nota →', 'diary.notFound': 'Nota no encontrada.',
    'diary.back': '← Portada', 'diary.edit': 'Editar', 'diary.by': 'Por {author}', 'diary.forum': 'Ir al foro del partido', 'diary.final': 'Final',
    'diary.edition': 'Edición del {date}',
  },
  en: {
    'diary.title': 'The Diary', 'diary.paper': 'The Game Diary', 'diary.tagline': 'Recaps, previews and analysis from South America',
    'diary.empty': 'No stories published yet.', 'diary.read': 'Read story →', 'diary.notFound': 'Story not found.',
    'diary.back': '← Front page', 'diary.edit': 'Edit', 'diary.by': 'By {author}', 'diary.forum': 'Go to the game forum', 'diary.final': 'Final',
    'diary.edition': 'Edition of {date}',
  },
  pt: {
    'diary.title': 'O Diário', 'diary.paper': 'O Diário do Jogo', 'diary.tagline': 'Crônicas, prévias e análises da América do Sul',
    'diary.empty': 'Ainda não há crônicas publicadas.', 'diary.read': 'Ler matéria →', 'diary.notFound': 'Matéria não encontrada.',
    'diary.back': '← Capa', 'diary.edit': 'Editar', 'diary.by': 'Por {author}', 'diary.forum': 'Ir ao fórum do jogo', 'diary.final': 'Final',
    'diary.edition': 'Edição de {date}',
  },
});

function masthead(sub) {
  return el('header', { class: 'dy-mast' },
    el('div', { class: 'dy-mast-rule' }),
    el('h1', { class: 'dy-paper' }, t('diary.paper')),
    el('div', { class: 'dy-mast-sub' }, el('span', {}, t('diary.tagline')), el('span', {}, sub || t('diary.edition', { date: fmtDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }))),
    el('div', { class: 'dy-mast-rule' }));
}

function scoreBox(g) {
  if (!g) return null;
  const done = g.status === 'final';
  const win = done && g.mavs_score > g.opp_score;
  return el('a', { class: 'dy-score', href: `#/forum/${g.id}` },
    el('span', { class: 'dy-score-teams' }, `Mavericks ${g.home ? t('common.vs') : t('common.at')} ${g.opponent}`),
    done ? el('span', { class: `dy-score-num ${win ? 'w' : 'l'}` }, `${g.mavs_score} - ${g.opp_score}`) : el('span', { class: 'dy-score-num' }, fmtDateTime(g.date)),
    el('span', { class: 'dy-score-date' }, fmtDate(g.date)));
}

function excerpt(body, n = 220) {
  const s = String(body || '').replace(/^#+\s.*$/gm, '').replace(/\*\*/g, '').replace(/^\s*[-*]\s+/gm, '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
}

async function renderList(container) {
  loadCSS('/css/pages/diary.css');
  const wrap = el('div', { class: 'diary-page' }, masthead(), el('div', { class: 'spinner' }));
  container.append(wrap);
  try {
    const { entries } = await api('/diary?limit=30');
    wrap.querySelector('.spinner')?.remove();
    if (!entries.length) { wrap.append(el('div', { class: 'empty' }, t('diary.empty'))); return; }
    const [lead, ...rest] = entries;
    const card = (e, big) => el('article', { class: big ? 'dy-lead' : 'dy-item' },
      el('div', { class: 'dy-meta' }, el('span', {}, fmtDate(e.created_at)), e.lang ? el('span', { class: 'dy-lang' }, e.lang.toUpperCase()) : null),
      el('h2', { class: 'dy-h' }, el('a', { href: `#/diary/${e.id}` }, e.title)),
      e.subtitle ? el('p', { class: 'dy-sub' }, e.subtitle) : null,
      el('p', { class: 'dy-excerpt' }, excerpt(e.body, big ? 420 : 180)),
      scoreBox(e.game),
      el('a', { class: 'dy-more', href: `#/diary/${e.id}` }, t('diary.read')));
    wrap.append(el('div', { class: 'dy-front' }, card(lead, true), rest.length ? el('div', { class: 'dy-cols' }, rest.map(e => card(e, false))) : null));
  } catch (e) {
    wrap.querySelector('.spinner')?.remove();
    wrap.append(el('div', { class: 'empty' }, e.message));
  }
}

async function renderEntry(container, params) {
  loadCSS('/css/pages/diary.css');
  const wrap = el('div', { class: 'diary-page' }, masthead(), el('div', { class: 'spinner' }));
  container.append(wrap);
  try {
    const { entry } = await api(`/diary/${params.id}`);
    wrap.querySelector('.spinner')?.remove();
    wrap.append(el('article', { class: 'dy-article' },
      el('div', { class: 'row dy-bar' },
        el('a', { class: 'dy-backlink', href: '#/diary' }, t('diary.back')),
        isAdmin() ? el('a', { class: 'btn btn-ghost btn-sm', href: `#/admin?diary=${entry.id}` }, t('diary.edit')) : null),
      el('h1', { class: 'dy-title' }, entry.title),
      entry.subtitle ? el('p', { class: 'dy-deck' }, entry.subtitle) : null,
      el('div', { class: 'dy-byline' },
        el('span', {}, t('diary.by', { author: entry.author || 'MavSudamerica' })), el('span', {}, fmtDate(entry.created_at))),
      scoreBox(entry.game),
      renderMarkdown(entry.body, 'md dy-body'),
      entry.game ? el('a', { class: 'btn btn-primary btn-sm', href: `#/forum/${entry.game.id}` }, t('diary.forum')) : null));
  } catch (e) {
    wrap.querySelector('.spinner')?.remove();
    wrap.append(el('div', { class: 'empty' }, e.status === 404 ? t('diary.notFound') : e.message));
  }
}

export default [
  { path: '/diary', titleKey: 'diary.title', render: renderList },
  { path: '/diary/:id', titleKey: 'diary.title', render: renderEntry },
];
