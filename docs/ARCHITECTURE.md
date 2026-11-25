# MavSudamerica — Architecture contract

Fan site for the Dallas Mavericks run by **@MavSudamerica** (https://x.com/MavSudamerica).
Stack: Node 22 + Express + `node:sqlite` (built-in, no native deps). Frontend: vanilla ES modules, no build step, hash router.

Everything below is a **contract** shared by several developers working in parallel. Do not change it silently;
if you must deviate, keep backwards compatibility.

## Layout

```
server/index.js            Express app: serves /public, mounts /api/*, port = env PORT || 3000
server/db.js               opens SQLite (env DB_PATH || ./data/mavs.db), migrations, seed
server/auth.js             password hashing (scrypt), sessions, middlewares: loadUser, requireUser, requireAdmin
server/espn.js             ESPN public API fetch + 30 min cache (may be unreachable -> always fall back to DB)
server/routes/*.js         one router per area
scripts/import-bref-csv.js Basketball-Reference CSV -> public/data/seasons/<season>.json
public/index.html          single page; loads /js/app.js as module
public/css/styles.css      design system (tokens + shared classes, see below)
public/css/pages/<x>.css   page-specific styles, loaded with loadCSS()
public/js/core.js          shared helpers (see below) — DO NOT duplicate these
public/js/app.js           router, header/nav, Dallas ticker, footer, language modal
public/js/pages/<x>.js     page modules
public/data/seasons/       static stats JSON (index.json + one file per season)
public/data/players.json   player pool for the games (tateti, guess)
```

## Page module interface

```js
// public/js/pages/stats.js
import { t, registerStrings, el, api } from '../core.js';
registerStrings({ es: {...}, en: {...}, pt: {...} });   // at module top level; keys prefixed by page name, e.g. 'stats.title'
export default [
  { path: '/stats', titleKey: 'stats.title', render(container, params, query) { ... return cleanupFnOptional; } },
  { path: '/stats/:season', titleKey: 'stats.title', render(...) {...} },
];
```
- default export: one route object **or** an array of them.
- `render` may be async. `container` is an empty `<main>` child. `params` = path params, `query` = URLSearchParams.
- When the language changes the router re-renders the current route automatically (call cleanup first). So just render using `t()`.
- Routes (owner module): `/` home · `/roster` roster · `/stats`, `/stats/:season`, `/stats/player/:slug` stats · `/forum`, `/forum/:id` forum ·
  `/diary`, `/diary/:id` diary · `/prode` prode · `/tateti` tateti · `/guess` guess · `/ranking` leaderboard ·
  `/login`, `/register` login · `/profile` profile · `/admin` admin.
- Links use hash: `<a href="#/forum/12">`.

## core.js API (already implemented)

| export | description |
|---|---|
| `api(path, {method, body})` | fetch `/api`+path with JSON + cookies. Resolves parsed JSON. Throws `Error` with `.status`, `.data`; message = `data.error` |
| `t(key, vars?)` | translation with `{var}` interpolation; falls back es → key |
| `registerStrings({es,en,pt})` | merge dictionaries |
| `getLang()`, `setLang(l)`, `hasChosenLang()`, `onLangChange(fn)`, `LANGS` | language (`es`/`en`/`pt`), persisted in localStorage + user profile |
| `getUser()`, `setUser(u)`, `loadUser()`, `onAuthChange(fn)`, `isAdmin()` | session user or null |
| `requireLogin(container)` | if logged out, renders a "login required" box into container and returns true |
| `el(tag, attrs, ...children)` | DOM builder. attrs: `class`, `onclick` etc (functions), `html` (trusted only!), others → attributes. children: strings/nodes/arrays/null |
| `toast(msg, type='info'|'ok'|'error')` | notification |
| `loadCSS(href)` | idempotent stylesheet loader, e.g. `loadCSS('/css/pages/stats.css')` |
| `navigate(path)` | go to `#`+path |
| `fmtDate(iso, opts?)`, `fmtDateTime(iso)` | Intl formatting in current lang |
| `fmtNum(n, digits=1)` | number formatting, `—` for null |
| `escapeHtml(s)` | escape |

Never use `innerHTML` with user content; use `el()` text children.

Common translation keys available everywhere: `common.loading, common.error, common.save, common.cancel, common.delete,
common.edit, common.submit, common.send, common.login, common.register, common.logout, common.loginRequired,
common.vs, common.at, common.home, common.away, common.win, common.loss, common.points, common.pts, common.date,
common.player, common.noData, common.back, common.username, common.password, common.reply, common.search, common.season`.

## Design system (public/css/styles.css)

Tokens (CSS custom properties on `:root`): `--navy #002B5E`, `--royal #0064B1`, `--silver #BBC4CA`, `--ink #061922`,
`--paper #F4F6F8`, `--white #fff`, `--win #1E9E5A`, `--loss #C8323C`, `--font-display`, `--font-body`, `--font-mono`, `--radius`, `--gap`.
Shared classes every page should use:
`.page-head` (+ `h1`, `.kicker`), `.card`, `.ticket` (card with perforated edge), `.grid` / `.grid-2` / `.grid-3`, `.btn`, `.btn-primary`, `.btn-ghost`,
`.btn-sm`, `.input`, `.select`, `.textarea`, `.field` (label+input wrapper), `.chip`, `.chip.active`, `.tabs` > `button.active`,
`.table-wrap` > `table.table-stats` (numbers right aligned, `.num` cells use mono font), `.badge`, `.badge-win`, `.badge-loss`,
`.muted`, `.empty`, `.stack` (vertical gap), `.row` (flex row gap wrap), `.spinner`.
Page-specific CSS goes in `public/css/pages/<page>.css`. No official NBA/Mavericks logos or player photos (trademarks):
use the site's own "MS" monogram and generic SVG silhouettes.

## REST API

JSON in/out. Errors: `{ error: "message" }` with proper status (400 validation, 401 not logged, 403 not admin, 404, 409 conflict, 423 locked).
Session: httpOnly cookie `mavs_sid` (SameSite=Lax, 30 days). Admins = usernames listed in env `ADMIN_USERNAMES` (comma separated, case-insensitive, default `MavSudamerica`).

User object: `{ id, username, role: 'user'|'admin', lang, created_at }`.

### Auth
- `POST /api/auth/register {username, password, lang?}` → `{user}` (username 3-20 chars `[A-Za-z0-9_]`, password ≥ 6). Logs in.
- `POST /api/auth/login {username, password}` → `{user}`
- `POST /api/auth/logout` → `{ok:true}`
- `GET /api/auth/me` → `{user: User|null}`
- `PUT /api/auth/lang {lang}` → `{user}`

### Mavs games (used by forum, prode, diary, admin)
Game object:
```
{ id, espn_id|null, season: "2026-27", date: ISO-UTC, opponent: "Phoenix Suns", opponent_abbr: "PHX", home: true,
  status: "scheduled"|"live"|"final", mavs_score|null, opp_score|null,
  leaders: { points:{player,value}, rebounds:{player,value}, assists:{player,value} } | null,   // Mavs leaders
  comment_count, diary_id|null, locked: bool }   // locked = date <= now or status != scheduled
```
- `GET /api/games?status=scheduled|final|all&limit=&from=ISO&to=ISO&order=asc|desc` → `{games:[...]}` (default: scheduled asc, others desc; `from` inclusive, `to` exclusive)
- `GET /api/games/:id` → `{game}`
- `POST /api/games` (admin) body = game fields → `{game}`
- `PUT /api/games/:id` (admin) partial update; when status becomes/is `final` with leaders → prode predictions for that game are (re)scored
- `DELETE /api/games/:id` (admin)
- `POST /api/admin/sync` (admin) → force ESPN sync `{ok, imported, error?}`
- `GET /api/roster` → `{players:[names], details:[{name, espn_id, jersey, position, height_cm, weight_kg, age, country, city, college, experience, injury:{status,detail}|null, stats:{gp,mpg,ppg,rpg,apg,spg,bpg,fgp,tpp,ftp}|null}], coach, season, source:'espn'|'manual'|'default', updated_at}`
  Synced from ESPN every 30 min (and by `POST /api/admin/sync`); `PUT /api/roster {players:[...]}` (admin) sets a manual list until the next sync.
- When the ESPN schedule sync succeeds, demo rows are deleted automatically.

### Forum (comments per game)
- `GET /api/games/:id/comments` → `{comments:[{id, game_id, parent_id|null, user:{id,username}, body, created_at}]}` (asc)
- `POST /api/games/:id/comments {body, parent_id?}` (user, 1-1000 chars) → `{comment}`
- `DELETE /api/comments/:id` (owner or admin) → `{ok:true}`

### Diary ("diario del día de partido", written by admin)
Entry: `{ id, game_id|null, game: Game|null, title, subtitle, body, lang, author, created_at, updated_at }`
`body` is plain text with light markdown: paragraphs split by blank line, `## heading`, `**bold**`, `- list`. Render safely on client.
- `GET /api/diary?limit=` → `{entries:[...]}` (desc) · `GET /api/diary/:id` → `{entry}`
- `POST /api/diary`, `PUT /api/diary/:id`, `DELETE /api/diary/:id` (admin)

### Prode (predictions; account required)
Prediction: `{ game_id, winner: "DAL"|"OPP", top_points, top_rebounds, top_assists, points_awarded|null, created_at, updated_at }`
(top_* = player name from roster; the leader among **Mavericks** players).
Scoring: winner 3 pts, each correct leader 2 pts, all four correct → +3 bonus (max 12). Ties on a leader: any tied player counts as correct
(server accepts `leaders.points.player` as `"A / B"` for ties).
- `GET /api/prode/games/:id` (user) → `{prediction|null}`
- `POST /api/prode/games/:id` (user) → `{prediction}`; 423 if game locked
- `GET /api/prode/mine` (user) → `{predictions:[...with game]}`
- `GET /api/prode/leaderboard` → `{rows:[{username, points, predictions, exact}]}`

### Mini-game scores
- `POST /api/scores {game: "tateti"|"guess", points: int 0..1000, meta?: object}` (user) → `{score}`
  For `guess` with `meta.daily=true` and `meta.date="YYYY-MM-DD"`: only one daily score per user per date (409 otherwise).
- `GET /api/scores/leaderboard?game=tateti|guess|all` → `{rows:[{username, total, best, plays}]}`
- `GET /api/scores/me` → `{scores:[...last 50], totals:{tateti, guess, prode}}`

### Dallas teams ("día a día", last result only)
- `GET /api/dallas` → `{teams:[{key, name, league, opponent, score, opp_score, result:"W"|"L"|"T"|"OTL"|null, date, home, source:"espn"|"manual"}]}`
  keys: `mavericks` (NBA), `cowboys` (NFL), `stars` (NHL), `rangers` (MLB), `fcdallas` (MLS), `wings` (WNBA)
- `PUT /api/dallas/:key` (admin) manual override `{opponent, score, opp_score, result, date, home}`; `DELETE` removes override.
