import express from 'express';
import pool from '../db.js';
import { authenticateJWT } from './auth.js';

const router = express.Router();

// Get all stores (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      store_type, 
      min_rating, 
      latitude, 
      longitude, 
      radius = 10, // Default 10km radius
      limit = 50 
    } = req.query;
    
    let query = 'SELECT * FROM stores WHERE is_active = TRUE';
    const params = [];
    let paramCount = 0;
    
    if (store_type) {
      paramCount++;
      query += ` AND store_type = $${paramCount}`;
      params.push(store_type);
    }
    
    if (min_rating) {
      paramCount++;
      query += ` AND rating >= $${paramCount}`;
      params.push(parseFloat(min_rating));
    }
    
    // Add distance calculation if coordinates provided
    if (latitude && longitude) {
      paramCount++;
      query = `
        SELECT *, 
               (6371 * acos(cos(radians($${paramCount})) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($${paramCount + 1})) + 
                sin(radians($${paramCount})) * sin(radians(latitude)))) AS distance
        FROM stores 
        WHERE is_active = TRUE
      `;
      params.push(parseFloat(latitude), parseFloat(longitude));
      
      if (store_type) {
        paramCount += 2;
        query += ` AND store_type = $${paramCount}`;
        params.push(store_type);
      }
      
      if (min_rating) {
        paramCount++;
        query += ` AND rating >= $${paramCount}`;
        params.push(parseFloat(min_rating));
      }
      
      paramCount++;
      query += ` HAVING distance <= $${paramCount} ORDER BY distance ASC`;
      params.push(parseFloat(radius));
    } else {
      query += ' ORDER BY rating DESC, name ASC';
    }
    
    query += ` LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

// Get a specific store
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json({ store: result.rows[0] });
  } catch (err) {
    console.error('Get store error:', err);
    res.status(500).json({ error: 'Failed to get store' });
  }
});

// Create a new store (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      name, 
      address, 
      latitude, 
      longitude, 
      store_type, 
      phone, 
      website, 
      rating, 
      operating_hours 
    } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO stores (name, address, latitude, longitude, store_type, phone, website, rating, operating_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, address, latitude, longitude, store_type, phone, website, rating, operating_hours]
    );
    
    res.status(201).json({ 
      message: 'Store created successfully',
      store: result.rows[0]
    });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update a store (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      address, 
      latitude, 
      longitude, 
      store_type, 
      phone, 
      website, 
      rating, 
      operating_hours,
      is_active 
    } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await pool.query(
      `UPDATE stores 
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           latitude = COALESCE($3, latitude),
           longitude = COALESCE($4, longitude),
           store_type = COALESCE($5, store_type),
           phone = COALESCE($6, phone),
           website = COALESCE($7, website),
           rating = COALESCE($8, rating),
           operating_hours = COALESCE($9, operating_hours),
           is_active = COALESCE($10, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [name, address, latitude, longitude, store_type, phone, website, rating, operating_hours, is_active, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json({ 
      message: 'Store updated successfully',
      store: result.rows[0]
    });
  } catch (err) {
    console.error('Update store error:', err);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Delete a store (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await pool.query(
      'DELETE FROM stores WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json({ message: 'Store deleted successfully' });
  } catch (err) {
    console.error('Delete store error:', err);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

// Get user's favorite stores
router.get('/favorites', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT s.*, usf.created_at as favorited_at
       FROM stores s
       JOIN user_store_favorites usf ON s.id = usf.store_id
       WHERE usf.user_id = $1 AND s.is_active = TRUE
       ORDER BY usf.created_at DESC`,
      [userId]
    );
    
    res.json({ favorites: result.rows });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Failed to get favorite stores' });
  }
});

// Add store to favorites
router.post('/:id/favorite', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if store exists
    const storeResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    
    if (storeResult.rowCount === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Add to favorites
    await pool.query(
      'INSERT INTO user_store_favorites (user_id, store_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, id]
    );
    
    res.json({ message: 'Store added to favorites' });
  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ error: 'Failed to add store to favorites' });
  }
});

// Remove store from favorites
router.delete('/:id/favorite', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM user_store_favorites WHERE user_id = $1 AND store_id = $2 RETURNING *',
      [userId, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    res.json({ message: 'Store removed from favorites' });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ error: 'Failed to remove store from favorites' });
  }
});

// Check if store is favorited by user
router.get('/:id/favorite', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM user_store_favorites WHERE user_id = $1 AND store_id = $2',
      [userId, id]
    );
    
    res.json({ isFavorited: result.rowCount > 0 });
  } catch (err) {
    console.error('Check favorite error:', err);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

// Get stores by type
router.get('/type/:store_type', async (req, res) => {
  try {
    const { store_type } = req.params;
    const { limit = 20 } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM stores WHERE store_type = $1 AND is_active = TRUE ORDER BY rating DESC LIMIT $2',
      [store_type, parseInt(limit)]
    );
    
    res.json({ stores: result.rows });
  } catch (err) {
    console.error('Get stores by type error:', err);
    res.status(500).json({ error: 'Failed to get stores by type' });
  }
});

// Search stores
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const result = await pool.query(
      `SELECT * FROM stores 
       WHERE is_active = TRUE 
       AND (name ILIKE $1 OR address ILIKE $1 OR store_type ILIKE $1)
       ORDER BY rating DESC
       LIMIT $2`,
      [`%${q}%`, parseInt(limit)]
    );
    
    res.json({ stores: result.rows });
  } catch (err) {
    console.error('Search stores error:', err);
    res.status(500).json({ error: 'Failed to search stores' });
  }
});

// Get store statistics
router.get('/stats', async (req, res) => {
  try {
    // Total stores
    const totalResult = await pool.query(
      'SELECT COUNT(*) as count FROM stores WHERE is_active = TRUE'
    );
    
    // Stores by type
    const typeResult = await pool.query(
      'SELECT store_type, COUNT(*) as count FROM stores WHERE is_active = TRUE GROUP BY store_type ORDER BY count DESC'
    );
    
    // Average rating
    const ratingResult = await pool.query(
      'SELECT AVG(rating) as average_rating FROM stores WHERE is_active = TRUE AND rating IS NOT NULL'
    );
    
    res.json({
      total: parseInt(totalResult.rows[0].count),
      byType: typeResult.rows,
      averageRating: parseFloat(ratingResult.rows[0].average_rating || 0)
    });
  } catch (err) {
    console.error('Get store stats error:', err);
    res.status(500).json({ error: 'Failed to get store statistics' });
  }
});

export default router; 