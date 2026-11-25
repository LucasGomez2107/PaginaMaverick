// Password hashing (scrypt), sessions, auth middlewares, rate limiting.
import crypto from 'node:crypto';
import { db, nowIso } from './db.js';

export const COOKIE = 'mavs_sid';
const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 86400000;
export const LANGS = ['es', 'en', 'pt'];

// ---------- passwords ----------
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}
export function verifyPassword(pw, stored) {
  try {
    const [algo, saltB64, hashB64] = String(stored).split('$');
    if (algo !== 'scrypt') return false;
    const expected = Buffer.from(hashB64, 'base64');
    const actual = crypto.scryptSync(pw, Buffer.from(saltB64, 'base64'), expected.length, SCRYPT);
    return crypto.timingSafeEqual(expected, actual);
  } catch { return false; }
}

// ---------- users ----------
function adminSet() {
  return new Set((process.env.ADMIN_USERNAMES ?? 'MavSudamerica')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
}
export function isAdminName(username) { return adminSet().has(String(username).toLowerCase()); }

export function userView(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: isAdminName(row.username) ? 'admin' : 'user',
    lang: row.lang,
    created_at: row.created_at,
  };
}

// ---------- sessions ----------
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    let v = part.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
  }
  return out;
}

function cookieString(value, maxAgeSec) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSec}`];
  if (maxAgeSec > 0) parts.push(`Expires=${new Date(Date.now() + maxAgeSec * 1000).toUTCString()}`);
  else parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(sha256(token), userId, new Date(Date.now() + SESSION_MS).toISOString());
  res.append('Set-Cookie', cookieString(token, SESSION_DAYS * 86400));
}

export function destroySession(req, res) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  res.append('Set-Cookie', cookieString('', 0));
}

// ---------- middlewares ----------
export function loadUser(req, _res, next) {
  req.user = null;
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (token) {
    const row = db.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?`).get(sha256(token), nowIso());
    if (row) req.user = userView(row);
  }
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Necesitás iniciar sesión' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Necesitás iniciar sesión' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });
  next();
}

// ---------- rate limiting (in-memory, fixed window) ----------
const buckets = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
}, 60000).unref();

export function rateLimit({ name, windowMs, max, byUser = false }) {
  return (req, res, next) => {
    if (process.env.RATE_LIMIT === '0') return next();
    const who = byUser && req.user ? `u${req.user.id}` : (req.ip || req.socket.remoteAddress || '?');
    const key = `${name}:${who}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || b.reset <= now) { b = { count: 0, reset: now + windowMs }; buckets.set(key, b); }
    b.count++;
    if (b.count > max) {
      res.set('Retry-After', String(Math.ceil((b.reset - now) / 1000)));
      return res.status(429).json({ error: 'Demasiadas solicitudes, probá de nuevo en un rato' });
    }
    next();
  };
}
