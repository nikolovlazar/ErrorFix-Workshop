import * as schema from './schema';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a mock DB interface for browser environment
const createMockDB = () => {
  console.log('Creating mock database interface for browser environment');

  return {
    execute: async () => {
      console.log('Mock DB execute called in browser environment');
      return { rows: [] };
    },
    query: async () => ({ rows: [] }),
  };
};

// Variables for database connection
let dbConnection: any;
let dbInitializationPromise: Promise<any> | null = null;
let dbInitialized = false;
let drizzleInstance: any;

// Dynamic imports for server-side only
if (!isBrowser) {
  // This code will only run on the server
  drizzleInstance = drizzle;
}

export const getDB = async () => {
  if (dbInitialized) {
    return dbInitializationPromise;
  }

  if (!dbInitializationPromise) {
    dbInitializationPromise = (async () => {
      try {
        if (isBrowser) {
          // Browser environment: Return mock DB
          console.log('Browser environment detected, returning mock database');
          const mockDb = createMockDB();
          dbInitialized = true;
          return mockDb;
        } else {
          // Create SQLite database file path
          const dbPath = join(process.cwd(), 'sqlite.db');

          // Create SQLite client
          dbConnection = new Database(dbPath);

          // Initialize Drizzle ORM
          const db = drizzleInstance(dbConnection, { schema });

          dbInitialized = true;
          return db;
        }
      } catch (error) {
        console.error('❌ Error initializing database:', error);
        dbInitialized = false;
        dbInitializationPromise = null;
        throw error;
      }
    })();
  }
  return dbInitializationPromise;
};

export const getSQLiteConnection = async () => {
  if (isBrowser) {
    console.log(
      'Browser environment detected, no direct SQLite client available'
    );
    return createMockDB();
  }

  if (!dbConnection) {
    await getDB();
  }

  return dbConnection;
};
