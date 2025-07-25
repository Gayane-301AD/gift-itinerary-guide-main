import cron from 'node-cron';
import pool from '../db.js';
import { sendEventReminderEmail } from './email.js';

export function initializeScheduledTasks() {
  console.log('🕐 Initializing scheduled tasks...');
  
  // Send event reminders every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('📅 Running daily event reminder task...');
    await sendEventReminders();
  });
  
  // Reset daily AI query counts at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running daily AI query reset task...');
    await resetDailyAIQueries();
  });
  
  // Clean up old data weekly (Sundays at 2 AM)
  cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Running weekly cleanup task...');
    await cleanupOldData();
  });
  
  console.log('✅ Scheduled tasks initialized');
}

async function sendEventReminders() {
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
    
    console.log(`📧 Sending ${result.rows.length} event reminders...`);
    
    for (const event of result.rows) {
      try {
        await sendEventReminderEmail(event.email, event);
        
        // Mark reminder as sent
        await pool.query(
          'UPDATE events SET reminder_sent = TRUE, reminder_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
          [event.id]
        );
        
        console.log(`✅ Sent reminder for event: ${event.title} to ${event.email}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for event ${event.id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Event reminder task failed:', error);
  }
}

async function resetDailyAIQueries() {
  try {
    const result = await pool.query(
      'UPDATE users SET daily_ai_queries_used = 0, last_query_reset_date = CURRENT_DATE WHERE last_query_reset_date < CURRENT_DATE'
    );
    
    console.log(`🔄 Reset daily AI queries for ${result.rowCount} users`);
  } catch (error) {
    console.error('❌ Daily AI query reset failed:', error);
  }
}

async function cleanupOldData() {
  try {
    // Clean up old API usage logs (older than 90 days)
    const apiUsageResult = await pool.query(
      'DELETE FROM api_usage WHERE created_at < CURRENT_DATE - INTERVAL \'90 days\''
    );
    
    // Clean up old notifications (older than 30 days)
    const notificationsResult = await pool.query(
      'DELETE FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL \'30 days\' AND read = TRUE'
    );
    
    // Clean up old chat messages (older than 1 year)
    const chatMessagesResult = await pool.query(
      'DELETE FROM chat_messages WHERE created_at < CURRENT_DATE - INTERVAL \'1 year\''
    );
    
    // Clean up empty conversations
    const emptyConversationsResult = await pool.query(
      'DELETE FROM chat_conversations WHERE id NOT IN (SELECT DISTINCT conversation_id FROM chat_messages)'
    );
    
    console.log(`🧹 Cleanup completed:
      - API usage logs: ${apiUsageResult.rowCount} deleted
      - Notifications: ${notificationsResult.rowCount} deleted
      - Chat messages: ${chatMessagesResult.rowCount} deleted
      - Empty conversations: ${emptyConversationsResult.rowCount} deleted`);
  } catch (error) {
    console.error('❌ Cleanup task failed:', error);
  }
}

// Manual trigger functions for testing
export async function triggerEventReminders() {
  console.log('🔄 Manually triggering event reminders...');
  await sendEventReminders();
}

export async function triggerDailyReset() {
  console.log('🔄 Manually triggering daily reset...');
  await resetDailyAIQueries();
}

export async function triggerCleanup() {
  console.log('🔄 Manually triggering cleanup...');
  await cleanupOldData();
} 