const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function readSql(file) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) throw new Error(`SQL file not found: ${p}`);
  return fs.readFileSync(p, 'utf8');
}

(async () => {
  try {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = Number(process.env.DB_PORT || 3306);
    const adminUser = process.env.INIT_DB_USER || 'root';
    const adminPass = process.env.INIT_DB_PASS || '';
    const dbName    = process.env.DB_NAME || 'zug_zwang';

    console.log(`[initDB] Connecting as ${adminUser}@${host}:${port} …`);
    const conn = await mysql.createConnection({
      host, port, user: adminUser, password: adminPass, multipleStatements: true,
    });

    const schemaSQL = readSql('setUpDB.sql');
    console.log('[initDB] Running setUpDB.sql …');
    await conn.query(schemaSQL);

    await conn.query(`USE \`${dbName}\`;`);

    if (process.env.SKIP_TEST === '1') {
      console.log('[initDB] SKIP_TEST=1 set — skipping testData.sql.');
    } else {
      const seedPath = path.join(__dirname, 'testData.sql');
      if (fs.existsSync(seedPath)) {
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        if (seedSQL.trim().length) {
          console.log('[initDB] Running testData.sql …');
          await conn.query('SET FOREIGN_KEY_CHECKS=0;');
          await conn.query(seedSQL);
          await conn.query('SET FOREIGN_KEY_CHECKS=1;');
        } else {
          console.log('[initDB] testData.sql is empty — skipping.');
        }
      } else {
        console.log('[initDB] testData.sql not found — skipping.');
      }
    }

    await conn.end();
    console.log('OK. Database initialized and seeded successfully.');
  } catch (e) {
    console.error('Error. Failed to init DB:', e.message);
    process.exit(1);
  }
})();
