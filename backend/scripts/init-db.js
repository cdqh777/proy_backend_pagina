const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function initDb() {
  const sqlPath = path.join(__dirname, '..', '..', 'db', 'dblibreria.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_HOST?.includes('render.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');
    await client.query(sql);
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDb();
