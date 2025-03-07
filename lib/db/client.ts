import * as schema from "./schema";

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

// Only import node-postgres in server environment
let pgPool: any;
let dbInitializationPromise: Promise<any> | null = null;
let dbInitialized = false;
let drizzleInstance: any;

// Dynamic imports for server-side only
if (!isBrowser) {
  // This code will only run on the server
  import('drizzle-orm/node-postgres').then((drizzleModule) => {
    drizzleInstance = drizzleModule.drizzle;
  });
}

export const getDB = async () => {
  if (dbInitialized) {
    console.log('Database already initialized, reusing existing connection');
    return dbInitializationPromise;
  }
  
  if (!dbInitializationPromise) {
    console.log('Starting database initialization...');
    dbInitializationPromise = (async () => {
      try {
        if (isBrowser) {
          // Browser environment: Return mock DB
          console.log('Browser environment detected, returning mock database');
          const mockDb = createMockDB();
          dbInitialized = true;
          return mockDb;
        } else {
          // Server/Node.js environment: Use real PostgreSQL connection
          console.log('Initializing PostgreSQL connection in server environment');
          
          // Dynamically import pg in server environment
          const { Pool } = await import('pg');
          
          // Create PostgreSQL client
          const connectionString = process.env.DATABASE_URL;
          if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
          }
          
          pgPool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false }
          });
          
          // Initialize Drizzle ORM
          const db = drizzleInstance(pgPool, { schema });
          
          console.log('✅ Server database initialization complete');
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

export const getPGClient = async () => {
  if (isBrowser) {
    console.log('Browser environment detected, no direct PostgreSQL client available');
    return createMockDB();
  }
  
  if (!pgPool) {
    console.log('PostgreSQL client not initialized, initializing database...');
    await getDB();
  }
  
  return pgPool;
};
