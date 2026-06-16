// The application logger. Use this everywhere — never console.log in committed code.
import pino from 'pino';
import { env, isTest } from '../config/env.js';

export const logger = pino({
  level: isTest ? 'silent' : env.LOG_LEVEL,
});
