// Express application wiring. Kept separate from server.js so tests can import the
// app (via Supertest) without binding a port.
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  app.use('/api', routes);

  // Unmatched routes, then the global error handler (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
