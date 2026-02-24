import { Response, NextFunction } from 'express';
import { createUser } from '../services/user.service';
import { login } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export async function register(
  req: AuthenticatedRequest & { body: RegisterInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await createUser(req.body);
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function loginHandler(
  req: AuthenticatedRequest & { body: LoginInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await login(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}
