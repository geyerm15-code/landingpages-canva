const { Client } = require('pg');

const connectionString = 'postgresql://postgres:oggutswllKvpIEmqfjHAFmUDYSLAbROx@sakura.proxy.rlwy.net:19268/railway';

const client = new Client({ connectionString });

client.connect(async (err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }

  try {
    // Borrar tabla si existe
    await client.query(`DROP TABLE IF EXISTS users CASCADE`);
    console.log('✓ Tabla eliminada');
    
    client.end();
  } catch (err) {
    console.error('Error:', err.message);
    client.end();
    process.exit(1);
  }
});
