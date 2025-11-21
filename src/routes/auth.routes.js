import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import { loginRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', register);

router.post('/login', loginRateLimiter, login);
router.post('/logout', auth, logout);

export default router;
