/**
 * Script to run Drizzle migrations for SQLite
 * This script applies migrations to the database
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs';

// Get database path
const dbPath = join(process.cwd(), 'sqlite.db');
console.log(`SQLite database path: ${dbPath}`);

// Get migrations directory
const migrationsDir = join(process.cwd(), 'lib', 'db', 'migrations');
const exportFile = join(migrationsDir, 'export.json');

async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // Connect to SQLite database
    const db = new Database(dbPath);
    console.log('Connected to SQLite database');
    
    // Create migrations table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS _drizzle_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL,
        created_at TEXT
      )
    `);
    
    // Load migrations from export.json
    if (!fs.existsSync(exportFile)) {
      console.log('No migrations found in export.json');
      return;
    }
    
    const migrationsData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
    
    if (!Array.isArray(migrationsData) || migrationsData.length === 0) {
      console.log('No migrations found in export.json');
      return;
    }
    
    console.log(`Found ${migrationsData.length} migrations to apply`);
    
    // Apply each migration in a transaction
    for (const migration of migrationsData) {
      // Check if migration has already been applied
      const exists = db.prepare('SELECT id FROM _drizzle_migrations WHERE name = ?').get(migration.file);
      
      if (exists) {
        console.log(`Migration ${migration.file} already applied, skipping`);
        continue;
      }
      
      console.log(`Applying migration: ${migration.file}`);
      
      // Start transaction
      db.exec('BEGIN TRANSACTION');
      
      try {
        // Execute migration SQL
        db.exec(migration.sql);
        
        // Record migration in migrations table
        db.prepare(
          "INSERT INTO _drizzle_migrations (name, hash, created_at) VALUES (?, ?, datetime('now'))"
        ).run(migration.file, 'manual-migration');
        
        // Commit transaction
        db.exec('COMMIT');
        console.log(`✅ Applied migration: ${migration.file}`);
      } catch (error) {
        // Rollback transaction on error
        db.exec('ROLLBACK');
        console.error(`❌ Error applying migration ${migration.file}:`, error);
        throw error;
      }
    }
    
    console.log('✅ All migrations completed successfully');
    
    // Display tables in database
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📊 Tables in database:', tables.map((row: any) => row.name));
    
    // Close database connection
    db.close();
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
