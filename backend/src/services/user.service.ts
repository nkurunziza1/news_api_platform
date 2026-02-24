import bcrypt from 'bcrypt';
import { User, IUserDocument } from '../models';
import { RegisterInput } from '../validators';
import { logger } from '../config/logger';

const SALT_ROUNDS = 12;

export async function createUser(input: RegisterInput): Promise<IUserDocument> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered') as Error & { statusCode?: number };
    err.statusCode = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    email: input.email.toLowerCase(),
    password: hashed,
    name: input.name.trim(),
  });
  logger.info('User registered', { userId: user._id, email: user.email });
  return user;
}

export async function findUserByEmail(email: string, includePassword = false): Promise<IUserDocument | null> {
  return User.findOne({ email: email.toLowerCase() })
    .select(includePassword ? '+password' : '')
    .exec();
}

export async function findUserById(id: string): Promise<IUserDocument | null> {
  return User.findById(id).exec();
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
