// Shared helpers for every page. See docs/ARCHITECTURE.md.

export const LANGS = ['es', 'en', 'pt'];
const LANG_KEY = 'mavs_lang';

// ---------- i18n ----------
const dict = { es: {}, en: {}, pt: {} };
const langListeners = new Set();

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }

let lang = LANGS.includes(safeGet(LANG_KEY)) ? safeGet(LANG_KEY) : 'es';
document.documentElement.lang = lang;

export function registerStrings(strings) {
  for (const l of LANGS) Object.assign(dict[l], strings[l] || {});
}

export function t(key, vars) {
  let s = dict[lang][key] ?? dict.es[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  return s;
}

export function getLang() { return lang; }
export function hasChosenLang() { return LANGS.includes(safeGet(LANG_KEY)); }
export function onLangChange(fn) { langListeners.add(fn); return () => langListeners.delete(fn); }
export function setLang(l) {
  if (!LANGS.includes(l)) return;
  safeSet(LANG_KEY, l);
  const changed = l !== lang;
  lang = l;
  document.documentElement.lang = l;
  if (currentUser && currentUser.lang !== l) {
    api('/auth/lang', { method: 'PUT', body: { lang: l } }).then(r => { currentUser = r.user; }).catch(() => {});
  }
  if (changed) langListeners.forEach(fn => fn(l));
}

// ---------- API ----------
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---------- auth ----------
let currentUser = null;
const authListeners = new Set();
export function getUser() { return currentUser; }
export function isAdmin() { return currentUser?.role === 'admin'; }
export function onAuthChange(fn) { authListeners.add(fn); return () => authListeners.delete(fn); }
export function setUser(u) {
  currentUser = u || null;
  authListeners.forEach(fn => fn(currentUser));
}
export async function loadUser() {
  try {
    const r = await api('/auth/me');
    currentUser = r.user || null;
  } catch { currentUser = null; }
  return currentUser;
}

export function requireLogin(container) {
  if (currentUser) return false;
  const next = encodeURIComponent(location.hash.slice(1) || '/');
  container.append(
    el('div', { class: 'card login-required stack' },
      el('h2', {}, t('common.loginRequired')),
      el('div', { class: 'row' },
        el('a', { class: 'btn btn-primary', href: `#/login?next=${next}` }, t('common.login')),
        el('a', { class: 'btn btn-ghost', href: `#/register?next=${next}` }, t('common.register')),
      ),
    ),
  );
  return true;
}

// ---------- DOM ----------
export function el(tag, attrs = {}, ...children) {
  const node = document.createElementNS(
    attrs && attrs.svg ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml', tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false || k === 'svg') continue;
    if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k === 'value' && 'value' in node) node.value = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  const add = c => {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(add);
    else node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  };
  children.forEach(add);
  return node;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastBox;
export function toast(msg, type = 'info') {
  if (!toastBox) {
    toastBox = el('div', { class: 'toasts', 'aria-live': 'polite' });
    document.body.append(toastBox);
  }
  const n = el('div', { class: `toast toast-${type}` }, msg);
  toastBox.append(n);
  setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 400); }, 3200);
}

const loadedCSS = new Set();
export function loadCSS(href) {
  if (loadedCSS.has(href)) return;
  loadedCSS.add(href);
  document.head.append(el('link', { rel: 'stylesheet', href }));
}

export function navigate(path) { location.hash = '#' + path; }

const LOCALES = { es: 'es-AR', en: 'en-US', pt: 'pt-BR' };
export function fmtDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(LOCALES[lang], opts).format(new Date(iso));
}
export function fmtDateTime(iso) {
  return fmtDate(iso, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export function fmtNum(n, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(LOCALES[lang], { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

// ---------- common strings ----------
registerStrings({
  es: {
    'common.loading': 'Cargando…', 'common.error': 'Algo salió mal', 'common.save': 'Guardar', 'common.cancel': 'Cancelar',
    'common.delete': 'Borrar', 'common.edit': 'Editar', 'common.submit': 'Enviar', 'common.send': 'Enviar',
    'common.login': 'Ingresar', 'common.register': 'Crear cuenta', 'common.logout': 'Salir',
    'common.loginRequired': 'Necesitás una cuenta para usar esta sección', 'common.vs': 'vs', 'common.at': '@',
    'common.home': 'Local', 'common.away': 'Visitante', 'common.win': 'Victoria', 'common.loss': 'Derrota',
    'common.points': 'Puntos', 'common.pts': 'pts', 'common.date': 'Fecha', 'common.player': 'Jugador',
    'common.noData': 'Sin datos todavía', 'common.back': 'Volver', 'common.username': 'Usuario',
    'common.password': 'Contraseña', 'common.reply': 'Responder', 'common.search': 'Buscar', 'common.season': 'Temporada',
  },
  en: {
    'common.loading': 'Loading…', 'common.error': 'Something went wrong', 'common.save': 'Save', 'common.cancel': 'Cancel',
    'common.delete': 'Delete', 'common.edit': 'Edit', 'common.submit': 'Submit', 'common.send': 'Send',
    'common.login': 'Log in', 'common.register': 'Sign up', 'common.logout': 'Log out',
    'common.loginRequired': 'You need an account to use this section', 'common.vs': 'vs', 'common.at': '@',
    'common.home': 'Home', 'common.away': 'Away', 'common.win': 'Win', 'common.loss': 'Loss',
    'common.points': 'Points', 'common.pts': 'pts', 'common.date': 'Date', 'common.player': 'Player',
    'common.noData': 'No data yet', 'common.back': 'Back', 'common.username': 'Username',
    'common.password': 'Password', 'common.reply': 'Reply', 'common.search': 'Search', 'common.season': 'Season',
  },
  pt: {
    'common.loading': 'Carregando…', 'common.error': 'Algo deu errado', 'common.save': 'Salvar', 'common.cancel': 'Cancelar',
    'common.delete': 'Apagar', 'common.edit': 'Editar', 'common.submit': 'Enviar', 'common.send': 'Enviar',
    'common.login': 'Entrar', 'common.register': 'Criar conta', 'common.logout': 'Sair',
    'common.loginRequired': 'Você precisa de uma conta para usar esta seção', 'common.vs': 'vs', 'common.at': '@',
    'common.home': 'Casa', 'common.away': 'Fora', 'common.win': 'Vitória', 'common.loss': 'Derrota',
    'common.points': 'Pontos', 'common.pts': 'pts', 'common.date': 'Data', 'common.player': 'Jogador',
    'common.noData': 'Sem dados ainda', 'common.back': 'Voltar', 'common.username': 'Usuário',
    'common.password': 'Senha', 'common.reply': 'Responder', 'common.search': 'Buscar', 'common.season': 'Temporada',
  },
});
