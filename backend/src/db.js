const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'micelanea',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'micelanea',
  password: process.env.POSTGRES_PASSWORD || 'micelanea123',
  port: process.env.POSTGRES_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
