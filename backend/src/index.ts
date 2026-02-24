import app from './app';
import { env } from './config/env';
import { connectDb } from './config/database';
import { logger } from './config/logger';

async function main(): Promise<void> {
  await connectDb(env.MONGODB_URI);
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error('Fatal error', err);
  process.exit(1);
});
