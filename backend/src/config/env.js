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
  // JWT secrets are required in production; see the post-parse check below.
  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
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

const data = parsed.data;
const inProduction = data.NODE_ENV === 'production';

// JWT secrets must be provided explicitly in production. In development/test we
// fall back to a clearly-insecure default so local runs and CI need no extra
// configuration — this default must never reach production.
const INSECURE_DEFAULT = 'insecure-dev-secret-change-me';
if (inProduction && (!data.JWT_SECRET || !data.JWT_REFRESH_SECRET)) {
  process.stderr.write(
    'JWT_SECRET and JWT_REFRESH_SECRET are required when NODE_ENV=production.\n',
  );
  process.exit(1);
}
data.JWT_SECRET = data.JWT_SECRET || INSECURE_DEFAULT;
data.JWT_REFRESH_SECRET = data.JWT_REFRESH_SECRET || `${INSECURE_DEFAULT}-refresh`;

export const env = data;
export const isTest = env.NODE_ENV === 'test';
export const isProduction = env.NODE_ENV === 'production';
