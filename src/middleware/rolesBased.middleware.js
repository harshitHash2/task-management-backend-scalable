export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({ message: 'insufficient role' });
    }
    next();
  };
};
