const { Client } = require('pg');

const connectionString = 'postgresql://postgres:oggutswllKvpIEmqfjHAFmUDYSLAbROx@sakura.proxy.rlwy.net:19268/railway';

const client = new Client({ connectionString });

client.connect(async (err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }

  try {
    const result = await client.query(
      `SELECT * FROM users WHERE email = $1`,
      ['hola@geyerrivadeneira.site']
    );
    console.log('Usuario encontrado:', result.rows[0]);
    client.end();
  } catch (err) {
    console.error('Error:', err.message);
    client.end();
    process.exit(1);
  }
});
