import express from 'express';
import pool from '../db.js';
import { authenticateJWT } from './auth.js';
import { google } from 'googleapis';

const router = express.Router();

// Initialize Google Calendar API
const calendar = google.calendar('v3');

// Get all events for a user
router.get('/events', authenticateJWT, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const userId = req.user.id;
    
    let query = 'SELECT * FROM events WHERE user_id = $1';
    const params = [userId];
    
    if (start_date && end_date) {
      query += ' AND event_date BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }
    
    query += ' ORDER BY event_date ASC, event_time ASC';
    
    const result = await pool.query(query, params);
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Create a new event
router.post('/events', authenticateJWT, async (req, res) => {
  try {
    const { title, description, event_date, event_time, location, event_type } = req.body;
    const userId = req.user.id;
    
    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and event date are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO events (user_id, title, description, event_date, event_time, location, event_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, title, description, event_date, event_time, location, event_type]
    );
    
    const event = result.rows[0];
    
    // Try to sync with Google Calendar if user has connected it
    try {
      await syncToGoogleCalendar(event, userId);
    } catch (syncError) {
      console.error('Google Calendar sync failed:', syncError);
      // Don't fail the request if Google sync fails
    }
    
    res.status(201).json({ 
      message: 'Event created successfully',
      event 
    });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an event
router.put('/events/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, event_time, location, event_type } = req.body;
    const userId = req.user.id;
    
    const result = await pool.query(
      `UPDATE events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           event_date = COALESCE($3, event_date),
           event_time = COALESCE($4, event_time),
           location = COALESCE($5, location),
           event_type = COALESCE($6, event_type),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, event_date, event_time, location, event_type, id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = result.rows[0];
    
    // Try to sync with Google Calendar
    try {
      await syncToGoogleCalendar(event, userId);
    } catch (syncError) {
      console.error('Google Calendar sync failed:', syncError);
    }
    
    res.json({ 
      message: 'Event updated successfully',
      event 
    });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event
router.delete('/events/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Try to delete from Google Calendar
    try {
      const event = result.rows[0];
      if (event.google_calendar_event_id) {
        await deleteFromGoogleCalendar(event.google_calendar_event_id, userId);
      }
    } catch (syncError) {
      console.error('Google Calendar delete failed:', syncError);
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get events that need reminders (for scheduled task)
router.get('/reminders', async (req, res) => {
  try {
    const reminderDays = parseInt(process.env.REMINDER_DAYS_BEFORE) || 3;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + reminderDays);
    
    const result = await pool.query(
      `SELECT e.*, u.email, u.full_name 
       FROM events e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.event_date = $1 
       AND e.reminder_sent = FALSE`,
      [reminderDate.toISOString().split('T')[0]]
    );
    
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ error: 'Failed to get reminders' });
  }
});

// Mark reminder as sent
router.post('/events/:id/reminder-sent', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE events SET reminder_sent = TRUE, reminder_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Reminder marked as sent' });
  } catch (err) {
    console.error('Mark reminder sent error:', err);
    res.status(500).json({ error: 'Failed to mark reminder as sent' });
  }
});

// Google Calendar integration helpers
async function syncToGoogleCalendar(event, userId) {
  // This would require storing Google OAuth tokens for the user
  // For now, this is a placeholder implementation
  console.log('Would sync event to Google Calendar:', event.id);
}

async function deleteFromGoogleCalendar(googleEventId, userId) {
  // This would require storing Google OAuth tokens for the user
  // For now, this is a placeholder implementation
  console.log('Would delete event from Google Calendar:', googleEventId);
}

// Get upcoming events (next 30 days)
router.get('/upcoming', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 
       AND event_date >= $2 
       AND event_date <= $3
       ORDER BY event_date ASC, event_time ASC
       LIMIT 10`,
      [userId, today, thirtyDaysFromNow.toISOString().split('T')[0]]
    );
    
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Get upcoming events error:', err);
    res.status(500).json({ error: 'Failed to get upcoming events' });
  }
});

// Get events by month
router.get('/month/:year/:month', authenticateJWT, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user.id;
    
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 
       AND event_date BETWEEN $2 AND $3
       ORDER BY event_date ASC, event_time ASC`,
      [userId, startDate, endDate]
    );
    
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Get month events error:', err);
    res.status(500).json({ error: 'Failed to get month events' });
  }
});

export default router; 