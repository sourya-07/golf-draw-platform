function subscriptionCheck(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthenticated' });

  if (user.subscription_status !== 'active') {
    return res.status(403).json({
      error: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
      subscription_status: user.subscription_status,
    });
  }

  next();
}

module.exports = subscriptionCheck;
