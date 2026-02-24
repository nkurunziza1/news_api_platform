import { Router } from 'express';
import { validateReq } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators';
import { register, loginHandler } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validateReq(registerSchema), register);
router.post('/login', validateReq(loginSchema), loginHandler);

export default router;
