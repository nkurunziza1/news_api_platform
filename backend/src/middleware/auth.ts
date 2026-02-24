import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models';
import { logger } from '../config/logger';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      next({ statusCode: 401, message: 'Authentication required' });
      return;
    }
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    const user = await User.findById(decoded.userId).select('_id email role');
    if (!user) {
      next({ statusCode: 401, message: 'User not found' });
      return;
    }
    req.user = { userId: user._id.toString(), email: user.email };
    next();
  } catch (e) {
    logger.debug('Auth middleware error', e);
    next({ statusCode: 401, message: 'Invalid or expired token' });
  }
}

export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as AuthPayload;
    const user = await User.findById(decoded.userId).select('_id email role');
    if (user) req.user = { userId: user._id.toString(), email: user.email };
  } catch (_) {}
  next();
}

export function requireRole(...roles: string[]) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const user = await User.findById(req.user?.userId).select('role');
    if (!user || !roles.includes(user.role)) {
      next({ statusCode: 403, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
