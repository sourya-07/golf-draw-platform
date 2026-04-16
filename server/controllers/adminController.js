const supabase = require('../services/supabaseAdmin');
const { generateRandom, generateAlgorithmic, runDraw } = require('../services/drawService');
const { sendPayoutConfirmedEmail } = require('../services/emailService');

// ── Users ──────────────────────────────────────────────────
async function listUsers(req, res) {
  const { search, status, page = 1, limit = 20 } = req.query;
  let query = supabase.from('users').select('*', { count: 'exact' });
  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  if (status) query = query.eq('subscription_status', status);
  const from = (page - 1) * limit;
  query = query.range(from, from + parseInt(limit) - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ users: data, total: count, page: parseInt(page), limit: parseInt(limit) });
}

async function getUserById(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error || !data) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: data });
}

async function updateUser(req, res) {
  const { id } = req.params;
  const allowed = ['full_name', 'subscription_status', 'subscription_plan', 'is_admin', 'charity_id', 'charity_percentage'];
  const updates = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ user: data });
}

async function getUserScores(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('golf_scores').select('*').eq('user_id', id).order('score_date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ scores: data });
}

async function updateUserScores(req, res) {
  const { id } = req.params;
  const { scores } = req.body; // array of { id, score, score_date }
  if (!Array.isArray(scores)) return res.status(400).json({ error: 'scores must be an array' });

  const updates = await Promise.all(
    scores.map(({ id: scoreId, score, score_date }) =>
      supabase.from('golf_scores').update({ score, score_date }).eq('id', scoreId).eq('user_id', id).select().single()
    )
  );
  return res.json({ updated: updates.map((u) => u.data) });
}

// ── Draws ──────────────────────────────────────────────────
async function listAllDraws(req, res) {
  const { data, error } = await supabase
    .from('draws').select('*, prize_pool(*)').order('draw_month', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ draws: data });
}

async function createDraw(req, res) {
  const { draw_month, draw_type, jackpot_amount } = req.body;
  if (!draw_month || !draw_type) return res.status(400).json({ error: 'draw_month and draw_type are required' });

  let winningNumbers;
  if (draw_type === 'random') {
    winningNumbers = generateRandom();
  } else if (draw_type === 'algorithmic') {
    winningNumbers = await generateAlgorithmic(req.body.algo_mode || 'common');
  } else {
    return res.status(400).json({ error: 'draw_type must be "random" or "algorithmic"' });
  }

  const { data, error } = await supabase.from('draws').insert({
    draw_month,
    draw_type,
    winning_numbers: winningNumbers,
    jackpot_amount: jackpot_amount || null,
    status: 'draft',
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ draw: data });
}

async function simulateDraw(req, res) {
  const { id } = req.params;
  try {
    const result = await runDraw(id);
    await supabase.from('draws').update({ status: 'simulated' }).eq('id', id);
    return res.json({ simulation: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function publishDraw(req, res) {
  const { id } = req.params;
  try {
    await runDraw(id);
    await supabase.from('draws').update({
      status: 'published',
      published_at: new Date().toISOString(),
    }).eq('id', id);
    return res.json({ message: 'Draw published and entries processed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ── Charities ──────────────────────────────────────────────
async function createCharity(req, res) {
  const { name, description, image_url, events, is_featured } = req.body;
  if (!name) return res.status(400).json({ error: 'Charity name is required' });
  const { data, error } = await supabase.from('charities').insert({
    name, description, image_url, events: events || [], is_featured: is_featured || false,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ charity: data });
}

async function updateCharity(req, res) {
  const { id } = req.params;
  const { name, description, image_url, events, is_featured, is_active } = req.body;
  const { data, error } = await supabase.from('charities').update({
    name, description, image_url, events, is_featured, is_active,
  }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ charity: data });
}

async function deleteCharity(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from('charities').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Charity deleted' });
}

async function toggleFeatured(req, res) {
  const { id } = req.params;
  const { data: current } = await supabase.from('charities').select('is_featured').eq('id', id).single();
  const { data, error } = await supabase
    .from('charities').update({ is_featured: !current?.is_featured }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ charity: data });
}

// ── Winners ────────────────────────────────────────────────
async function listAllWinners(req, res) {
  const { data, error } = await supabase
    .from('winner_verifications')
    .select(`*, user:users(email, full_name), draw_entry:draw_entries(*, draw:draws(*))`)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ winners: data });
}

async function verifyWinner(req, res) {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status must be approved or rejected' });

  const { data, error } = await supabase
    .from('winner_verifications')
    .update({ status, reviewed_by: req.user.id, reviewed_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ verification: data });
}

async function markPayout(req, res) {
  const { id } = req.params;
  const { data: verification, error: fetchErr } = await supabase
    .from('winner_verifications').select('*, user:users(email, full_name)').eq('id', id).single();
  if (fetchErr || !verification) return res.status(404).json({ error: 'Verification not found' });

  const { data, error } = await supabase
    .from('winner_verifications').update({ payout_status: 'paid' }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });

  if (verification.user) sendPayoutConfirmedEmail(verification.user).catch(console.error);
  return res.json({ verification: data });
}

// ── Reports ────────────────────────────────────────────────
async function getReports(req, res) {
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalDraws },
    { count: totalWinners },
    { data: charityData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('draws').select('*', { count: 'exact', head: true }),
    supabase.from('winner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('users').select('charity_id, charity_percentage').eq('subscription_status', 'active'),
  ]);

  const CONTRIBUTION = parseFloat(process.env.PRIZE_CONTRIBUTION_PER_SUBSCRIBER || 2);
  const estimatedPool = (activeUsers || 0) * CONTRIBUTION;

  return res.json({
    totalUsers,
    activeUsers,
    totalDraws,
    totalWinners,
    estimatedMonthlyPool: estimatedPool,
    charityAllocations: charityData,
  });
}

module.exports = {
  listUsers, getUserById, updateUser, getUserScores, updateUserScores,
  listAllDraws, createDraw, simulateDraw, publishDraw,
  createCharity, updateCharity, deleteCharity, toggleFeatured,
  listAllWinners, verifyWinner, markPayout,
  getReports,
};
