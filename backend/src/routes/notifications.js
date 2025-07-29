import express from 'express';
import pool from '../db.js';
import { authenticateJWT } from './auth.js';

const router = express.Router();

// Get all notifications for a user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read (POST for backwards compatibility)
router.post('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: user_id } = req.user;
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark notification as read (PUT method)
router.put('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: user_id } = req.user;
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark notification as unread
router.put('/:id/unread', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: user_id } = req.user;
    await pool.query(
      'UPDATE notifications SET read = FALSE WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ message: 'Notification marked as unread' });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({ error: 'Failed to mark notification as unread' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateJWT, async (req, res) => {
  try {
    const { id: user_id } = req.user;
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE user_id = $1',
      [user_id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete a specific notification
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: user_id } = req.user;
    await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all read notifications
router.delete('/delete-read', authenticateJWT, async (req, res) => {
  try {
    const { id: user_id } = req.user;
    await pool.query(
      'DELETE FROM notifications WHERE user_id = $1 AND read = TRUE',
      [user_id]
    );
    res.json({ message: 'All read notifications deleted' });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ error: 'Failed to delete read notifications' });
  }
});

// Create a new notification
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const { id: user_id } = req.user;
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [user_id, title, message, type]
    );
    res.json({ message: 'Notification created' });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router; 