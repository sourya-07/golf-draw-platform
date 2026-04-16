const supabase = require('../services/supabaseAdmin');
const { sendWelcomeEmail } = require('../services/emailService');

async function register(req, res) {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authErr) return res.status(400).json({ error: authErr.message });

    const userId = authData.user.id;

    // Insert into users table
    const { error: insertErr } = await supabase.from('users').insert({
      id: userId,
      email,
      full_name: full_name || null,
      subscription_status: 'inactive',
      is_admin: false,
    });
    if (insertErr) return res.status(500).json({ error: insertErr.message });

    // Send welcome email (fire and forget)
    sendWelcomeEmail({ email, full_name }).catch(console.error);

    return res.status(201).json({ message: 'User registered successfully', userId });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: profile,
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

async function logout(req, res) {
  try {
    await supabase.auth.signOut();
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed' });
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, logout, me };
