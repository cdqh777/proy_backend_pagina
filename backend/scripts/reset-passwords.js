const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function resetPasswords() {
  console.log('=== INICIANDO SCRIPT reset-passwords ===');
  console.log('Variables de entorno:');
  console.log(`  DB_HOST: ${process.env.DB_HOST}`);
  console.log(`  DB_USERNAME: ${process.env.DB_USERNAME}`);
  console.log(`  DB_DATABASE: ${process.env.DB_DATABASE}`);

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_HOST?.includes('render.com') ? { rejectUnauthorized: false } : false,
  });

  const passwords = [
    { email: 'admin.libreria@gmail.com', password: 'Admin123' },
    { email: 'vendedor1.libreria@gmail.com', password: 'Vendedor123' },
    { email: 'vendedor2.libreria@gmail.com', password: 'Vendedor123' },
    { email: 'vendedor3.libreria@gmail.com', password: 'Vendedor123' },
  ];

  try {
    console.log('Conectando para resetear contraseñas...');
    await client.connect();
    console.log('✓ Conectado para resetear contraseñas');

    const checkUsers = await client.query('SELECT correo FROM usuarios');
    console.log(`✓ Usuarios encontrados en BD: ${checkUsers.rows.length}`);
    checkUsers.rows.forEach(row => console.log(`  - ${row.correo}`));

    for (const { email, password } of passwords) {
      console.log(`Procesando ${email}...`);
      const hash = await bcrypt.hash(password, 10);
      const result = await client.query(
        'UPDATE usuarios SET contrasena = $1 WHERE correo = $2',
        [hash, email]
      );
      console.log(`✓ Contraseña actualizada para ${email}: ${password} (filas afectadas: ${result.rowCount})`);
    }

    console.log('✓ Todas las contraseñas fueron reseteadas');
  } catch (error) {
    console.error('✗ Error al resetear contraseñas:', error.message);
    console.error('Detalles completos:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✓ Conexión cerrada');
    console.log('=== FIN SCRIPT reset-passwords ===\n');
  }
}

resetPasswords();
