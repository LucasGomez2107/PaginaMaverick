import { Router } from 'express';
import { db, nowIso, getGame } from '../db.js';
import { requireAdmin, LANGS } from '../auth.js';

const r = Router();

function view(row) {
  if (!row) return null;
  return {
    id: row.id,
    game_id: row.game_id ?? null,
    game: row.game_id ? getGame(row.game_id) : null,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    lang: row.lang,
    author: row.author,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function fields(b, partial) {
  b = b || {};
  const has = k => Object.prototype.hasOwnProperty.call(b, k);
  const f = {};
  const err = msg => Object.assign(new Error(msg), { status: 400 });
  if (has('title') || !partial) {
    if (typeof b.title !== 'string' || !b.title.trim() || b.title.length > 200) throw err('Título requerido (máx. 200)');
    f.title = b.title.trim();
  }
  if (has('subtitle') || !partial) {
    const s = b.subtitle ?? '';
    if (typeof s !== 'string' || s.length > 300) throw err('Subtítulo inválido (máx. 300)');
    f.subtitle = s.trim();
  }
  if (has('body') || !partial) {
    const s = b.body ?? '';
    if (typeof s !== 'string' || s.length > 20000) throw err('Texto inválido (máx. 20000)');
    f.body = s.replace(/\r\n/g, '\n');
  }
  if (has('lang') || !partial) {
    const l = b.lang ?? 'es';
    if (!LANGS.includes(l)) throw err('Idioma inválido');
    f.lang = l;
  }
  if (has('game_id') || !partial) {
    const g = b.game_id;
    if (g === null || g === undefined || g === '') f.game_id = null;
    else {
      if (!getGame(g)) throw err('Partido inexistente');
      f.game_id = Number(g);
    }
  }
  return f;
}

r.get('/diary', (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
  const rows = db.prepare('SELECT * FROM diary ORDER BY created_at DESC, id DESC LIMIT ?').all(limit);
  res.json({ entries: rows.map(view) });
});

r.get('/diary/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM diary WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Entrada no encontrada' });
  res.json({ entry: view(row) });
});

r.post('/diary', requireAdmin, (req, res) => {
  const f = fields(req.body, false);
  f.author = req.user.username;
  const cols = Object.keys(f);
  const info = db.prepare(`INSERT INTO diary (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...Object.values(f));
  res.status(201).json({ entry: view(db.prepare('SELECT * FROM diary WHERE id = ?').get(info.lastInsertRowid)) });
});

r.put('/diary/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM diary WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Entrada no encontrada' });
  const f = fields(req.body, true);
  f.updated_at = nowIso();
  f.demo = 0;
  db.prepare(`UPDATE diary SET ${Object.keys(f).map(k => `${k} = ?`).join(', ')} WHERE id = ?`).run(...Object.values(f), row.id);
  res.json({ entry: view(db.prepare('SELECT * FROM diary WHERE id = ?').get(row.id)) });
});

r.delete('/diary/:id', requireAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM diary WHERE id = ?').run(Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Entrada no encontrada' });
  res.json({ ok: true });
});

export default r;
