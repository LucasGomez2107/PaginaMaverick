// MavSudamerica server: static frontend + JSON API.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupSessions } from './db.js';
import { seedDemo } from './seed.js';
import { loadUser } from './auth.js';
import { startSyncLoop } from './espn.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import commentRoutes from './routes/comments.js';
import diaryRoutes from './routes/diary.js';
import prodeRoutes from './routes/prode.js';
import scoreRoutes from './routes/scores.js';
import dallasRoutes from './routes/dallas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3000;

seedDemo();
cleanupSessions();
setInterval(cleanupSessions, 60 * 60 * 1000).unref();

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY);

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  });
  next();
});

const api = express.Router();
api.use(express.json({ limit: '100kb' }));
api.use(loadUser);
api.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
for (const r of [authRoutes, gameRoutes, commentRoutes, diaryRoutes, prodeRoutes, scoreRoutes, dallasRoutes]) api.use(r);
api.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use('/api', api);

app.use(express.static(PUBLIC_DIR, { index: 'index.html', maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.expose || status < 500 ? err.message : 'Error interno del servidor';
  if (err.type === 'entity.parse.failed') { status = 400; message = 'JSON inválido'; }
  if (err.type === 'entity.too.large') { status = 413; message = 'Solicitud demasiado grande'; }
  if (status >= 500) console.error(err);
  if (res.headersSent) return;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`MavSudamerica listening on http://localhost:${PORT}`);
  startSyncLoop();
});
