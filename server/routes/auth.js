import { Router } from 'express';
import { db } from '../db.js';
import {
  hashPassword, verifyPassword, createSession, destroySession, userView, requireUser, rateLimit, LANGS,
} from '../auth.js';

const r = Router();
const authLimit = rateLimit({ name: 'auth', windowMs: 15 * 60 * 1000, max: 30 });

r.post('/auth/register', authLimit, (req, res) => {
  const { username, password, lang } = req.body || {};
  if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Usuario inválido (3-20 caracteres: letras, números o _)' });
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 200) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  if (lang != null && !LANGS.includes(lang)) return res.status(400).json({ error: 'Idioma inválido' });
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) {
    return res.status(409).json({ error: 'Ese usuario ya existe' });
  }
  let info;
  try {
    info = db.prepare('INSERT INTO users (username, pass_hash, lang) VALUES (?, ?, ?)')
      .run(username, hashPassword(password), lang || 'es');
  } catch (e) {
    if (/UNIQUE/i.test(e.message)) return res.status(409).json({ error: 'Ese usuario ya existe' });
    throw e;
  }
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  createSession(res, row.id);
  res.status(201).json({ user: userView(row) });
});

r.post('/auth/login', authLimit, (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!row || !verifyPassword(password, row.pass_hash)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  createSession(res, row.id);
  res.json({ user: userView(row) });
});

r.post('/auth/logout', (req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
});

r.get('/auth/me', (req, res) => res.json({ user: req.user || null }));

r.put('/auth/lang', requireUser, (req, res) => {
  const { lang } = req.body || {};
  if (!LANGS.includes(lang)) return res.status(400).json({ error: 'Idioma inválido' });
  db.prepare('UPDATE users SET lang = ? WHERE id = ?').run(lang, req.user.id);
  res.json({ user: userView(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)) });
});

export default r;
