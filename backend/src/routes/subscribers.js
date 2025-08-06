import express from 'express';
import pool from '../db.js';
import stripePkg from 'stripe';
import { authenticateJWT } from './auth.js';

const router = express.Router();
const stripe = stripePkg(process.env.STRIPE_SECRET_KEY);

router.post('/', authenticateJWT, async (req, res) => {
  const { subscription_tier } = req.body;
  const { id: user_id, email } = req.user;
  try {
    await pool.query(
      `INSERT INTO subscriptions (user_id, email, subscription_tier, subscribed, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE SET subscription_tier = $3, subscribed = $4, updated_at = NOW()`,
      [user_id, email, subscription_tier, subscription_tier === 'Pro']
    );
    res.json({ message: 'Subscription updated' });
  } catch (err) {
    res.status(500).json({ error: 'Subscription update failed' });
  }
});

router.get('/', authenticateJWT, async (req, res) => {
  const { id: user_id } = req.user;
  const result = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [user_id]);
  res.json(result.rows[0] || {});
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // TODO: handle subscription events, update DB
  res.json({ received: true });
});

export default router; 