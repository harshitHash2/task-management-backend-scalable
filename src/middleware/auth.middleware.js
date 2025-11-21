import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token available' });
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User dont exist' });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
