const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
// Use Resend's default test sender (no domain verification required)
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

async function sendEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error('[Email Error]', error);
    return data;
  } catch (err) {
    console.error('[Email Send Failed]', err.message);
  }
}

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Digital Heroes Golf Club 🏌️',
    html: `
      <h1>Welcome, ${user.full_name || 'Golfer'}!</h1>
      <p>You've joined the Digital Heroes Golf Club. Track your scores, support charities, and compete in our monthly draw.</p>
      <p>Head over to your <a href="${process.env.CLIENT_URL}/dashboard">dashboard</a> to get started.</p>
    `,
  });
}

async function sendSubscriptionConfirmedEmail(user) {
  return sendEmail({
    to: user.email,
    subject: '🎉 Subscription Confirmed — You\'re in the draw!',
    html: `
      <h1>Subscription Active</h1>
      <p>Hi ${user.full_name || 'Golfer'}, your subscription to Digital Heroes Golf Club is now active.</p>
      <p>You'll automatically be entered into each monthly prize draw. Start entering your golf scores <a href="${process.env.CLIENT_URL}/dashboard">here</a>.</p>
    `,
  });
}

async function sendDrawResultEmail({ user, matchCount, prizeAmount }) {
  const prizeLine = prizeAmount > 0
    ? `<p>🏆 You won <strong>£${prizeAmount.toFixed(2)}</strong>! Please upload proof of your scores in your dashboard to claim your prize.</p>`
    : `<p>You matched <strong>${matchCount}</strong> number(s) this month. Keep playing — your next draw is coming!</p>`;

  return sendEmail({
    to: user.email,
    subject: `Your Monthly Draw Result — ${matchCount} Match${matchCount !== 1 ? 'es' : ''}`,
    html: `
      <h1>Monthly Draw Results</h1>
      <p>Hi ${user.full_name || 'Golfer'}, the monthly draw has been published.</p>
      ${prizeLine}
      <a href="${process.env.CLIENT_URL}/dashboard">View your dashboard</a>
    `,
  });
}

async function sendWinnerAlertEmail(user) {
  return sendEmail({
    to: user.email,
    subject: '🎊 You\'re a winner! Upload your proof to claim',
    html: `
      <h1>Congratulations, ${user.full_name || 'Golfer'}!</h1>
      <p>You matched enough numbers to win a prize in this month's draw.</p>
      <p>Please <a href="${process.env.CLIENT_URL}/dashboard">upload your score proof</a> within 14 days to claim your prize.</p>
    `,
  });
}

async function sendPayoutConfirmedEmail(user) {
  return sendEmail({
    to: user.email,
    subject: '💰 Your Prize Payout Has Been Processed',
    html: `
      <h1>Payout Confirmed</h1>
      <p>Hi ${user.full_name || 'Golfer'}, your prize payout has been marked as completed. Check your bank account within 3–5 business days.</p>
    `,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendSubscriptionConfirmedEmail,
  sendDrawResultEmail,
  sendWinnerAlertEmail,
  sendPayoutConfirmedEmail,
};
