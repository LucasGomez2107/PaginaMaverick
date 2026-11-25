# MavSudamerica

Sitio de fans de los **Dallas Mavericks**, hecho para la comunidad de [@MavSudamerica](https://x.com/MavSudamerica).

## Qué es

Un sitio para seguir a los Mavs desde Sudamérica (y el resto del mundo):

- **Estadísticas por temporada** y perfil de cada jugador.
- **Foro por partido**, para comentar cada juego mientras pasa.
- **Diario del partido**, con la crónica escrita por el admin.
- **Prode**: predecí ganador y líderes de cada partido y sumá puntos.
- **Tateti** y **Adivina el jugador** para pasar el rato.
- **Dallas día a día**: el último resultado de los equipos de la ciudad.
- Disponible en **español, inglés y portugués**.

## Requisitos

- **Node.js 22.13 o superior** (usa `node:sqlite`, que viene incluido, así que no hay dependencias nativas que compilar).

## Correr localmente

```bash
npm install
npm start
```

Después abrí http://localhost:3000 en el navegador.

## Variables de entorno

| Variable | Default | Para qué sirve |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor. |
| `DB_PATH` | `./data/mavs.db` | Ruta del archivo SQLite. |
| `ADMIN_USERNAMES` | `MavSudamerica` | Usernames con permisos de admin, separados por coma. |
| `NODE_ENV` | (vacío) | Con `production` la cookie de sesión es segura (solo HTTPS). |
| `ESPN_SYNC` | `1` | `0` desactiva la sincronización automática con ESPN. |
| `SEED_DEMO` | `1` | `0` evita cargar los datos de ejemplo. |

## Cómo ser admin

1. Registrate en la página con el usuario `MavSudamerica` (o con el que hayas puesto en `ADMIN_USERNAMES`).
2. Listo: aparece el menú **Admin**.

## Panel admin

Desde el menú Admin podés:

- **Cargar partidos y resultados.** Al marcar un partido como final con los líderes de los Mavs, el prode se calcula solo.
- **Escribir el diario** del partido.
- **Editar el plantel.**
- **Corregir resultados** de los equipos de Dallas (Mavericks, Cowboys, Stars, Rangers, FC Dallas y Wings) cuando ESPN no está bien o no llega.
- **Sincronizar con ESPN** a mano.
- **Borrar los datos de ejemplo.**

## Prode

Reglas de puntuación:

- **Ganador correcto:** 3 puntos.
- **Cada líder de los Mavs** (puntos, rebotes y asistencias) acertado: 2 puntos cada uno.
- **Pleno** (acertar los tres líderes): +3 puntos de bonus.
- **Máximo por partido: 12 puntos.**

Las predicciones se cierran cuando arranca el partido.

## Estadísticas

Los datos iniciales de las temporadas son una **base a verificar**, no una fuente oficial. Para actualizarlos con Basketball-Reference:

1. Entrá a [basketball-reference.com](https://www.basketball-reference.com) y buscá la temporada de los Mavs.
2. En la tabla **Per Game**, tocá **Share & Export** → **Get table as CSV**.
3. Guardá el CSV (por ejemplo, `per_game.csv`) y corré:

```bash
node scripts/import-bref-csv.js 2026-27 per_game.csv --wins 10 --losses 5 --coach "Jason Kidd" --playoff in_progress
```

Cambiá la temporada, el récord, el entrenador y el estado de playoffs según corresponda.

## Publicarlo en internet

### Render.com (paso a paso)

1. En Render, elegí **New → Web Service** y conectá el repositorio de GitHub.
2. **Build command:** `npm install`
3. **Start command:** `npm start`
4. Agregá un **Persistent Disk** montado en `/var/data`. Sin disco, la base se borra en cada deploy.
5. En las variables de entorno, poné `DB_PATH=/var/data/mavs.db` y `NODE_ENV=production`.

Railway y Fly.io también funcionan. En ambos necesitás un volumen para el archivo de SQLite.

## Aviso

Este es un **sitio de fans no oficial**. No tiene afiliación con los Dallas Mavericks ni con la NBA, y no usa logos oficiales.

## Estructura de carpetas

```
server/index.js            Servidor Express; sirve /public y la API en /api
server/db.js               Base SQLite, migraciones y datos de ejemplo
server/auth.js             Usuarios, sesiones y permisos
server/espn.js             Consultas a ESPN (con caché y respaldo en la base)
server/routes/*.js         Una ruta por área
scripts/import-bref-csv.js Importa CSV de Basketball-Reference a public/data/seasons/
public/index.html          Página única
public/css/                Estilos (global y por página)
public/js/                 Módulos del frontend (core, app y páginas)
public/data/               Datos estáticos (temporadas y jugadores)
docs/ARCHITECTURE.md       Contrato técnico del proyecto
data/                      Base de datos SQLite (no se sube al repo)
```
