const supabase = require('../services/supabaseAdmin');

async function getScores(req, res) {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(5);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ scores: data });
}

async function addScore(req, res) {
  const userId = req.user.id;
  const { score, score_date } = req.body;

  // Validate score range
  const numScore = parseInt(score);
  if (!numScore || numScore < 1 || numScore > 45) {
    return res.status(400).json({ error: 'Score must be between 1 and 45' });
  }
  if (!score_date) return res.status(400).json({ error: 'score_date is required' });

  // Check for duplicate date
  const { data: existing } = await supabase
    .from('golf_scores')
    .select('id')
    .eq('user_id', userId)
    .eq('score_date', score_date)
    .single();
  if (existing) {
    return res.status(409).json({
      error: 'You already have a score for this date. Edit or delete the existing entry.',
      code: 'DUPLICATE_DATE',
    });
  }

  // Enforce 5-score rolling window: delete oldest if already at 5
  const { data: currentScores } = await supabase
    .from('golf_scores')
    .select('id, score_date')
    .eq('user_id', userId)
    .order('score_date', { ascending: true });

  if (currentScores && currentScores.length >= 5) {
    const oldest = currentScores[0];
    await supabase.from('golf_scores').delete().eq('id', oldest.id);
  }

  // Insert new score
  const { data: newScore, error: insertErr } = await supabase
    .from('golf_scores')
    .insert({ user_id: userId, score: numScore, score_date })
    .select()
    .single();
  if (insertErr) return res.status(500).json({ error: insertErr.message });

  // Return all current scores
  const { data: allScores } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false });

  return res.status(201).json({ score: newScore, scores: allScores });
}

async function updateScore(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { score, score_date } = req.body;

  // Confirm ownership
  const { data: existing } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (!existing) return res.status(404).json({ error: 'Score not found' });

  const updates = {};
  if (score !== undefined) {
    const numScore = parseInt(score);
    if (numScore < 1 || numScore > 45) return res.status(400).json({ error: 'Score must be between 1 and 45' });
    updates.score = numScore;
  }
  if (score_date) {
    // Check for date conflict (excluding current record)
    const { data: dateConflict } = await supabase
      .from('golf_scores')
      .select('id')
      .eq('user_id', userId)
      .eq('score_date', score_date)
      .neq('id', id)
      .single();
    if (dateConflict) return res.status(409).json({ error: 'You already have a score for this date.' });
    updates.score_date = score_date;
  }

  const { data: updated, error } = await supabase
    .from('golf_scores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ score: updated });
}

async function deleteScore(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const { data: existing } = await supabase
    .from('golf_scores')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (!existing) return res.status(404).json({ error: 'Score not found' });

  const { error } = await supabase.from('golf_scores').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: 'Score deleted' });
}

module.exports = { getScores, addScore, updateScore, deleteScore };
