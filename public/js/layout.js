// App shell: header, Dallas ticker, footer, language modal.
import { t, registerStrings, el, api, getLang, setLang, LANGS, getUser, setUser, isAdmin, onLangChange, onAuthChange, fmtDate } from './core.js';

registerStrings({
  es: {
    'nav.home': 'Inicio', 'nav.stats': 'Estadísticas', 'nav.forum': 'Foro', 'nav.diary': 'Diario', 'nav.prode': 'Prode',
    'nav.tateti': 'Tateti', 'nav.guess': 'Adiviná', 'nav.ranking': 'Ranking', 'nav.admin': 'Admin', 'nav.menu': 'Menú', 'nav.main': 'Navegación principal',
    'layout.tagline': 'Mavs desde Sudamérica', 'layout.ticker': 'Dallas día a día', 'layout.follow': 'Seguinos en X', 'layout.followSub': '@MavSudamerica',
    'layout.disclaimer': 'Sitio de fans no oficial, sin afiliación con los Dallas Mavericks ni la NBA.',
    'layout.langTitle': 'Elegí tu idioma', 'layout.langSub': 'Podés cambiarlo cuando quieras desde el menú.', 'layout.language': 'Idioma',
    'layout.tbd': 'Sin resultado', 'layout.profile': 'Mi perfil',
  },
  en: {
    'nav.home': 'Home', 'nav.stats': 'Stats', 'nav.forum': 'Forum', 'nav.diary': 'Diary', 'nav.prode': 'Prode',
    'nav.tateti': 'Tic-tac-toe', 'nav.guess': 'Guess', 'nav.ranking': 'Ranking', 'nav.admin': 'Admin', 'nav.menu': 'Menu', 'nav.main': 'Main navigation',
    'layout.tagline': 'Mavs from South America', 'layout.ticker': 'Dallas day by day', 'layout.follow': 'Follow us on X', 'layout.followSub': '@MavSudamerica',
    'layout.disclaimer': 'Unofficial fan site, not affiliated with the Dallas Mavericks or the NBA.',
    'layout.langTitle': 'Choose your language', 'layout.langSub': 'You can change it any time from the menu.', 'layout.language': 'Language',
    'layout.tbd': 'No result', 'layout.profile': 'My profile',
  },
  pt: {
    'nav.home': 'Início', 'nav.stats': 'Estatísticas', 'nav.forum': 'Fórum', 'nav.diary': 'Diário', 'nav.prode': 'Bolão',
    'nav.tateti': 'Jogo da velha', 'nav.guess': 'Adivinhe', 'nav.ranking': 'Ranking', 'nav.admin': 'Admin', 'nav.menu': 'Menu', 'nav.main': 'Navegação principal',
    'layout.tagline': 'Mavs da América do Sul', 'layout.ticker': 'Dallas dia a dia', 'layout.follow': 'Siga-nos no X', 'layout.followSub': '@MavSudamerica',
    'layout.disclaimer': 'Site de fãs não oficial, sem afiliação com os Dallas Mavericks nem com a NBA.',
    'layout.langTitle': 'Escolha seu idioma', 'layout.langSub': 'Você pode mudar quando quiser pelo menu.', 'layout.language': 'Idioma',
    'layout.tbd': 'Sem resultado', 'layout.profile': 'Meu perfil',
  },
});

const NAV = [
  ['/', 'nav.home'], ['/stats', 'nav.stats'], ['/forum', 'nav.forum'], ['/diary', 'nav.diary'],
  ['/prode', 'nav.prode'], ['/tateti', 'nav.tateti'], ['/guess', 'nav.guess'], ['/ranking', 'nav.ranking'],
];

const SVGNS = 'http://www.w3.org/2000/svg';
function svg(markup, cls, vb) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', vb); s.setAttribute('aria-hidden', 'true'); if (cls) s.setAttribute('class', cls);
  s.innerHTML = markup; // static trusted markup
  return s;
}
export function monogram() {
  return svg('<rect width="64" height="64" rx="8" fill="#0064B1"/><path d="M-4 52 L40 -4 L54 -4 L10 52Z" fill="#002B5E"/><rect x="0" y="0" width="64" height="64" rx="8" fill="none" stroke="#fff" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-family="Big Shoulders Display,Impact,Arial Narrow,sans-serif" font-weight="900" font-size="34" fill="#fff">MS</text><rect x="10" y="49" width="44" height="4" fill="#BBC4CA"/>', 'mono-mark', '0 0 64 64');
}
const xIcon = () => svg('<path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>', '', '0 0 24 24');

let headerEl, tickerEl, footerEl, menuOpen = false;
let tickerTimer = null;

function currentPath() { return (location.hash.slice(1) || '/').split('?')[0] || '/'; }
function isActive(p) { const c = currentPath(); return p === '/' ? c === '/' : (c === p || c.startsWith(p + '/')); }

async function doLogout() {
  try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  setUser(null); location.hash = '#/';
}

function langSwitch() {
  return el('div', { class: 'lang-switch', role: 'group', 'aria-label': t('layout.language') },
    LANGS.map(l => el('button', { type: 'button', 'aria-pressed': String(getLang() === l), 'aria-label': l === 'es' ? 'Español' : l === 'en' ? 'English' : 'Português', onclick: () => setLang(l) }, l.toUpperCase())));
}

function userArea(mobile) {
  const u = getUser();
  const items = [];
  if (!u) {
    items.push(el('a', { href: '#/login' }, t('common.login')));
    items.push(el('a', { class: mobile ? '' : 'btn btn-sm', href: '#/register' }, t('common.register')));
  } else {
    if (isAdmin()) items.push(el('a', { href: '#/admin', class: isActive('/admin') ? 'active' : '' }, t('nav.admin')));
    items.push(el('a', { class: 'uname', href: '#/profile', title: t('layout.profile') }, u.username));
    items.push(el('button', { class: 'linklike', type: 'button', onclick: doLogout }, t('common.logout')));
  }
  return items;
}

function renderHeader() {
  if (!headerEl) return;
  headerEl.className = 'site-header';
  const navLinks = () => NAV.map(([p, k]) => el('a', { href: '#' + p, class: isActive(p) ? 'active' : '', 'aria-current': isActive(p) ? 'page' : null, onclick: () => closeMenu() }, t(k)));
  const burger = el('button', { class: 'burger', type: 'button', 'aria-expanded': String(menuOpen), 'aria-controls': 'mobile-menu', 'aria-label': t('nav.menu'),
    onclick: () => { menuOpen = !menuOpen; renderHeader(); } }, el('span'), el('span'), el('span'));
  headerEl.replaceChildren(
    el('div', { class: 'hdr-inner' },
      el('a', { class: 'brand', href: '#/', 'aria-label': 'MavSudamerica', title: t('layout.tagline') }, monogram(),
        el('span', { class: 'brand-word' }, 'Mav', el('b', {}, 'Sudamerica'))),
      el('nav', { class: 'main-nav', 'aria-label': t('nav.main') }, navLinks()),
      el('div', { class: 'hdr-tools' }, langSwitch(), el('div', { class: 'user-area' }, userArea(false)), burger),
    ),
    el('div', { class: 'mobile-menu' + (menuOpen ? ' open' : ''), id: 'mobile-menu' }, navLinks(), userArea(true).map(n => (n.tagName === 'A' ? el('a', { href: n.getAttribute('href'), onclick: closeMenu }, n.textContent) : el('button', { class: 'linklike', type: 'button', onclick: () => { closeMenu(); doLogout(); } }, n.textContent)))),
  );
}
function closeMenu() { if (menuOpen) { menuOpen = false; renderHeader(); } }

// ---- ticker ----
let tickerData = null;
const NAMES = { mavericks: ['Mavericks', 'NBA'], wings: ['Wings', 'WNBA'], cowboys: ['Cowboys', 'NFL'], stars: ['Stars', 'NHL'], rangers: ['Rangers', 'MLB'], fcdallas: ['FC Dallas', 'MLS'] };
const ORDER = ['mavericks', 'wings', 'cowboys', 'stars', 'rangers', 'fcdallas'];
function renderTicker() {
  if (!tickerEl) return;
  const teams = (tickerData || []).filter(x => x && x.result && x.score != null);
  if (!teams.length) { tickerEl.replaceChildren(); tickerEl.className = ''; return; }
  teams.sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  tickerEl.className = 'ticker';
  tickerEl.setAttribute('aria-label', t('layout.ticker'));
  tickerEl.replaceChildren(el('div', { class: 'ticker-in' },
    el('div', { class: 'ticker-label' }, t('layout.ticker')),
    el('ul', { class: 'ticker-list', style: { listStyle: 'none', margin: 0, padding: 0 } }, teams.map(x => {
      const [nm, lg] = NAMES[x.key] || [x.name, x.league];
      const win = x.result === 'W';
      return el('li', { class: 'tk' },
        el('span', { class: 'tk-team' }, nm), el('span', { class: 'tk-lg' }, lg),
        el('span', { class: 'badge ' + (win ? 'badge-win' : x.result === 'T' ? '' : 'badge-loss') }, x.result),
        el('span', { class: 'tk-score' }, `${x.score}-${x.opp_score}`),
        el('span', { class: 'tk-meta' }, `${x.home ? t('common.vs') : t('common.at')} ${x.opponent || ''}`),
        el('span', { class: 'tk-meta' }, fmtDate(x.date, { day: 'numeric', month: 'short' })));
    }))));
}
async function loadTicker() {
  try { const r = await api('/dallas'); tickerData = r.teams || []; } catch { tickerData = null; }
  renderTicker();
}

function renderFooter() {
  if (!footerEl) return;
  footerEl.className = 'site-footer';
  footerEl.replaceChildren(el('div', { class: 'ftr-in' },
    el('a', { class: 'follow', href: 'https://x.com/MavSudamerica', target: '_blank', rel: 'noopener noreferrer' }, xIcon(),
      el('span', {}, t('layout.follow'), el('small', {}, t('layout.followSub')))),
    el('nav', { class: 'ftr-nav', 'aria-label': t('nav.main') }, NAV.map(([p, k]) => el('a', { href: '#' + p }, t(k)))),
    el('p', { class: 'disclaimer' }, '© MavSudamerica · ' + t('layout.disclaimer')),
  ));
}

export function mountLayout() {
  headerEl = document.getElementById('site-header');
  tickerEl = document.getElementById('ticker');
  footerEl = document.getElementById('site-footer');
  renderHeader(); renderFooter(); loadTicker();
  window.addEventListener('routechange', () => { menuOpen = false; renderHeader(); });
  window.addEventListener('hashchange', () => renderHeader());
  onLangChange(() => { renderHeader(); renderFooter(); renderTicker(); });
  onAuthChange(() => renderHeader());
  clearInterval(tickerTimer); tickerTimer = setInterval(loadTicker, 10 * 60 * 1000);
}

export function showLanguageModal() {
  if (document.querySelector('.modal-back')) return;
  const prev = document.activeElement;
  const choose = l => { setLang(l); back.remove(); document.body.style.overflow = ''; prev?.focus?.(); };
  const opts = [['es', 'Español', 'ES'], ['en', 'English', 'EN'], ['pt', 'Português', 'PT']].map(([l, name, code]) =>
    el('button', { class: 'lang-opt', type: 'button', lang: l, onclick: () => choose(l) }, name, el('span', {}, code)));
  const back = el('div', { class: 'modal-back' },
    el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'lm-title' },
      monogram(),
      el('h2', { id: 'lm-title' }, 'Idioma / Language'),
      el('p', {}, 'Elegí · Choose · Escolha'),
      el('div', { class: 'lang-opts' }, opts)));
  back.querySelector('svg').setAttribute('style', 'width:56px;height:56px;margin-bottom:.6rem');
  back.addEventListener('keydown', e => {
    if (e.key === 'Escape') { choose('es'); return; }
    if (e.key === 'Tab') {
      const f = [...back.querySelectorAll('button')]; const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.body.append(back); document.body.style.overflow = 'hidden';
  opts[0].focus();
}
