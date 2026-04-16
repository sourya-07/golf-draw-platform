const supabase = require('../services/supabaseAdmin');

async function listCharities(req, res) {
  const { search, featured } = req.query;
  let query = supabase.from('charities').select('*').eq('is_active', true);
  if (search) query = query.ilike('name', `%${search}%`);
  if (featured === 'true') query = query.eq('is_featured', true);
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ charities: data });
}

async function getFeaturedCharities(req, res) {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ charities: data });
}

async function getCharityById(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase.from('charities').select('*').eq('id', id).single();
  if (error || !data) return res.status(404).json({ error: 'Charity not found' });
  return res.json({ charity: data });
}

module.exports = { listCharities, getFeaturedCharities, getCharityById };
