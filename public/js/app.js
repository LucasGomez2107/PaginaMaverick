// App shell: router + layout. The shell/design developer extends header, ticker, footer and language modal,
// but must keep the router behaviour (see docs/ARCHITECTURE.md).
import { t, loadUser, onLangChange, onAuthChange, hasChosenLang, el } from './core.js';

const PAGE_MODULES = [
  'home', 'stats', 'forum', 'diary', 'prode', 'tateti', 'guess', 'leaderboard', 'login', 'profile', 'admin',
];

const routes = [];

function compile(path) {
  const keys = [];
  const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  return { re, keys };
}

async function loadPages() {
  const results = await Promise.allSettled(PAGE_MODULES.map(m => import(`./pages/${m}.js`)));
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') { console.error('Page failed to load:', PAGE_MODULES[i], r.reason); return; }
    const def = r.value.default;
    for (const route of [].concat(def || [])) routes.push({ ...route, ...compile(route.path) });
  });
}

let cleanup = null;
let renderToken = 0;

export async function renderRoute() {
  const main = document.getElementById('main');
  const raw = location.hash.slice(1) || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = pathPart || '/';
  const query = new URLSearchParams(queryPart || '');
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } }
  cleanup = null;
  const token = ++renderToken;

  let match = null, params = {};
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) { match = r; r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); }); break; }
  }
  const container = el('div', { class: 'page' });
  main.replaceChildren(container);
  document.body.dataset.route = (path.split('/')[1] || 'home');
  window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));
  if (!match) {
    container.append(el('div', { class: 'card empty' }, el('h1', {}, '404'), el('a', { href: '#/' }, t('common.back'))));
    return;
  }
  document.title = `${t(match.titleKey)} · MavSudamerica`;
  try {
    const c = await match.render(container, params, query);
    if (token === renderToken) cleanup = c; else if (typeof c === 'function') c();
  } catch (e) {
    console.error(e);
    container.append(el('div', { class: 'card empty' }, t('common.error')));
  }
  if (token === renderToken) window.scrollTo(0, 0);
}

async function start() {
  // layout.js (owned by the design/shell developer) builds header, ticker, footer, language modal.
  const layout = await import('./layout.js').catch(e => { console.error(e); return null; });
  await loadUser();
  await loadPages();
  if (layout?.mountLayout) layout.mountLayout();
  if (!hasChosenLang() && layout?.showLanguageModal) layout.showLanguageModal();
  window.addEventListener('hashchange', renderRoute);
  onLangChange(() => { renderRoute(); });
  onAuthChange(() => { renderRoute(); });
  renderRoute();
}

start();
