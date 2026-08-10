const knex = require('knex');
const { DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
  pool: {
    min: 0,
    max: Number(process.env.DATABASE_POOL_MAX || 5)
  }
});

module.exports = db;
