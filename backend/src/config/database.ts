import mongoose from 'mongoose';
import { logger } from '../config/logger';

export async function connectDb(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
