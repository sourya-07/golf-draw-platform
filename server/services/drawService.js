const supabase = require('./supabaseAdmin');
const { sendDrawResultEmail, sendWinnerAlertEmail } = require('./emailService');

/**
 * Generate 5 random winning numbers 1–45
 */
function generateRandom() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate 5 winning numbers algorithmically based on score frequency
 * type: 'common' → pick most frequent | 'rare' → pick least frequent
 */
async function generateAlgorithmic(type = 'common') {
  const { data: scores } = await supabase.from('golf_scores').select('score');
  const freq = {};
  (scores || []).forEach(({ score }) => {
    freq[score] = (freq[score] || 0) + 1;
  });

  // Fill missing numbers with 0 frequency
  for (let i = 1; i <= 45; i++) {
    if (!freq[i]) freq[i] = 0;
  }

  const sorted = Object.entries(freq).sort((a, b) =>
    type === 'common' ? b[1] - a[1] : a[1] - b[1]
  );

  return sorted.slice(0, 5).map(([n]) => parseInt(n)).sort((a, b) => a - b);
}

/**
 * Run a draw: snapshot entries, compare scores, calculate prizes
 */
async function runDraw(drawId) {
  // 1. Get the draw record
  const { data: draw, error: drawErr } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single();
  if (drawErr || !draw) throw new Error('Draw not found');

  const winningNumbers = draw.winning_numbers;

  // 2. Get all active subscribers with their scores
  const { data: activeUsers } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('subscription_status', 'active');

  if (!activeUsers || activeUsers.length === 0) {
    return { message: 'No active subscribers', entries: [] };
  }

  const userIds = activeUsers.map((u) => u.id);
  const userMap = Object.fromEntries(activeUsers.map((u) => [u.id, u]));

  // 3. Get scores for each active user
  const { data: allScores } = await supabase
    .from('golf_scores')
    .select('user_id, score')
    .in('user_id', userIds);

  // Group scores by user
  const scoresByUser = {};
  (allScores || []).forEach(({ user_id, score }) => {
    if (!scoresByUser[user_id]) scoresByUser[user_id] = [];
    scoresByUser[user_id].push(score);
  });

  // 4. Calculate prize pool
  const CONTRIBUTION = parseFloat(process.env.PRIZE_CONTRIBUTION_PER_SUBSCRIBER || 2);
  const totalPool = activeUsers.length * CONTRIBUTION;

  // Get rollover from previous draw (if any)
  const { data: prevPool } = await supabase
    .from('prize_pool')
    .select('rolled_over_amount')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  const rolledOver = prevPool?.rolled_over_amount || 0;

  const grandTotal = totalPool + rolledOver;
  const jackpotPool = grandTotal * 0.40;
  const fourMatchPool = grandTotal * 0.35;
  const threeMatchPool = grandTotal * 0.25;

  // 5. Build draw entries
  const entries = [];
  for (const user of activeUsers) {
    const userScores = scoresByUser[user.id] || [];
    const matchCount = userScores.filter((s) => winningNumbers.includes(s)).length;
    let prizeTier = 'none';
    if (matchCount === 5) prizeTier = '5_match';
    else if (matchCount === 4) prizeTier = '4_match';
    else if (matchCount === 3) prizeTier = '3_match';

    entries.push({
      draw_id: drawId,
      user_id: user.id,
      submitted_numbers: userScores,
      match_count: matchCount,
      prize_tier: prizeTier,
      prize_amount: 0,
    });
  }

  // 6. Calculate prize distribution
  const fiveMatches = entries.filter((e) => e.prize_tier === '5_match');
  const fourMatches = entries.filter((e) => e.prize_tier === '4_match');
  const threeMatches = entries.filter((e) => e.prize_tier === '3_match');

  let jackpotRolledOver = false;
  let rolledOverAmount = 0;

  if (fiveMatches.length > 0) {
    const share = jackpotPool / fiveMatches.length;
    fiveMatches.forEach((e) => (e.prize_amount = parseFloat(share.toFixed(2))));
  } else {
    jackpotRolledOver = true;
    rolledOverAmount = jackpotPool;
  }

  if (fourMatches.length > 0) {
    const share = fourMatchPool / fourMatches.length;
    fourMatches.forEach((e) => (e.prize_amount = parseFloat(share.toFixed(2))));
  }

  if (threeMatches.length > 0) {
    const share = threeMatchPool / threeMatches.length;
    threeMatches.forEach((e) => (e.prize_amount = parseFloat(share.toFixed(2))));
  }

  // 7. Insert draw entries
  await supabase.from('draw_entries').delete().eq('draw_id', drawId);
  const { error: insertErr } = await supabase.from('draw_entries').insert(entries);
  if (insertErr) throw new Error(`Failed to insert draw entries: ${insertErr.message}`);

  // 8. Insert prize pool record
  await supabase.from('prize_pool').insert({
    draw_id: drawId,
    total_pool: grandTotal,
    jackpot_pool: jackpotPool,
    four_match_pool: fourMatchPool,
    three_match_pool: threeMatchPool,
    rolled_over_amount: rolledOverAmount,
  });

  // 9. Update draw with jackpot rollover info
  await supabase
    .from('draws')
    .update({ jackpot_rolled_over: jackpotRolledOver })
    .eq('id', drawId);

  // 10. Create winner_verifications for prize winners
  const winners = entries.filter((e) => e.prize_tier !== 'none' && e.prize_amount > 0);

  // Get inserted draw_entries IDs
  const { data: insertedEntries } = await supabase
    .from('draw_entries')
    .select('id, user_id, prize_tier')
    .eq('draw_id', drawId)
    .neq('prize_tier', 'none');

  for (const entry of insertedEntries || []) {
    await supabase.from('winner_verifications').insert({
      draw_entry_id: entry.id,
      user_id: entry.user_id,
      status: 'pending',
      payout_status: 'pending',
    });
  }

  // 11. Send result emails (fire and forget)
  for (const entry of entries) {
    const user = userMap[entry.user_id];
    if (user) {
      sendDrawResultEmail({ user, matchCount: entry.match_count, prizeAmount: entry.prize_amount }).catch(console.error);
      if (entry.prize_amount > 0) {
        sendWinnerAlertEmail(user).catch(console.error);
      }
    }
  }

  return {
    totalEntries: entries.length,
    winners: winners.length,
    jackpotRolledOver,
    grandTotal,
    prizePool: { jackpotPool, fourMatchPool, threeMatchPool },
  };
}

module.exports = { generateRandom, generateAlgorithmic, runDraw };
