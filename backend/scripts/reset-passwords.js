const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function resetPasswords() {
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
    await client.connect();
    console.log('Conectado para resetear contraseñas');

    for (const { email, password } of passwords) {
      const hash = await bcrypt.hash(password, 10);
      await client.query(
        'UPDATE usuarios SET contrasena = $1 WHERE correo = $2',
        [hash, email]
      );
      console.log(`✓ Contraseña actualizada para ${email}: ${password}`);
    }

    console.log('✓ Todas las contraseñas fueron reseteadas');
  } catch (error) {
    console.error('✗ Error al resetear contraseñas:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetPasswords();
