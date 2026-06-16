// Rate limiting. The login limiter throttles repeated attempts from one IP
// (PRD §5.1) and responds with the standard error envelope on 429.
import rateLimit from 'express-rate-limit';
import { ERROR_CODES } from '../config/constants.js';
import { fail } from '../utils/response.js';
import { isTest } from '../config/env.js';

// Factory so tests can build a limiter with a small max and assert the 429
// behaviour in isolation, without tripping the real login route.
export function createLoginRateLimiter({ max } = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: max ?? (isTest ? 1000 : 10),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res
        .status(429)
        .json(
          fail(ERROR_CODES.RATE_LIMITED, 'Too many login attempts. Please try again later.'),
        );
    },
  });
}

export const loginRateLimiter = createLoginRateLimiter();
