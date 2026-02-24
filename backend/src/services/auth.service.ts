import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findUserByEmail, verifyPassword } from './user.service';
import { LoginInput } from '../validators';
import { AuthPayload } from '../middleware/auth';

export async function login(input: LoginInput): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
  const user = await findUserByEmail(input.email, true);
  if (!user || !user.password) {
    const err = new Error('Invalid email or password') as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }
  const ok = await verifyPassword(input.password, user.password);
  if (!ok) {
    const err = new Error('Invalid email or password') as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }
  const payload: AuthPayload = { userId: user._id.toString(), email: user.email };
  const token = jwt.sign(
    payload,
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );
  return {
    token,
    user: { id: user._id.toString(), email: user.email, name: user.name },
  };
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(
    payload,
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );
}
