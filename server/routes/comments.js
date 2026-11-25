import { Router } from 'express';
import { db, getGame } from '../db.js';
import { requireUser, rateLimit } from '../auth.js';

const r = Router();
const postLimit = rateLimit({ name: 'comment', windowMs: 60 * 1000, max: 10, byUser: true });

function view(row) {
  return {
    id: row.id,
    game_id: row.game_id,
    parent_id: row.parent_id ?? null,
    user: { id: row.user_id, username: row.username },
    body: row.deleted ? '' : row.body,
    deleted: !!row.deleted,
    created_at: row.created_at,
  };
}
const SELECT = 'SELECT c.*, u.username FROM comments c JOIN users u ON u.id = c.user_id';

r.get('/games/:id/comments', (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: 'Partido no encontrado' });
  const rows = db.prepare(`${SELECT} WHERE c.game_id = ? ORDER BY c.created_at ASC, c.id ASC`).all(game.id);
  res.json({ comments: rows.map(view) });
});

r.post('/games/:id/comments', requireUser, postLimit, (req, res) => {
  const game = getGame(req.params.id);
  if (!game) return res.status(404).json({ error: 'Partido no encontrado' });
  const { body, parent_id } = req.body || {};
  const text = typeof body === 'string' ? body.trim() : '';
  if (text.length < 1 || text.length > 1000) return res.status(400).json({ error: 'El comentario debe tener entre 1 y 1000 caracteres' });
  let parent = null;
  if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
    parent = db.prepare('SELECT id, game_id FROM comments WHERE id = ?').get(Number(parent_id));
    if (!parent || parent.game_id !== game.id) return res.status(400).json({ error: 'Comentario padre inválido' });
  }
  const info = db.prepare('INSERT INTO comments (game_id, parent_id, user_id, body) VALUES (?, ?, ?, ?)')
    .run(game.id, parent ? parent.id : null, req.user.id, text);
  res.status(201).json({ comment: view(db.prepare(`${SELECT} WHERE c.id = ?`).get(info.lastInsertRowid)) });
});

// Soft delete: keeps thread structure; body becomes "" and deleted:true.
r.delete('/comments/:id', requireUser, (req, res) => {
  const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(Number(req.params.id));
  if (!row || row.deleted) return res.status(404).json({ error: 'Comentario no encontrado' });
  if (row.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'No podés borrar este comentario' });
  db.prepare("UPDATE comments SET deleted = 1, body = '' WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default r;
