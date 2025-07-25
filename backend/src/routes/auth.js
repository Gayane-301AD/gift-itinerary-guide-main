import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';

const router = express.Router();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, nickname, phone, date_of_birth, gender } = req.body;
    
    if (!email || !password || !username || !full_name) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const hash = await bcrypt.hash(password, 12);
    const verification_token = generateToken();

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, nickname, phone, date_of_birth, gender, verification_token) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, username, full_name, role`,
      [username, email, hash, full_name, nickname, phone, date_of_birth, gender, verification_token]
    );

    // Create default subscription record
    await pool.query(
      'INSERT INTO subscriptions (user_id, email, subscription_tier, subscribed) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, email, 'Free', false]
    );

    await sendVerificationEmail(email, verification_token);
    
    res.status(201).json({ 
      message: 'Registration successful. Please check your email to verify your account.',
      user: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint.includes('users_email_key')) {
        return res.status(409).json({ error: 'Email already registered' });
      } else if (err.constraint.includes('users_username_key')) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await pool.query(
      'SELECT u.*, s.subscription_tier, s.subscribed FROM users u LEFT JOIN subscriptions s ON u.id = s.user_id WHERE u.email = $1',
      [email]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified. Please check your email for verification link.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        subscription_tier: user.subscription_tier 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        nickname: user.nickname,
        role: user.role,
        subscription_tier: user.subscription_tier,
        subscribed: user.subscribed,
        daily_ai_queries_used: user.daily_ai_queries_used,
        is_verified: user.is_verified
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// JWT Authentication middleware
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Admin authorization middleware
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export default router; 