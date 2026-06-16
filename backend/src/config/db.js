// Single shared Knex instance for the whole backend. Services import this — no
// other module constructs its own connection. Selects the connection profile
// from knexfile.js based on NODE_ENV.
import knex from 'knex';
import configs from '../../knexfile.js';
import { env } from './env.js';

const config = configs[env.NODE_ENV] || configs.development;

export const db = knex(config);
