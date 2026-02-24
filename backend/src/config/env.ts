import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/news_platform_test'),
  JWT_SECRET: z.string().min(1).default('test-jwt-secret-min-16-chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  if (process.env.NODE_ENV !== 'test') {
    require('dotenv').config();
  }
  const parsed = envSchema.safeParse({
    ...process.env,
    ...(process.env.NODE_ENV === 'test' && {
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/news_platform_test',
      JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-min-16-chars',
    }),
  });
  if (!parsed.success) {
    throw new Error(`Invalid env: ${parsed.error.flatten().fieldErrors}`);
  }
  return parsed.data;
}

export const env = loadEnv();
