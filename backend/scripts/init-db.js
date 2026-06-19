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
    console.log('Conectando a la base de datos...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`User: ${process.env.DB_USERNAME}`);
    
    await client.connect();
    console.log('✓ Conectado a la base de datos');

    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'usuarios'
      );
    `);

    if (checkResult.rows[0].exists) {
      console.log('✓ Las tablas ya existen, omitiendo inicialización');
      const userCount = await client.query('SELECT COUNT(*) FROM usuarios');
      console.log(`✓ Usuarios en la base de datos: ${userCount.rows[0].count}`);
    } else {
      console.log('Inicializando base de datos...');
      await client.query(sql);
      console.log('✓ Base de datos inicializada correctamente');
    }
  } catch (error) {
    console.error('✗ Error al inicializar la base de datos:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✓ Conexión cerrada');
  }
}

initDb();
