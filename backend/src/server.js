// Process entry point: start listening. Importing app.js separately keeps the
// HTTP wiring testable without opening a socket.
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`QuaTrace API listening on port ${env.PORT}`);
});

// Graceful shutdown so the dev watcher and containers stop cleanly.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    logger.info(`${signal} received, shutting down.`);
    server.close(() => process.exit(0));
  });
}
