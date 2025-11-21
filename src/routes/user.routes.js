import { Router } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { getProfile } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', auth, getProfile);

export default router;
