import { Router } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { requireRoles } from '../middleware/rolesBased.middleware.js';
import { createTeam, addMember, getMyTeam } from '../controllers/team.controller.js';

const router = Router();

router.use(auth);

router.post('/', requireRoles('admin'), createTeam);
router.post('/:teamId/add-member', requireRoles('admin', 'manager'), addMember);
router.get('/me', requireRoles('manager'), getMyTeam);

export default router;
