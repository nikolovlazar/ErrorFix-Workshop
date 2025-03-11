/**
 * Script to export Drizzle migrations for SQLite
 * This script exports migrations to be used in the application
 */

import fs from 'fs';
import path from 'path';

// Paths
const migrationDir = path.resolve(process.cwd(), 'lib/db/migrations');
const exportFile = path.resolve(migrationDir, 'export.json');

async function exportMigrations() {
  console.log('Exporting migrations...');
  
  try {
    // Get all .sql files in migrations directory
    const files = fs.readdirSync(migrationDir).filter(file => file.endsWith('.sql'));
    
    const migrations = files.map(file => {
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      return {
        file,
        sql
      };
    });
    
    // Write to export.json
    fs.writeFileSync(exportFile, JSON.stringify(migrations, null, 2));
    console.log(`Exported ${migrations.length} migrations to ${exportFile}`);
  } catch (error) {
    console.error('Error exporting migrations:', error);
    process.exit(1);
  }
}

exportMigrations();
