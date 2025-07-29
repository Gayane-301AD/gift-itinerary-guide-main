#!/usr/bin/env node

import { runCompleteMigration } from './src/database/migrate_complete.js';

console.log('🚀 WhatToCarry Database Setup');
console.log('==============================');
console.log('');

// Check if .env file exists
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file with your database configuration.');
  console.log('You can copy from env.example as a starting point.');
  process.exit(1);
}

console.log('✅ .env file found');
console.log('🔄 Starting database migration...');
console.log('');

try {
  await runCompleteMigration();
  console.log('');
  console.log('🎉 Database setup completed successfully!');
  console.log('');
  console.log('Your database now includes all necessary tables:');
  console.log('• Users and authentication system');
  console.log('• Subscription management with Stripe integration');
  console.log('• Calendar events with Google Calendar sync');
  console.log('• AI chat conversations and gift suggestions');
  console.log('• Notification system with email templates');
  console.log('• Store locations and categories for map functionality');
  console.log('• API usage tracking and cost monitoring');
  console.log('• Admin audit logging and system health monitoring');
  console.log('• User sessions and activity tracking');
  console.log('• Error logging and debugging tools');
  console.log('');
  console.log('Next steps:');
  console.log('1. Start your backend server: npm run dev');
  console.log('2. Start your frontend: cd ../frontend && npm run dev');
  console.log('3. Access your application at http://localhost:8080');
  console.log('');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('');
  console.log('Troubleshooting tips:');
  console.log('• Check your DATABASE_URL in .env file');
  console.log('• Ensure PostgreSQL is running');
  console.log('• Verify database credentials');
  console.log('• Check if database exists');
  process.exit(1);
} 