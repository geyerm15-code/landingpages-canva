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
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        'hola@geyerrivadeneira.site',
        '$2a$10$su7URQ8UATn/XMdKL2IPiO6aUs1srh5P5HXVGyNs3J4/dmGotoLMu',
        'Admin',
        'admin'
      ]
    );
    console.log('✓ Usuario creado:', result.rows[0]);
    client.end();
  } catch (err) {
    console.error('Insert error:', err.message);
    client.end();
    process.exit(1);
  }
});
