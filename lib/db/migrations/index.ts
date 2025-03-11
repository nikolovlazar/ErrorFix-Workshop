import { sql } from "drizzle-orm";
import { seedProducts } from "./001_seed_products";

/**
 * Run database migrations to set up schema and seed data
 */
export async function runMigrations(db: any) {
  try {
    console.log('Running database migrations...');
    console.log('DB object keys:', Object.keys(db));
    console.log('DB execute method available:', typeof db.execute === 'function');
    
    // Import migrations
    const migrationsModule = await import('./export.json');
    const migrations = migrationsModule.default || [];
    
    if (Array.isArray(migrations)) {
      // Apply each migration in sequence
      for (const migration of migrations) {
        console.log(`Applying migration: ${migration.name}`);
        
        if (migration.sql) {
          // SQL-based migration
          try {
            await db.execute(sql.raw(migration.sql));
            console.log(`✅ Applied SQL migration: ${migration.name}`);
          } catch (sqlError) {
            console.error(`❌ Error applying SQL migration ${migration.name}:`, sqlError);
            throw sqlError;
          }
        } else if (migration.type === 'js' && migration.function) {
          // JS-based migration
          try {
            // If using a direct import (as we've done with seedProducts)
            if (migration.function === 'seedProducts') {
              console.log('Calling seedProducts function...');
              await seedProducts(db);
              console.log('seedProducts function completed successfully');
            } else {
              console.warn(`⚠️ Unknown JS migration function: ${migration.function}`);
            }
            console.log(`✅ Applied JS migration: ${migration.name}`);
          } catch (jsError) {
            console.error(`❌ Error executing JS migration ${migration.name}:`, jsError);
            throw jsError;
          }
        } else {
          console.warn(`⚠️ Skipping migration with unknown format: ${migration.name}`);
        }
      }
      
      console.log('✅ All migrations applied successfully');
      
      // Verify database tables
      try {
        console.log('Verifying database tables...');
        const tables = await db.execute(sql`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        console.log('📊 Tables in database:', tables.rows?.map((row: any) => row.table_name).join(', ') || 'None');
      } catch (tableError) {
        console.error('Error verifying tables:', tableError);
      }
    } else {
      throw new Error('Invalid migrations format: not an array');
    }
  } catch (error) {
    console.error('❌ Error applying migrations:', error);
    throw error;
  }
} 