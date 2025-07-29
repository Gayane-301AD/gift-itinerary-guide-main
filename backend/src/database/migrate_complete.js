import pool from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCompleteMigration() {
  try {
    console.log('🔄 Starting complete database migration...');
    
    // Check if complete schema exists, otherwise use the original schema
    const completeSchemaPath = path.join(__dirname, '../../database/schema_complete.sql');
    const originalSchemaPath = path.join(__dirname, '../../database/schema.sql');
    const additionalTablesPath = path.join(__dirname, '../../database/additional_tables.sql');
    
    let schemaPath = completeSchemaPath;
    if (!fs.existsSync(completeSchemaPath)) {
      console.log('📝 Complete schema not found, using original schema + additional tables...');
      schemaPath = originalSchemaPath;
    }
    
    // Read the main schema file
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute from main schema`);
    
    // Execute each statement from main schema
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ Executed main schema statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (error.code === '42710' || error.code === '42P07') {
            console.log(`⚠️  Main schema statement ${i + 1} already exists, skipping...`);
          } else {
            console.error(`❌ Error executing main schema statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    // If using original schema, also run additional tables
    if (schemaPath === originalSchemaPath && fs.existsSync(additionalTablesPath)) {
      console.log('📝 Running additional tables migration...');
      
      const additionalSchema = fs.readFileSync(additionalTablesPath, 'utf8');
      const additionalStatements = additionalSchema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`📝 Found ${additionalStatements.length} additional SQL statements to execute`);
      
      for (let i = 0; i < additionalStatements.length; i++) {
        const statement = additionalStatements[i];
        if (statement.trim()) {
          try {
            await pool.query(statement);
            console.log(`✅ Executed additional statement ${i + 1}/${additionalStatements.length}`);
          } catch (error) {
            // Ignore errors for statements that might already exist
            if (error.code === '42710' || error.code === '42P07') {
              console.log(`⚠️  Additional statement ${i + 1} already exists, skipping...`);
            } else {
              console.error(`❌ Error executing additional statement ${i + 1}:`, error.message);
              throw error;
            }
          }
        }
      }
    }
    
    console.log('✅ Complete database migration finished successfully!');
    console.log('📊 Database now includes:');
    console.log('   • Users and authentication');
    console.log('   • Subscriptions and billing');
    console.log('   • Events and calendar sync');
    console.log('   • AI chat and gift suggestions');
    console.log('   • Notifications system');
    console.log('   • Store locations and categories');
    console.log('   • API usage tracking');
    console.log('   • Admin audit logging');
    console.log('   • System health monitoring');
    console.log('   • User sessions and activity');
    console.log('   • Email templates and delivery tracking');
    console.log('   • Error logging and debugging');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteMigration();
}

export { runCompleteMigration }; 