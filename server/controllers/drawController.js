const supabase = require('../services/supabaseAdmin');

async function listDraws(req, res) {
  const { data, error } = await supabase
    .from('draws')
    .select('*, prize_pool(*)')
    .eq('status', 'published')
    .order('draw_month', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ draws: data });
}

async function getDrawById(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('draws')
    .select('*, prize_pool(*)')
    .eq('id', id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Draw not found' });
  return res.json({ draw: data });
}

async function getMyEntry(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', id)
    .eq('user_id', userId)
    .single();
  if (error) return res.status(404).json({ error: 'No entry found for this draw' });
  return res.json({ entry: data });
}

module.exports = { listDraws, getDrawById, getMyEntry };
