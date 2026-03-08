require('dotenv').config();

module.exports = {
  development: {
    database: process.env.POSTGRES_DB || 'micelanea',
    username: process.env.POSTGRES_USER || 'micelanea',
    password: process.env.POSTGRES_PASSWORD || 'micelanea123',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};
