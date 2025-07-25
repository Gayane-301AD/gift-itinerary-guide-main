import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { authenticateJWT } from './auth.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, s.subscription_tier, s.subscribed, s.subscription_end
       FROM users u 
       LEFT JOIN subscriptions s ON u.id = s.user_id 
       WHERE u.id = $1`,
      [req.user.id]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Remove sensitive fields
    delete user.password_hash;
    delete user.verification_token;
    delete user.reset_password_token;
    delete user.reset_password_expires;

    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    const { full_name, nickname, phone, date_of_birth, gender } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           nickname = COALESCE($2, nickname),
           phone = COALESCE($3, phone),
           date_of_birth = COALESCE($4, date_of_birth),
           gender = COALESCE($5, gender),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING id, email, username, full_name, nickname, phone, date_of_birth, gender, role, is_verified`,
      [full_name, nickname, phone, date_of_birth, gender, req.user.id]
    );

    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user statistics
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get conversation count
    const conversationsResult = await pool.query(
      'SELECT COUNT(*) as count FROM chat_conversations WHERE user_id = $1',
      [userId]
    );
    
    // Get events count
    const eventsResult = await pool.query(
      'SELECT COUNT(*) as count FROM events WHERE user_id = $1',
      [userId]
    );
    
    // Get gift suggestions count
    const giftsResult = await pool.query(
      'SELECT COUNT(*) as count FROM gift_suggestions WHERE user_id = $1',
      [userId]
    );
    
    // Get unread notifications count
    const notificationsResult = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE',
      [userId]
    );

    res.json({
      conversations: parseInt(conversationsResult.rows[0].count),
      events: parseInt(eventsResult.rows[0].count),
      giftSuggestions: parseInt(giftsResult.rows[0].count),
      unreadNotifications: parseInt(notificationsResult.rows[0].count)
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

// Delete user account
router.delete('/account', authenticateJWT, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required to delete account' });
    }
    
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router; 