import 'dotenv/config.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import Postgrator from 'postgrator';

const useTestDatabase = process.argv.includes('--test');
const connectionString = useTestDatabase
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  const variableName = useTestDatabase ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
  throw new Error(`${variableName} is required to run migrations.`);
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const databaseName = new URL(connectionString).pathname.replace(/^\//, '');
const client = new pg.Client({ connectionString });
const migrationPattern = `${path.resolve(currentDirectory, '..', 'migrations').replace(/\\/g, '/')}/*`;

try {
  await client.connect();

  const postgrator = new Postgrator({
    migrationPattern,
    driver: 'pg',
    database: databaseName,
    schemaTable: 'schemaversion',
    execQuery: query => client.query(query)
  });

  const migrations = await postgrator.migrate('max');
  const target = useTestDatabase ? 'test database' : 'development/production database';
  console.log(`Applied ${migrations.length} migration(s) to the ${target}.`);
} finally {
  await client.end();
}
