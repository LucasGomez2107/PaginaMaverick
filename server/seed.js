// Demo data, inserted only when the games table is empty and SEED_DEMO !== '0'.
import { db, tx, nowIso } from './db.js';

const DAY = 86400000;

function at(daysFromNow, hourUtc = 0, minute = 30) {
  const d = new Date(Date.now() + daysFromNow * DAY);
  d.setUTCHours(hourUtc, minute, 0, 0);
  return d.toISOString();
}

export function seedDemo() {
  if (process.env.SEED_DEMO === '0') return false;
  if (db.prepare('SELECT COUNT(*) AS n FROM games').get().n > 0) return false;

  const ins = db.prepare(`INSERT INTO games (season, date, opponent, opponent_abbr, home, status, mavs_score, opp_score, leaders, demo)
    VALUES ('2026-27', ?, ?, ?, ?, ?, ?, ?, ?, 1)`);
  const L = (p, pv, r, rv, a, av) => JSON.stringify({
    points: { player: p, value: pv }, rebounds: { player: r, value: rv }, assists: { player: a, value: av },
  });

  tx(() => {
    const finals = [
      [at(-6, 1), 'Phoenix Suns', 'PHX', 1, 118, 109, L('Cooper Flagg', 31, 'Anthony Davis', 13, 'Kyrie Irving', 8)],
      [at(-4, 2), 'Denver Nuggets', 'DEN', 0, 104, 112, L('Kyrie Irving', 27, 'Dereck Lively II', 11, 'Cooper Flagg', 6)],
      [at(-2, 0), 'San Antonio Spurs', 'SAS', 1, 121, 115, L('Anthony Davis', 29, 'Anthony Davis', 14, 'Kyrie Irving', 9)],
    ];
    const ids = finals.map(f => Number(ins.run(f[0], f[1], f[2], f[3], 'final', f[4], f[5], f[6]).lastInsertRowid));

    const scheduled = [
      [at(1, 1), 'Los Angeles Lakers', 'LAL', 1],
      [at(3, 0), 'Oklahoma City Thunder', 'OKC', 0],
      [at(6, 1), 'Houston Rockets', 'HOU', 1],
      [at(9, 3), 'Golden State Warriors', 'GSW', 0],
      [at(12, 1), 'Memphis Grizzlies', 'MEM', 1],
    ];
    for (const s of scheduled) ins.run(s[0], s[1], s[2], s[3], 'scheduled', null, null, null);

    const body = [
      'Noche de American Airlines Center llena y un cierre de partido que nos devolvió la sonrisa. Dallas le ganó 121-115 a San Antonio con un último cuarto de mucha personalidad.',
      '## Las claves',
      '- **Anthony Davis** dominó la pintura: 29 puntos y 14 rebotes, con tres tapas en los minutos decisivos.',
      '- **Kyrie Irving** manejó los tiempos: 9 asistencias y dos triples seguidos para cortar la racha de los Spurs.',
      '- **Cooper Flagg** aportó defensa en todo el campo y energía en la transición.',
      '## Para mejorar',
      'Las pérdidas en el tercer cuarto (seis en apenas ocho minutos) dejaron a San Antonio volver al partido. Contra rivales del Oeste de primer nivel eso se paga caro.',
      'Próxima parada: los Lakers en casa. ¡Vamos Mavs!',
    ].join('\n\n');
    db.prepare(`INSERT INTO diary (game_id, title, subtitle, body, lang, author, demo)
      VALUES (?, ?, ?, ?, 'es', 'MavSudamerica', 1)`).run(
      ids[2], 'Davis manda en la pintura y Dallas cierra con autoridad',
      'Mavericks 121 - Spurs 115: crónica del día de partido', body);

    const ov = db.prepare(`INSERT OR IGNORE INTO dallas_overrides (key, opponent, score, opp_score, result, date, home, demo, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`);
    const now = nowIso();
    ov.run('mavericks', 'San Antonio Spurs', 121, 115, 'W', finals[2][0], 1, now);
    ov.run('cowboys', 'Philadelphia Eagles', 24, 20, 'W', at(-3, 21), 1, now);
    ov.run('stars', 'Colorado Avalanche', 2, 3, 'OTL', at(-1, 1), 0, now);
    ov.run('rangers', 'Houston Astros', 5, 3, 'W', at(-58, 0), 1, now);
    ov.run('fcdallas', 'Houston Dynamo', 1, 1, 'T', at(-30, 1), 1, now);
    ov.run('wings', 'Las Vegas Aces', 88, 92, 'L', at(-80, 0), 0, now);
  });
  console.log('[seed] demo data inserted');
  return true;
}

export function deleteDemo() {
  return tx(() => {
    const d = db.prepare('DELETE FROM diary WHERE demo = 1').run().changes;
    const g = db.prepare('DELETE FROM games WHERE demo = 1').run().changes;
    const o = db.prepare('DELETE FROM dallas_overrides WHERE demo = 1').run().changes;
    return { games: Number(g), diary: Number(d), overrides: Number(o) };
  });
}
