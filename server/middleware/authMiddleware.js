const supabase = require('../services/supabaseAdmin');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user profile from our users table
    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user = profile;
    req.token = token;
    next();
  } catch (err) {
    console.error('[authMiddleware]', err.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
