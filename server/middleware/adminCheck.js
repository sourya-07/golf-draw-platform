function adminCheck(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthenticated' });

  if (!user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

module.exports = adminCheck;
