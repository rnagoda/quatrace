// Validates and exposes environment configuration. Fail fast on misconfiguration
// so problems surface at startup, not deep inside a request. All values come from
// process.env — never hardcoded.
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  TEST_DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Use stderr directly here — the logger depends on this config, so it may not
  // exist yet at the moment validation fails.
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  process.stderr.write(`Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

export const env = parsed.data;
export const isTest = env.NODE_ENV === 'test';
export const isProduction = env.NODE_ENV === 'production';
