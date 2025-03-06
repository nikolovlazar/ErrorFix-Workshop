import { PGliteWorker } from "@electric-sql/pglite/worker";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { runMigrations } from "./migrations";

let pgWorkerClient: PGliteWorker;
let dbInitializationPromise: Promise<ReturnType<typeof drizzle>> | null = null;
let dbInitialized = false;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof Worker !== 'undefined';

// Create a mock DB interface that will be used for server-side rendering
const createMockDB = () => {
  console.log('Creating mock database interface for server environment');
  
  // Return a mock DB that has the same interface but returns empty results
  return {
    execute: async (query: any) => {
      console.log('Mock DB execute called with:', query);
      return { rows: [] };
    },
    // Add other methods as needed to match the Drizzle interface
    query: async () => ({ rows: [] }),
    // This makes sure we don't break during migrations
    dialect: {
      migrate: async () => Promise.resolve(),
    },
  };
};

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
            // Browser environment: Use PGliteWorker with Web Worker
            console.log('Initializing database in browser environment with Web Worker');
            pgWorkerClient = new PGliteWorker(
              new Worker(new URL("./pg-lite-worker.ts", import.meta.url), {
                type: "module",
              }),
              {
                dataDir: "idb://pgdata",
                meta: {},
              },
            );
            
            console.log('Initializing Drizzle ORM with worker client...');
            const db = drizzle(pgWorkerClient as any, { schema });
            
            console.log('Running migrations...');
            await runMigrations(db);
            
            console.log('✅ Browser database initialization complete');
            dbInitialized = true;
            return db;
          } else {
            // Server/Node.js environment: Use mock DB
            console.log('📋 Creating mock database for server environment');
            
            // Create a mock DB interface
            const mockDbClient = createMockDB();
            
            // Wrap it in Drizzle interface for consistency
            const db = drizzle(mockDbClient as any, { schema });
            
            console.log('✅ Server mock database initialization complete');
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
    if (!pgWorkerClient) {
      if (isBrowser) {
        console.log('PGClient not initialized, initializing database...');
        await getDB();
        return pgWorkerClient;
      } else {
        console.log('Server environment detected, no PGClient available');
        throw new Error('PGClient is not available in server environment');
      }
    }
    
    return pgWorkerClient;
  };