export const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      team: user.team
    });
  } catch (err) {
    next(err);
  }
};
