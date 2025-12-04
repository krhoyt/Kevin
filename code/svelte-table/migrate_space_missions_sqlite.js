#!/usr/bin/env node

// Migrate space_missions.log (pipe-delimited with inconsistent spacing and comments)
// into a SQLite database.
//
// Usage:
//   node migrate_space_missions_sqlite.js [--input path] [--db path] [--table name]
// Defaults:
//   --input space_missions.log
//   --db    space_missions.db
//   --table missions

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function parseArgs(argv) {
  const args = { input: 'space_missions.log', db: 'space_missions.db', table: 'missions' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' && argv[i + 1]) { args.input = argv[++i]; continue; }
    if (a === '--db' && argv[i + 1]) { args.db = argv[++i]; continue; }
    if (a === '--table' && argv[i + 1]) { args.table = argv[++i]; continue; }
    if (a === '-h' || a === '--help') {
      console.log('Usage: node migrate_space_missions_sqlite.js [--input path] [--db path] [--table name]');
      process.exit(0);
    }
  }
  return args;
}

function requireSqlite() {
  try {
    return require('better-sqlite3');
  } catch (e) {
    console.error('Missing dependency: better-sqlite3. Install with:');
    console.error('  npm i better-sqlite3');
    process.exit(1);
  }
}

function toIntOrNull(s) {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function toFloatOrNull(s) {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

(async function main() {
  const { input, db: dbPath, table } = parseArgs(process.argv);
  const inputPath = path.resolve(process.cwd(), input);
  const sqlitePath = path.resolve(process.cwd(), dbPath);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const BetterSqlite3 = requireSqlite();
  const db = new BetterSqlite3(sqlitePath);

  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY,
      date TEXT,
      mission_id TEXT UNIQUE,
      destination TEXT,
      status TEXT,
      crew_size INTEGER,
      duration_days REAL,
      success_rate REAL,
      security_code TEXT
    );
  `;

  const createIndexesSQL = [
    `CREATE INDEX IF NOT EXISTS ${table}_dest_status_idx ON ${table}(destination, status);`,
    `CREATE INDEX IF NOT EXISTS ${table}_duration_idx ON ${table}(duration_days);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ${table}_mission_id_uq ON ${table}(mission_id);`
  ];

  db.exec(createTableSQL);
  for (const sql of createIndexesSQL) db.exec(sql);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO ${table} (
      date, mission_id, destination, status, crew_size, duration_days, success_rate, security_code
    ) VALUES (@date, @mission_id, @destination, @status, @crew_size, @duration_days, @success_rate, @security_code);
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertStmt.run(row);
  });

  const rows = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(inputPath),
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    if (!line) return;
    // Trim leading whitespace for comment detection
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#')) return; // comment

    // Split on '|' and trim fields
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 8) return; // malformed line

    // Optional header guard
    if (/^date$/i.test(parts[0]) && /^mission id$/i.test(parts[1])) return;

    const [date, missionId, destination, status, crewSizeRaw, durationRaw, successRateRaw, securityCode] = parts;

    // Parse numerics with tolerance for junk (e.g., %, extra spaces)
    const crew_size = toIntOrNull(crewSizeRaw.replace(/[^0-9-]+/g, ''));
    const duration_days = toFloatOrNull(durationRaw.replace(/[^0-9.+-]+/g, ''));

    // Keep success_rate as numeric percent (e.g., 95 for 95%) if present
    let srClean = successRateRaw.replace(/%/g, '').trim();
    const success_rate = toFloatOrNull(srClean);

    const row = {
      date: date || null,
      mission_id: missionId || null,
      destination: destination || null,
      status: status || null,
      crew_size,
      duration_days,
      success_rate,
      security_code: securityCode || null,
    };

    // Require essential fields
    if (!row.mission_id || !row.destination || !row.status) return;

    rows.push(row);
  });

  await new Promise((resolve) => rl.on('close', resolve));

  insertMany(rows);

  // Summary
  const count = db.prepare(`SELECT COUNT(*) as c FROM ${table};`).get().c;
  console.log(`Imported ${rows.length} rows. Table '${table}' now has ${count} rows in ${path.basename(sqlitePath)}.`);

  db.close();
})();
