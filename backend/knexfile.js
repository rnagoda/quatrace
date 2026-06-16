// Knex configuration for QuaTrace. Connections come from the environment so no
// credentials are ever hardcoded. Migrations and seeds are versioned under db/.
import 'dotenv/config';

const shared = {
  client: 'pg',
  migrations: {
    directory: './db/migrations',
    extension: 'js',
  },
  seeds: {
    directory: './db/seeds',
  },
  pool: { min: 2, max: 10 },
};

const config = {
  development: {
    ...shared,
    connection: process.env.DATABASE_URL,
  },
  test: {
    ...shared,
    connection: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  },
  production: {
    ...shared,
    connection: process.env.DATABASE_URL,
  },
};

export default config;
