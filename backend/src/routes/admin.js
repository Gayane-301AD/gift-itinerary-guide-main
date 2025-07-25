import express from 'express';
import pool from '../db.js';
import { authenticateJWT, requireAdmin } from './auth.js';

const router = express.Router();

// Get overall system metrics
router.get('/metrics', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    // User statistics
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const verifiedUsersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE');
    const newUsersTodayResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURRENT_DATE'
    );
    
    // Subscription statistics
    const proSubscribersResult = await pool.query(
      'SELECT COUNT(*) as count FROM subscriptions WHERE subscribed = TRUE AND subscription_tier = \'Pro\''
    );
    const freeUsersResult = await pool.query(
      'SELECT COUNT(*) as count FROM subscriptions WHERE subscription_tier = \'Free\''
    );
    
    // Activity statistics
    const eventsResult = await pool.query('SELECT COUNT(*) as count FROM events');
    const conversationsResult = await pool.query('SELECT COUNT(*) as count FROM chat_conversations');
    const giftSuggestionsResult = await pool.query('SELECT COUNT(*) as count FROM gift_suggestions');
    const notificationsResult = await pool.query('SELECT COUNT(*) as count FROM notifications');
    
    // API usage statistics
    const apiUsageResult = await pool.query(
      `SELECT 
         api_type,
         COUNT(*) as total_requests,
         SUM(tokens_used) as total_tokens,
         AVG(response_time_ms) as avg_response_time,
         COUNT(CASE WHEN success = false THEN 1 END) as failed_requests
       FROM api_usage 
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY api_type`
    );
    
    res.json({
      users: {
        total: parseInt(usersResult.rows[0].count),
        verified: parseInt(verifiedUsersResult.rows[0].count),
        newToday: parseInt(newUsersTodayResult.rows[0].count)
      },
      subscriptions: {
        pro: parseInt(proSubscribersResult.rows[0].count),
        free: parseInt(freeUsersResult.rows[0].count)
      },
      activity: {
        events: parseInt(eventsResult.rows[0].count),
        conversations: parseInt(conversationsResult.rows[0].count),
        giftSuggestions: parseInt(giftSuggestionsResult.rows[0].count),
        notifications: parseInt(notificationsResult.rows[0].count)
      },
      apiUsage: apiUsageResult.rows
    });
  } catch (err) {
    console.error('Get metrics error:', err);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Get user management data
router.get('/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, verified } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.*, s.subscription_tier, s.subscribed, s.subscription_end,
             COUNT(e.id) as event_count,
             COUNT(c.id) as conversation_count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN events e ON u.id = e.user_id
      LEFT JOIN chat_conversations c ON u.id = c.user_id
    `;
    
    const whereConditions = [];
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      whereConditions.push(`(u.email ILIKE $${paramCount} OR u.full_name ILIKE $${paramCount} OR u.username ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }
    
    if (role) {
      paramCount++;
      whereConditions.push(`u.role = $${paramCount}`);
      params.push(role);
    }
    
    if (verified !== undefined) {
      paramCount++;
      whereConditions.push(`u.is_verified = $${paramCount}`);
      params.push(verified === 'true');
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' GROUP BY u.id, s.subscription_tier, s.subscribed, s.subscription_end';
    query += ' ORDER BY u.created_at DESC';
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM users u';
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.slice(0, -1).join(' AND ');
    }
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    
    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user details
router.get('/users/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT u.*, s.*
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id
       WHERE u.id = $1`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user activity
    const eventsResult = await pool.query(
      'SELECT * FROM events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );
    
    const conversationsResult = await pool.query(
      'SELECT * FROM chat_conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );
    
    const apiUsageResult = await pool.query(
      'SELECT * FROM api_usage WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [id]
    );
    
    res.json({
      user: result.rows[0],
      recentEvents: eventsResult.rows,
      recentConversations: conversationsResult.rows,
      apiUsage: apiUsageResult.rows
    });
  } catch (err) {
    console.error('Get user details error:', err);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

// Update user role
router.patch('/users/:id/role', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['guest', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get system settings
router.get('/settings', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_settings ORDER BY setting_key');
    res.json({ settings: result.rows });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to get system settings' });
  }
});

// Update system settings
router.put('/settings/:key', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    const result = await pool.query(
      `UPDATE system_settings 
       SET setting_value = $1, description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP
       WHERE setting_key = $3
       RETURNING *`,
      [value, description, key]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ 
      message: 'Setting updated successfully',
      setting: result.rows[0]
    });
  } catch (err) {
    console.error('Update setting error:', err);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Get API usage analytics
router.get('/analytics/api-usage', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const result = await pool.query(
      `SELECT 
         DATE(created_at) as date,
         api_type,
         COUNT(*) as requests,
         SUM(tokens_used) as tokens,
         AVG(response_time_ms) as avg_response_time,
         COUNT(CASE WHEN success = false THEN 1 END) as errors
       FROM api_usage 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at), api_type
       ORDER BY date DESC, api_type`
    );
    
    res.json({ analytics: result.rows });
  } catch (err) {
    console.error('Get API analytics error:', err);
    res.status(500).json({ error: 'Failed to get API analytics' });
  }
});

// Get user activity analytics
router.get('/analytics/user-activity', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // New users per day
    const newUsersResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );
    
    // Events created per day
    const eventsResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM events 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );
    
    // Conversations per day
    const conversationsResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM chat_conversations 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );
    
    res.json({
      newUsers: newUsersResult.rows,
      events: eventsResult.rows,
      conversations: conversationsResult.rows
    });
  } catch (err) {
    console.error('Get user activity analytics error:', err);
    res.status(500).json({ error: 'Failed to get user activity analytics' });
  }
});

// Get error logs
router.get('/logs/errors', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const result = await pool.query(
      `SELECT * FROM api_usage 
       WHERE success = false 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [parseInt(limit)]
    );
    
    res.json({ errors: result.rows });
  } catch (err) {
    console.error('Get error logs error:', err);
    res.status(500).json({ error: 'Failed to get error logs' });
  }
});

// Get recent activity
router.get('/activity', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Recent user registrations
    const newUsersResult = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1',
      [parseInt(limit)]
    );
    
    // Recent events
    const eventsResult = await pool.query(
      'SELECT e.*, u.email FROM events e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC LIMIT $1',
      [parseInt(limit)]
    );
    
    // Recent API usage
    const apiUsageResult = await pool.query(
      'SELECT au.*, u.email FROM api_usage au JOIN users u ON au.user_id = u.id ORDER BY au.created_at DESC LIMIT $1',
      [parseInt(limit)]
    );
    
    res.json({
      newUsers: newUsersResult.rows,
      events: eventsResult.rows,
      apiUsage: apiUsageResult.rows
    });
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ error: 'Failed to get recent activity' });
  }
});

export default router; 