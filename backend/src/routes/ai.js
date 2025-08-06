import express from 'express';
import { authenticateJWT } from './auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../db.js';

const router = express.Router();

// Get user's conversations
router.get('/conversations', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM chat_conversations WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    
    res.json({ conversations: result.rows });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verify conversation belongs to user
    const conversationResult = await pool.query(
      'SELECT * FROM chat_conversations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (conversationResult.rowCount === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const messagesResult = await pool.query(
      'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    
    res.json({ messages: messagesResult.rows });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Create a new conversation
router.post('/conversations', authenticateJWT, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;
    
    const result = await pool.query(
      'INSERT INTO chat_conversations (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title || 'New Conversation']
    );
    
    res.status(201).json({ 
      message: 'Conversation created successfully',
      conversation: result.rows[0]
    });
  } catch (err) {
    console.error('Create conversation error:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Delete a conversation
router.delete('/conversations/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Chat with AI
router.post('/chat', authenticateJWT, async (req, res) => {
  try {
    const { message, conversationId, language } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check user's daily query limit
    const userResult = await pool.query(
      'SELECT u.*, s.subscription_tier FROM users u LEFT JOIN subscriptions s ON u.id = s.user_id WHERE u.id = $1',
      [userId]
    );
    
    const user = userResult.rows[0];
    const dailyLimit = user.subscription_tier === 'Pro' ? 
      parseInt(process.env.PRO_DAILY_AI_LIMIT) || 100 : 
      parseInt(process.env.FREE_DAILY_AI_LIMIT) || 5;
    
    if (user.daily_ai_queries_used >= dailyLimit) {
      return res.status(429).json({ 
        error: 'Daily AI query limit reached',
        limit: dailyLimit,
        used: user.daily_ai_queries_used,
        subscription_tier: user.subscription_tier
      });
    }
    
    // Get or create conversation
    let conversation;
    if (conversationId) {
      const convResult = await pool.query(
        'SELECT * FROM chat_conversations WHERE id = $1 AND user_id = $2',
        [conversationId, userId]
      );
      
      if (convResult.rowCount === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      conversation = convResult.rows[0];
    } else {
      const convResult = await pool.query(
        'INSERT INTO chat_conversations (user_id, title) VALUES ($1, $2) RETURNING *',
        [userId, 'New Conversation']
      );
      conversation = convResult.rows[0];
    }
    
    // Get conversation history
    const historyResult = await pool.query(
      'SELECT role, content FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversation.id]
    );
    
    const conversationHistory = historyResult.rows.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add user message to history
    conversationHistory.push({ role: 'user', content: message });
    
    // Call Gemma API
    const startTime = Date.now();
    
    if (!process.env.GEMMA_API_KEY) {
      throw new Error('GEMMA_API_KEY not configured');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMMA_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Build conversation context for Gemma with language awareness
    const languageMap = {
      'English': 'English',
      'Armenian': 'Armenian (հայերեն)',
      'Russian': 'Russian (русский)'
    };
    
    const userLanguage = languageMap[language] || 'English';
    
    const systemPrompt = `You are a helpful gift recommendation assistant for WhatToCarry. 
    Help users find the perfect gifts based on their occasion, budget, and recipient preferences.
    Provide thoughtful, personalized suggestions and ask clarifying questions when needed.
    Keep responses concise but helpful.
    
    IMPORTANT: Always respond in ${userLanguage} regardless of what language the user writes in.
    If the user writes in a different language, still respond in ${userLanguage}.
    Be friendly and helpful while maintaining the ${userLanguage} language throughout the conversation.`;
    
    // Format conversation history for Gemma
    let conversationText = systemPrompt + "\n\n";
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        conversationText += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationText += `Assistant: ${msg.content}\n`;
      }
    });
    
    const result = await model.generateContent(conversationText);
    const responseTime = Date.now() - startTime;
    
    if (!result.response) {
      throw new Error('No response from Gemma API');
    }
    
    const aiResponse = result.response.text();
    const tokensUsed = 0; // Gemma doesn't provide token count in the same way, estimate based on content length
    const estimatedTokens = Math.ceil((conversationText.length + aiResponse.length) / 4);
    
    // Save user message
    await pool.query(
      'INSERT INTO chat_messages (conversation_id, user_id, role, content, tokens_used) VALUES ($1, $2, $3, $4, $5)',
      [conversation.id, userId, 'user', message, estimatedTokens / 2] // Approximate user tokens
    );
    
    // Save AI response
    await pool.query(
      'INSERT INTO chat_messages (conversation_id, user_id, role, content, tokens_used) VALUES ($1, $2, $3, $4, $5)',
      [conversation.id, userId, 'assistant', aiResponse, estimatedTokens / 2] // Approximate AI tokens
    );
    
    // Update conversation timestamp
    await pool.query(
      'UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversation.id]
    );
    
    // Update user's daily query count
    await pool.query(
      'UPDATE users SET daily_ai_queries_used = daily_ai_queries_used + 1 WHERE id = $1',
      [userId]
    );
    
    // Log API usage
    await pool.query(
      'INSERT INTO api_usage (user_id, api_type, endpoint, tokens_used, response_time_ms, success) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'gemma', 'generateContent', estimatedTokens, responseTime, true]
    );
    
    res.json({ 
      response: aiResponse,
      conversation_id: conversation.id,
      tokens_used: estimatedTokens,
      daily_queries_remaining: dailyLimit - (user.daily_ai_queries_used + 1)
    });
  } catch (err) {
    console.error('AI chat error:', err);
    
    // Log failed API usage
    try {
      await pool.query(
        'INSERT INTO api_usage (user_id, api_type, endpoint, success, error_message) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'gemma', 'generateContent', false, err.message]
      );
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
    }
    
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// Get user's AI usage statistics
router.get('/usage', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const userResult = await pool.query(
      'SELECT u.*, s.subscription_tier FROM users u LEFT JOIN subscriptions s ON u.id = s.user_id WHERE u.id = $1',
      [userId]
    );
    
    const user = userResult.rows[0];
    const dailyLimit = user.subscription_tier === 'Pro' ? 
      parseInt(process.env.PRO_DAILY_AI_LIMIT) || 100 : 
      parseInt(process.env.FREE_DAILY_AI_LIMIT) || 5;
    
    // Get API usage stats
    const usageResult = await pool.query(
      `SELECT 
         COUNT(*) as total_requests,
         SUM(tokens_used) as total_tokens,
         AVG(response_time_ms) as avg_response_time,
         COUNT(CASE WHEN success = false THEN 1 END) as failed_requests
       FROM api_usage 
       WHERE user_id = $1 AND api_type = 'gemma'`,
      [userId]
    );
    
    res.json({
      daily_queries_used: user.daily_ai_queries_used,
      daily_queries_limit: dailyLimit,
      daily_queries_remaining: dailyLimit - user.daily_ai_queries_used,
      subscription_tier: user.subscription_tier,
      total_requests: parseInt(usageResult.rows[0].total_requests || 0),
      total_tokens: parseInt(usageResult.rows[0].total_tokens || 0),
      avg_response_time: parseFloat(usageResult.rows[0].avg_response_time || 0),
      failed_requests: parseInt(usageResult.rows[0].failed_requests || 0)
    });
  } catch (err) {
    console.error('Get usage error:', err);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

// Reset daily query count (for testing/admin purposes)
router.post('/reset-daily-queries', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Only allow admin or for testing
    if (req.user.role !== 'admin' && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await pool.query(
      'UPDATE users SET daily_ai_queries_used = 0, last_query_reset_date = CURRENT_DATE WHERE id = $1',
      [userId]
    );
    
    res.json({ message: 'Daily query count reset successfully' });
  } catch (err) {
    console.error('Reset daily queries error:', err);
    res.status(500).json({ error: 'Failed to reset daily queries' });
  }
});

export default router; 