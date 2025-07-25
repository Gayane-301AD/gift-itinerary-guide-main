import express from 'express';
import pool from '../db.js';
import { authenticateJWT } from './auth.js';

const router = express.Router();

router.get('/', authenticateJWT, async (req, res) => {
  const { id: user_id } = req.user;
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
    [user_id]
  );
  res.json(result.rows);
});

router.post('/:id/read', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
  res.json({ message: 'Notification marked as read' });
});

router.post('/', authenticateJWT, async (req, res) => {
  const { title, message, type } = req.body;
  const { id: user_id } = req.user;
  await pool.query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
    [user_id, title, message, type]
  );
  res.json({ message: 'Notification created' });
});

export default router; 