import express from 'express';
import pool from '../db.js';
import { authenticateJWT } from './auth.js';

const router = express.Router();

// Get all gift suggestions for a user
router.get('/suggestions', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, occasion, bookmarked } = req.query;
    
    let query = 'SELECT * FROM gift_suggestions WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;
    
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }
    
    if (occasion) {
      paramCount++;
      query += ` AND occasion = $${paramCount}`;
      params.push(occasion);
    }
    
    if (bookmarked === 'true') {
      paramCount++;
      query += ` AND is_bookmarked = $${paramCount}`;
      params.push(true);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Get gift suggestions error:', err);
    res.status(500).json({ error: 'Failed to get gift suggestions' });
  }
});

// Get a specific gift suggestion
router.get('/suggestions/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM gift_suggestions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gift suggestion not found' });
    }
    
    res.json({ suggestion: result.rows[0] });
  } catch (err) {
    console.error('Get gift suggestion error:', err);
    res.status(500).json({ error: 'Failed to get gift suggestion' });
  }
});

// Create a new gift suggestion
router.post('/suggestions', authenticateJWT, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price_range, 
      category, 
      occasion, 
      recipient_preferences,
      conversation_id 
    } = req.body;
    const userId = req.user.id;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO gift_suggestions (user_id, conversation_id, title, description, price_range, category, occasion, recipient_preferences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, conversation_id, title, description, price_range, category, occasion, recipient_preferences]
    );
    
    res.status(201).json({ 
      message: 'Gift suggestion created successfully',
      suggestion: result.rows[0]
    });
  } catch (err) {
    console.error('Create gift suggestion error:', err);
    res.status(500).json({ error: 'Failed to create gift suggestion' });
  }
});

// Update a gift suggestion
router.put('/suggestions/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      price_range, 
      category, 
      occasion, 
      recipient_preferences,
      is_bookmarked 
    } = req.body;
    const userId = req.user.id;
    
    const result = await pool.query(
      `UPDATE gift_suggestions 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price_range = COALESCE($3, price_range),
           category = COALESCE($4, category),
           occasion = COALESCE($5, occasion),
           recipient_preferences = COALESCE($6, recipient_preferences),
           is_bookmarked = COALESCE($7, is_bookmarked)
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, description, price_range, category, occasion, recipient_preferences, is_bookmarked, id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gift suggestion not found' });
    }
    
    res.json({ 
      message: 'Gift suggestion updated successfully',
      suggestion: result.rows[0]
    });
  } catch (err) {
    console.error('Update gift suggestion error:', err);
    res.status(500).json({ error: 'Failed to update gift suggestion' });
  }
});

// Toggle bookmark status
router.patch('/suggestions/:id/bookmark', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      `UPDATE gift_suggestions 
       SET is_bookmarked = NOT is_bookmarked
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gift suggestion not found' });
    }
    
    res.json({ 
      message: 'Bookmark status updated',
      suggestion: result.rows[0]
    });
  } catch (err) {
    console.error('Toggle bookmark error:', err);
    res.status(500).json({ error: 'Failed to update bookmark status' });
  }
});

// Delete a gift suggestion
router.delete('/suggestions/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM gift_suggestions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gift suggestion not found' });
    }
    
    res.json({ message: 'Gift suggestion deleted successfully' });
  } catch (err) {
    console.error('Delete gift suggestion error:', err);
    res.status(500).json({ error: 'Failed to delete gift suggestion' });
  }
});

// Get gift suggestions by category
router.get('/categories/:category', authenticateJWT, async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM gift_suggestions WHERE user_id = $1 AND category = $2 ORDER BY created_at DESC',
      [userId, category]
    );
    
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Get suggestions by category error:', err);
    res.status(500).json({ error: 'Failed to get suggestions by category' });
  }
});

// Get gift suggestions by occasion
router.get('/occasions/:occasion', authenticateJWT, async (req, res) => {
  try {
    const { occasion } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM gift_suggestions WHERE user_id = $1 AND occasion = $2 ORDER BY created_at DESC',
      [userId, occasion]
    );
    
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Get suggestions by occasion error:', err);
    res.status(500).json({ error: 'Failed to get suggestions by occasion' });
  }
});

// Get bookmarked gift suggestions
router.get('/bookmarked', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM gift_suggestions WHERE user_id = $1 AND is_bookmarked = TRUE ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Get bookmarked suggestions error:', err);
    res.status(500).json({ error: 'Failed to get bookmarked suggestions' });
  }
});

// Get gift suggestion statistics
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Total suggestions
    const totalResult = await pool.query(
      'SELECT COUNT(*) as count FROM gift_suggestions WHERE user_id = $1',
      [userId]
    );
    
    // Bookmarked suggestions
    const bookmarkedResult = await pool.query(
      'SELECT COUNT(*) as count FROM gift_suggestions WHERE user_id = $1 AND is_bookmarked = TRUE',
      [userId]
    );
    
    // Suggestions by category
    const categoryResult = await pool.query(
      'SELECT category, COUNT(*) as count FROM gift_suggestions WHERE user_id = $1 GROUP BY category ORDER BY count DESC',
      [userId]
    );
    
    // Suggestions by occasion
    const occasionResult = await pool.query(
      'SELECT occasion, COUNT(*) as count FROM gift_suggestions WHERE user_id = $1 GROUP BY occasion ORDER BY count DESC',
      [userId]
    );
    
    res.json({
      total: parseInt(totalResult.rows[0].count),
      bookmarked: parseInt(bookmarkedResult.rows[0].count),
      byCategory: categoryResult.rows,
      byOccasion: occasionResult.rows
    });
  } catch (err) {
    console.error('Get gift stats error:', err);
    res.status(500).json({ error: 'Failed to get gift statistics' });
  }
});

// Search gift suggestions
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const result = await pool.query(
      `SELECT * FROM gift_suggestions 
       WHERE user_id = $1 
       AND (title ILIKE $2 OR description ILIKE $2 OR category ILIKE $2 OR occasion ILIKE $2)
       ORDER BY created_at DESC`,
      [userId, `%${q}%`]
    );
    
    res.json({ suggestions: result.rows });
  } catch (err) {
    console.error('Search gift suggestions error:', err);
    res.status(500).json({ error: 'Failed to search gift suggestions' });
  }
});

export default router; 