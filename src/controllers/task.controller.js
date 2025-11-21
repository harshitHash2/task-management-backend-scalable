import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import { getIO } from "../config/socket.js";
import { invalidateTasksCache } from "../middleware/cache.middleware.js";
import { sendNotification } from "../services/notification.service.js";
import { getTaskAnalyticsForUser } from "../services/task.service.js";
import { enqueueTask } from "../queue/queue.service.js";

export const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    // await enqueueTask({ title, description, dueDate, priority, status, owner: req.user._id });
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      owner: req.user._id,
    });

    await invalidateTasksCache();

    try {
      const io = getIO();
      io.emit("task_created", task);
    } catch (e) {
      console.error("Socket emit error:", e.message);
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      dueFrom,
      dueTo,
      assignedTo,
      sortBy,
      sortOrder,
      search,
    } = req.query;

    const filter = {};

    if (req.user.roles.includes("admin")) {
      console.log("this is admin");
    } else {
      filter.$or = [{ owner: req.user._id }, { assignedTo: req.user._id }];
    }

    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    if (dueFrom || dueTo) {
      filter.dueDate = {};
      if (dueFrom) {
        filter.dueDate.$gte = new Date(dueFrom);
      }
      if (dueTo) {
        filter.dueDate.$lte = new Date(dueTo);
      }
    }
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    const tasks = await Task.find(filter).sort(sort);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    let task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwnTask = task.owner.toString() === req.user._id.toString();

    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();


    const isAuthorize = req.user.roles.includes("admin") || req.user.roles.includes("manager");


    if (!isOwnTask && !isAssigned && !isAuthorize) {
      return res
        .status(403)
        .json({ message: "No permission to update this task" });
    }

    const oldStatus = task.status;
    Object.assign(task, req.body);
    await task.save();

    await invalidateTasksCache();

    try {
      const io = getIO();
      io.emit("task_updated", task);
    } catch (e) {
      console.error("Socket emit error:", e.message);
    }

    if (task.assignedTo && oldStatus !== task.status) {
      const assignee = await User.findById(task.assignedTo);
      if (assignee) {
        await enqueueTask({
          userId: assignee._id,
          email: assignee.email,
          type: "TASK_STATUS_CHANGED",
          payload: {
            taskId: task._id,
            title: task.title,
            oldStatus,
            newStatus: task.status,
          },
        });
        // await sendNotification({
        //   userId: assignee._id,
        //   email: assignee.email,
        //   type: 'TASK_STATUS_CHANGED',
        //   payload: {
        //     taskId: task._id,
        //     title: task.title,
        //     oldStatus,
        //     newStatus: task.status
        //   }
        // });
      }
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    let task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwnTask = task.owner.toString() === req.user._id.toString();
    const isAuthorize = req.user.roles.includes("admin");

    if (!isOwnTask && !isAuthorize) {
      return res
        .status(403)
        .json({ message: "No permission" });
    }

    await Task.findByIdAndDelete(id);
    await invalidateTasksCache();

    try {
      const io = getIO();
      io.emit("task_deleted", { id });
    } catch (e) {
      console.error("Socket emit error:", e.message);
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

export const assignTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    let task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "user not found" });

    const isAdmin = req.user.roles.includes("admin");
    const isManager = req.user.roles.includes("manager");
    const isOwnTask = task.owner.toString() === req.user._id.toString();

    if (isAdmin) {
      console.log('this is admin')
    } else if (isManager) {

      const managerTeam = await Team.findOne({ manager: req.user._id });
console.log('Manager team assign task control',managerTeam)
      if (!managerTeam) {
        return res
          .status(403)
          .json({ message: "Manager has no team" });
      }

      const isMember = managerTeam.members
        .map((m) => m.toString())
        .includes(userId.toString());
        console.log('is member assign task control', isMember);
      if (!isMember) {
        return res.status(403).json({
          message: "Manager can assign only to team members",
        });
      }
    } else if (isOwnTask) {
      if (userId !== req.user._id.toString()) {
        return res.status(403).json({ message: "User cant assign other" });
      }
    } else {
      return res.status(403).json({ message: "unauthorized" });
    }

    task.assignedTo = userId;
    await task.save();
    await invalidateTasksCache();

    try {
      const io = getIO();
      io.emit("task_assigned", task);
    } catch (e) {
      console.error("Socket emit error", e.message);
    }
    await enqueueTask({
      userId: targetUser._id,
      email: targetUser.email,
      type: "TASK_ASSIGNED",
      payload: {
        taskId: task._id,
        title: task.title,
      },
    });
    // await sendNotification({
    //   userId: targetUser._id,
    //   email: targetUser.email,
    //   type: 'TASK_ASSIGNED',
    //   payload: {
    //     taskId: task._id,
    //     title: task.title
    //   }
    // });

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const getAssignedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const stats = await getTaskAnalyticsForUser(req.user);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};
