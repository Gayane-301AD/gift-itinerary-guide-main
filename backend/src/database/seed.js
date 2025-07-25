import pool from '../db.js';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      ['admin', 'admin@whattocarry.com', adminPassword, 'System Administrator', 'admin', true]
    );
    
    if (adminResult.rowCount > 0) {
      console.log('✅ Created admin user');
      
      // Create admin subscription
      await pool.query(
        `INSERT INTO subscriptions (user_id, email, subscription_tier, subscribed)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO NOTHING`,
        [adminResult.rows[0].id, 'admin@whattocarry.com', 'Pro', true]
      );
    }
    
    // Create sample stores
    const sampleStores = [
      {
        name: 'Gift Haven',
        address: '123 Main Street, Downtown',
        latitude: 40.7128,
        longitude: -74.0060,
        store_type: 'gift_shop',
        phone: '+1-555-0123',
        website: 'https://gifthaven.com',
        rating: 4.5,
        operating_hours: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '10:00 AM - 9:00 PM',
          sunday: '11:00 AM - 6:00 PM'
        }
      },
      {
        name: 'Blooming Flowers',
        address: '456 Oak Avenue, Midtown',
        latitude: 40.7589,
        longitude: -73.9851,
        store_type: 'florist',
        phone: '+1-555-0456',
        website: 'https://bloomingflowers.com',
        rating: 4.8,
        operating_hours: {
          monday: '8:00 AM - 7:00 PM',
          tuesday: '8:00 AM - 7:00 PM',
          wednesday: '8:00 AM - 7:00 PM',
          thursday: '8:00 AM - 7:00 PM',
          friday: '8:00 AM - 8:00 PM',
          saturday: '9:00 AM - 6:00 PM',
          sunday: '10:00 AM - 5:00 PM'
        }
      },
      {
        name: 'Tech Treasures',
        address: '789 Innovation Drive, Tech District',
        latitude: 40.7505,
        longitude: -73.9934,
        store_type: 'electronics_store',
        phone: '+1-555-0789',
        website: 'https://techtreasures.com',
        rating: 4.2,
        operating_hours: {
          monday: '10:00 AM - 9:00 PM',
          tuesday: '10:00 AM - 9:00 PM',
          wednesday: '10:00 AM - 9:00 PM',
          thursday: '10:00 AM - 9:00 PM',
          friday: '10:00 AM - 10:00 PM',
          saturday: '10:00 AM - 10:00 PM',
          sunday: '11:00 AM - 8:00 PM'
        }
      },
      {
        name: 'Bookworm Corner',
        address: '321 Literary Lane, Arts District',
        latitude: 40.7614,
        longitude: -73.9776,
        store_type: 'book_store',
        phone: '+1-555-0321',
        website: 'https://bookwormcorner.com',
        rating: 4.6,
        operating_hours: {
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '10:00 AM - 9:00 PM',
          sunday: '11:00 AM - 7:00 PM'
        }
      },
      {
        name: 'Sweet Treats Bakery',
        address: '654 Dessert Street, Food District',
        latitude: 40.7421,
        longitude: -73.9911,
        store_type: 'bakery',
        phone: '+1-555-0654',
        website: 'https://sweettreatsbakery.com',
        rating: 4.9,
        operating_hours: {
          monday: '6:00 AM - 8:00 PM',
          tuesday: '6:00 AM - 8:00 PM',
          wednesday: '6:00 AM - 8:00 PM',
          thursday: '6:00 AM - 8:00 PM',
          friday: '6:00 AM - 9:00 PM',
          saturday: '7:00 AM - 9:00 PM',
          sunday: '7:00 AM - 7:00 PM'
        }
      }
    ];
    
    for (const store of sampleStores) {
      await pool.query(
        `INSERT INTO stores (name, address, latitude, longitude, store_type, phone, website, rating, operating_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (name, address) DO NOTHING`,
        [store.name, store.address, store.latitude, store.longitude, store.store_type, store.phone, store.website, store.rating, JSON.stringify(store.operating_hours)]
      );
    }
    
    console.log(`✅ Created ${sampleStores.length} sample stores`);
    
    // Create sample user
    const userPassword = await bcrypt.hash('user123', 12);
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, nickname, phone, date_of_birth, gender, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      ['demo_user', 'user@example.com', userPassword, 'Demo User', 'Demo', '+1-555-0000', '1990-01-01', 'other', true]
    );
    
    if (userResult.rowCount > 0) {
      console.log('✅ Created demo user');
      
      const userId = userResult.rows[0].id;
      
      // Create user subscription
      await pool.query(
        `INSERT INTO subscriptions (user_id, email, subscription_tier, subscribed)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, 'user@example.com', 'Free', false]
      );
      
      // Create sample events
      const sampleEvents = [
        {
          title: 'Mom\'s Birthday',
          description: 'Annual birthday celebration for mom',
          event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          event_time: '18:00:00',
          location: 'Home',
          event_type: 'birthday'
        },
        {
          title: 'Friend\'s Wedding',
          description: 'Wedding ceremony and reception',
          event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          event_time: '16:00:00',
          location: 'Grand Hotel',
          event_type: 'wedding'
        },
        {
          title: 'Christmas Party',
          description: 'Annual Christmas celebration with family',
          event_date: new Date(new Date().getFullYear(), 11, 25), // December 25th
          event_time: '19:00:00',
          location: 'Family Home',
          event_type: 'holiday'
        }
      ];
      
      for (const event of sampleEvents) {
        await pool.query(
          `INSERT INTO events (user_id, title, description, event_date, event_time, location, event_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, event.title, event.description, event.event_date, event.event_time, event.location, event.event_type]
        );
      }
      
      console.log(`✅ Created ${sampleEvents.length} sample events`);
      
      // Create sample conversation
      const conversationResult = await pool.query(
        `INSERT INTO chat_conversations (user_id, title)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, 'Gift Ideas for Mom\'s Birthday']
      );
      
      const conversationId = conversationResult.rows[0].id;
      
      // Create sample chat messages
      const sampleMessages = [
        {
          role: 'user',
          content: 'I need gift ideas for my mom\'s birthday. She loves gardening and cooking.'
        },
        {
          role: 'assistant',
          content: 'Great! For a mom who loves gardening and cooking, here are some thoughtful gift ideas:\n\n1. **Garden Tools Set** - High-quality, ergonomic gardening tools\n2. **Herb Garden Kit** - Fresh herbs she can use in cooking\n3. **Cookbook** - A beautiful cookbook with garden-to-table recipes\n4. **Garden Apron** - A stylish apron for both gardening and cooking\n5. **Plant Subscription** - Monthly delivery of new plants\n\nWhat\'s your budget range?'
        },
        {
          role: 'user',
          content: 'Around $50-100 would be perfect.'
        },
        {
          role: 'assistant',
          content: 'Perfect budget! Here are my top recommendations in the $50-100 range:\n\n1. **Premium Garden Tool Set** ($75) - Includes ergonomic handles and a carrying case\n2. **Indoor Herb Garden with LED Lights** ($60) - Year-round fresh herbs\n3. **Garden-to-Table Cookbook + Apron Bundle** ($85) - Beautiful hardcover book with matching apron\n4. **Smart Garden Planter** ($90) - Self-watering with app monitoring\n5. **Garden Experience Gift** ($80) - Local garden center gift card + workshop\n\nWhich of these sounds most like your mom?'
        }
      ];
      
      for (const message of sampleMessages) {
        await pool.query(
          `INSERT INTO chat_messages (conversation_id, user_id, role, content)
           VALUES ($1, $2, $3, $4)`,
          [conversationId, userId, message.role, message.content]
        );
      }
      
      console.log(`✅ Created sample conversation with ${sampleMessages.length} messages`);
      
      // Create sample gift suggestions
      const sampleGifts = [
        {
          title: 'Premium Garden Tool Set',
          description: 'High-quality ergonomic gardening tools with comfortable handles and a durable carrying case.',
          price_range: '$50-100',
          category: 'gardening',
          occasion: 'birthday',
          recipient_preferences: 'gardening enthusiast',
          is_bookmarked: true
        },
        {
          title: 'Indoor Herb Garden Kit',
          description: 'Complete kit for growing fresh herbs indoors year-round, includes LED grow lights.',
          price_range: '$50-100',
          category: 'gardening',
          occasion: 'birthday',
          recipient_preferences: 'cooking, fresh herbs',
          is_bookmarked: false
        },
        {
          title: 'Garden-to-Table Cookbook',
          description: 'Beautiful hardcover cookbook featuring recipes that use fresh garden ingredients.',
          price_range: '$25-50',
          category: 'books',
          occasion: 'birthday',
          recipient_preferences: 'cooking, gardening',
          is_bookmarked: true
        }
      ];
      
      for (const gift of sampleGifts) {
        await pool.query(
          `INSERT INTO gift_suggestions (user_id, conversation_id, title, description, price_range, category, occasion, recipient_preferences, is_bookmarked)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [userId, conversationId, gift.title, gift.description, gift.price_range, gift.category, gift.occasion, gift.recipient_preferences, gift.is_bookmarked]
        );
      }
      
      console.log(`✅ Created ${sampleGifts.length} sample gift suggestions`);
      
      // Create sample notifications
      const sampleNotifications = [
        {
          title: 'Welcome to WhatToCarry!',
          message: 'Thank you for joining us. Start exploring our AI-powered gift recommendations!',
          type: 'welcome'
        },
        {
          title: 'Event Reminder',
          message: 'Mom\'s Birthday is coming up in 3 days. Don\'t forget to get a gift!',
          type: 'reminder'
        }
      ];
      
      for (const notification of sampleNotifications) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ($1, $2, $3, $4)`,
          [userId, notification.title, notification.message, notification.type]
        );
      }
      
      console.log(`✅ Created ${sampleNotifications.length} sample notifications`);
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('- Admin user: admin@whattocarry.com / admin123');
    console.log('- Demo user: user@example.com / user123');
    console.log('- 5 sample stores');
    console.log('- 3 sample events');
    console.log('- 1 sample conversation with 4 messages');
    console.log('- 3 sample gift suggestions');
    console.log('- 2 sample notifications');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase }; 