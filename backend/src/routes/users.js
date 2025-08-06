import express from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import { authenticateJWT } from './auth.js';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get current user profile  
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.date_of_birth, u.gender, 
              u.profile_image_url as profile_image, u.role, u.is_verified, u.daily_ai_queries_used, 
              u.last_query_reset_date, u.created_at, u.updated_at,
              s.subscription_tier, s.subscribed, s.subscription_end
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

    console.log('Returning user profile:', user);
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/update', authenticateJWT, async (req, res) => {
  try {
    console.log('=== PROFILE UPDATE REQUEST RECEIVED ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    
    const { username, fullName, email, phone, date_of_birth, gender } = req.body;
    
    // Debug: Log received data
    console.log('Extracted data:', { username, fullName, email, phone, date_of_birth, gender });
    
    // Check if username already exists (if changing)
    if (username) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, req.user.id]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    // Check if email already exists (if changing)
    if (email) {
      const existingEmail = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    // Debug: Log query parameters
    console.log('Query parameters:', [username, fullName, email, phone, date_of_birth, gender, req.user.id]);
    
    const result = await pool.query(
      `UPDATE users 
       SET username = CASE WHEN $1 IS NOT NULL AND $1 != '' THEN $1 ELSE username END,
           full_name = CASE WHEN $2 IS NOT NULL AND $2 != '' THEN $2 ELSE full_name END,
           email = CASE WHEN $3 IS NOT NULL AND $3 != '' THEN $3 ELSE email END,
           phone = CASE WHEN $4 IS NOT NULL THEN $4 ELSE phone END,
           date_of_birth = CASE WHEN $5 IS NOT NULL AND $5 != '' THEN $5 ELSE date_of_birth END,
           gender = CASE WHEN $6 IS NOT NULL AND $6 != '' THEN $6 ELSE gender END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING id, email, username, full_name, phone, date_of_birth, gender, role, is_verified, profile_image_url as profile_image`,
      [username, fullName, email, phone, date_of_birth, gender, req.user.id]
    );

    // Debug: Log updated user data
    console.log('Database update successful!');
    console.log('Updated user data:', result.rows[0]);
    console.log('=== PROFILE UPDATE COMPLETED ===');

    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
router.post('/avatar', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Avatar upload started for user:', req.user.id);
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const userId = req.user.id;
    const filename = `avatar-${userId}-${Date.now()}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    console.log('Saving file to:', filepath);

    // Process image with Sharp
    await sharp(req.file.buffer)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    console.log('Image processed and saved successfully');

    // Update user profile with new avatar URL
    const avatarUrl = `/uploads/avatars/${filename}`;
    console.log('Updating database with avatar URL:', avatarUrl);
    
    const result = await pool.query(
      'UPDATE users SET profile_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING profile_image_url',
      [avatarUrl, userId]
    );

    console.log('Database updated. New avatar URL:', result.rows[0]?.profile_image_url);

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: avatarUrl
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
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

// Update password (alias for frontend compatibility)
router.put('/password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
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