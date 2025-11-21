import Task from '../models/task.model.js';

export const getTaskAnalyticsForUser = async (user) => {
  const userId = user._id;
  let baseFilter = {};

  if (user.roles.includes('admin')) {
    baseFilter = {};
  } else {
    baseFilter = { $or: [{ owner: userId }, { assignedTo: userId }] };
  }

  const now = new Date();

  const [completed, pending, overdue] = await Promise.all([
    Task.countDocuments({ ...baseFilter, status: 'completed' }),
    Task.countDocuments({ ...baseFilter, status: { $ne: 'completed' } }),
    Task.countDocuments({
      ...baseFilter,
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    })
  ]);

  return { completed, pending, overdue };
};
