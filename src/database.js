const knex = require('knex');
const fs = require('fs');
const path = require('path');
const { DATABASE_URL } = require('./config');

const connection = process.env.DATABASE_SSL_CA === 'supabase'
  ? {
      connectionString: DATABASE_URL,
      ssl: {
        ca: fs.readFileSync(
          path.join(__dirname, '..', 'certs', 'prod-ca-2021.crt'),
          'utf8'
        ),
        rejectUnauthorized: true
      }
    }
  : DATABASE_URL;

const db = knex({
  client: 'pg',
  connection,
  pool: {
    min: 0,
    max: Number(process.env.DATABASE_POOL_MAX || 5)
  }
});

module.exports = db;
