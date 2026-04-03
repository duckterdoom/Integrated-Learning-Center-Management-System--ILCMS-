/**
 * export.js — Exports the ilcms_db database to a .sql file.
 * Run from the Backend folder:
 *   node database/export.js
 *
 * Output: Backend/database/ilcms_db.sql
 */
import mysql from 'mysql2/promise';
import fs    from 'fs';
import path  from 'path';
import dotenv from 'dotenv';
dotenv.config();

const OUTPUT = path.join('database', 'ilcms_db.sql');

const TABLE_ORDER = [
  'Role',
  'User',
  'PasswordResetRequest',
  'Course',
  'Student',
  'Class',
  'Enrollment',
  'Attendance',
  'Score',
];

async function exportDB() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'ilcms_db',
    multipleStatements: false,
  });

  console.log('Connected to MySQL...');

  const lines = [];

  lines.push('-- ============================================================');
  lines.push(`-- ILCMS Database Export`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- ============================================================');
  lines.push('');
  lines.push('SET FOREIGN_KEY_CHECKS = 0;');
  lines.push(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ilcms_db'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  lines.push(`USE \`${process.env.DB_NAME || 'ilcms_db'}\`;`);
  lines.push('');

  for (const table of TABLE_ORDER) {
    // Check if table exists
    const [exists] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || 'ilcms_db', table]
    );
    if (exists[0].cnt === 0) {
      console.log(`  ⚠ Table ${table} not found — skipping`);
      continue;
    }

    // DROP + CREATE
    const [[{ 'Create Table': createSQL }]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    lines.push(`-- ── Table: ${table} ────────────────────────────────`);
    lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);
    lines.push(createSQL + ';');
    lines.push('');

    // Data rows
    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    if (rows.length > 0) {
      const cols = Object.keys(rows[0]).map((c) => `\`${c}\``).join(', ');
      const valueLines = rows.map((row) => {
        const vals = Object.values(row).map((v) => {
          if (v === null)             return 'NULL';
          if (v instanceof Date)      return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          if (typeof v === 'number')  return v;
          return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
        });
        return `  (${vals.join(', ')})`;
      });
      lines.push(`INSERT INTO \`${table}\` (${cols}) VALUES`);
      lines.push(valueLines.join(',\n') + ';');
      lines.push('');
      console.log(`  ✓ ${table} — ${rows.length} row(s)`);
    } else {
      console.log(`  ✓ ${table} — 0 rows`);
    }
  }

  lines.push('SET FOREIGN_KEY_CHECKS = 1;');
  lines.push('');
  lines.push('-- Export complete.');

  fs.writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
  await conn.end();

  console.log(`\n✅ Exported to: ${OUTPUT}`);
  console.log('\nTesters can import it with:');
  console.log('  mysql -u root -p < database/ilcms_db.sql');
}

exportDB().catch((err) => {
  console.error('\n❌ Export failed:', err.message);
  process.exit(1);
});
