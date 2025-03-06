import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";

worker({
  async init(options) {
    console.log('🔄 Initializing PGlite in worker...');
    try {
      const pgLiteInstance = new PGlite({
        dataDir: options.dataDir,
        relaxedDurability: true,
      });
      console.log('✅ PGlite worker initialized successfully');
      return pgLiteInstance;
    } catch (error) {
      console.error(`❌ PGlite worker initialization error:`, error);
      throw error;
    }
  },
});