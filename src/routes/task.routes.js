import { Router } from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { cacheTasks } from '../middleware/cache.middleware.js';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  assignTask,
  getAssignedTasks,
  getAnalytics
} from '../controllers/task.controller.js';

const router = Router();

router.use(auth);

router.post('/', createTask);
router.get('/', cacheTasks, getTasks);



router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);


router.post('/:id/assign', assignTask);


router.get('/assigned/me', getAssignedTasks);
router.get('/analytics/summary', getAnalytics);

export default router;
