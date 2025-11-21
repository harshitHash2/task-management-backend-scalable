import Team from '../models/team.model.js';
import User from '../models/user.model.js';

export const createTeam = async (req, res, next) => {
  try {
    const { name, managerId } = req.body;

    if (!name || !managerId) {
      return res.status(400).json({ message: 'name and manager ID are required' });
    }

    const manager = await User.findById(managerId);
    if (!manager || !manager.roles.includes('manager')) {
      return res.status(400).json({ message: 'Manager not found' });
    }

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(409).json({ message: 'Team name already exist' });
    }

    const team = await Team.create({
      name,
      manager: managerId,
      members: [managerId]
    });

    manager.team = team._id;
    await manager.save();

    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (req.user.roles.includes('manager') && team.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Manager can only change its own team' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!team.members.map(m => m.toString()).includes(userId.toString())) {
      team.members.push(userId);
      await team.save();
    }

    user.team = teamId;
    await user.save();

    res.json(team);
  } catch (err) {
    next(err);
  }
};

export const getMyTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({ manager: req.user._id }).populate('members', 'username email roles');
    if (!team) {
      return res.status(404).json({ message: 'No team found' });
    }
    res.json(team);
  } catch (err) {
    next(err);
  }
};
