import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const signToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      roles: user.roles,
      tokenVersion: user.tokenVersion
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};
