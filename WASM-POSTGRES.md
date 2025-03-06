# WASM-based PostgreSQL with Drizzle ORM

This document describes the implementation of WASM-based PostgreSQL using PGlite and Drizzle ORM in our Next.js application.

## Overview

We've implemented a local PostgreSQL database that runs in WebAssembly (WASM) using PGlite, integrated with Drizzle ORM for type-safe database operations. This approach allows us to:

1. Run a full PostgreSQL database directly in the browser or Node.js environment
2. Maintain type safety with Drizzle ORM
3. Progressively migrate from static data to a database-backed application
4. Potentially support offline-first functionality in the future

### Progressive Enhancement

This implementation uses a progressive enhancement approach. If the WASM-based PostgreSQL database cannot be initialized for any reason (browser compatibility, memory constraints, etc.), the application will automatically fall back to using static data. This ensures that the application remains functional even if the advanced database features are not available.

### Fallback Mechanism

The fallback mechanism is implemented at the API level. If the database initialization fails, the API routes will automatically serve the static data instead. This makes the fallback transparent to the frontend components, which continue to work without any changes.

## Technology Stack

- **PGlite**: A WASM build of PostgreSQL that runs in the browser and Node.js
- **Drizzle ORM**: A TypeScript ORM for type-safe database operations
- **Drizzle Kit**: Tools for schema migrations and database management

## Directory Structure

```
lib/
  ├── db/
  │   ├── index.ts                    # Database connection and initialization
  │   ├── schema.ts                   # Database schema definitions
  │   ├── repositories/               # Data access layer
  │   │   └── product-repository.ts   # Product-related database operations
  │   └── services/                   # Business logic layer
  │       └── db-service.ts           # Database initialization and seeding
  └── data.ts                         # Original static data (kept for reference)
drizzle.config.ts                     # Drizzle configuration
```

## How It Works

### Database Connection

The database connection is managed in `lib/db/index.ts`. We use PGlite to create a WASM-based PostgreSQL instance in in-memory mode for simplicity and compatibility. We've created an adapter to make PGlite compatible with Drizzle ORM, which allows us to use Drizzle's type-safe query building with PGlite's PostgreSQL implementation.

```typescript
// Create a lite instance with file-based storage
pglite = await PGlite.create('./pgdata');

// Create an adapter function that makes PGlite compatible with Drizzle ORM
function createPGliteAdapter(pgLiteInstance: PGlite): RemoteCallback {
  return async (sql: string, params: any[], method: "all" | "execute", typings?: any[]): Promise<{ rows: any[] }> => {
    try {
      let result;
      
      if (method === "execute") {
        // For DDL statements (CREATE, ALTER, DROP, etc.)
        result = await pgLiteInstance.exec(sql);
        return { rows: [] }; // exec doesn't return rows
      } else {
        // For DML statements (SELECT, INSERT, UPDATE, DELETE)
        // PGlite uses $1, $2, etc. for parameterized queries
        result = await pgLiteInstance.query(sql, params);
        return { rows: result.rows || [] };
      }
    } catch (error) {
      console.error('PGlite query error:', error);
      throw error;
    }
  };
}

// Create a Drizzle ORM instance using our adapter
const pgliteAdapter = createPGliteAdapter(pglite);
db = drizzle(pgliteAdapter, { schema });
```

### Persistence

We're using different storage methods based on the environment to ensure persistence:

1. **Browser Environment**: Using IndexedDB for persistence
   ```typescript
   // In the main database service
   pglite = await PGlite.create('idb://pgdata');
   
   // In the React provider
   const pglite = await PGlite.create('idb://pgdata-react');
   ```

2. **Node.js Environment**: Using file-based storage
   ```typescript
   // In the main database service
   pglite = await PGlite.create('./pgdata');
   ```

This approach ensures that the database persists between application restarts in both environments. In the browser, data is stored in IndexedDB, while in Node.js, it's stored in files in the project directory.

```typescript
// Environment-aware initialization
if (typeof window !== 'undefined') {
  // Browser environment - use IndexedDB for persistence
  pglite = await PGlite.create('idb://pgdata');
} else {
  // Node.js environment - use file-based storage
  pglite = await PGlite.create('./pgdata');
}
```

### PGlite Methods

PGlite provides two main methods for interacting with the database:

1. **query**: For parameterized queries (SELECT, INSERT, UPDATE, DELETE)
   ```typescript
   const result = await pglite.query(
     'SELECT * FROM products WHERE id = $1',
     [productId]
   );
   ```

2. **exec**: For executing multiple SQL statements (CREATE TABLE, ALTER TABLE, etc.)
   ```typescript
   await pglite.exec(`
     CREATE TABLE IF NOT EXISTS products (
       id SERIAL PRIMARY KEY,
       name TEXT NOT NULL
     );
     
     CREATE TABLE IF NOT EXISTS product_images (
       id SERIAL PRIMARY KEY,
       product_id INTEGER NOT NULL REFERENCES products(id)
     );
   `);
   ```

Our adapter correctly routes Drizzle ORM's queries to the appropriate PGlite method based on the query type.

### Schema Definition

The database schema is defined in `lib/db/schema.ts` using Drizzle ORM's schema definition syntax. We've created tables for products, product images, product sizes, and product colors.

### Data Access Layer

We use the repository pattern to abstract database operations. The `ProductRepository` class in `lib/db/repositories/product-repository.ts` provides methods for retrieving and manipulating product data.

### Database Initialization and Seeding

The `db-service.ts` file provides functions for initializing the database and seeding it with sample data. This is called when the application starts to ensure the database is ready to use.

### API Integration

The API routes in `app/api/products/route.ts` and `app/api/products/[id]/route.ts` have been updated to use the database instead of static data. These routes include error handling and fallback mechanisms to ensure that the application remains functional even if the database is not available.

```typescript
// Example of API route with fallback mechanism
export async function GET() {
  try {
    // Initialize and seed the database if needed
    const initialized = await bootstrapDatabase();
    
    if (!initialized) {
      // If database initialization failed, fall back to static data
      console.warn('Using static data as fallback due to database initialization failure');
      return NextResponse.json(products);
    }
    
    try {
      // Get all products from the database
      const dbProducts = await productRepository.getAllProducts();
      return NextResponse.json(dbProducts);
    } catch (dbError) {
      // If database query failed, fall back to static data
      console.warn('Using static data as fallback due to database query failure:', dbError);
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('Error in products API route:', error);
    // Fall back to static data in case of any error
    return NextResponse.json(products);
  }
}
```

## Usage

### Initializing the Database

```typescript
import { bootstrapDatabase } from '@/lib/db/services/db-service';

// Initialize and seed the database
await bootstrapDatabase();
```

### Accessing Product Data

```typescript
import { productRepository } from '@/lib/db/repositories/product-repository';

// Get all products
const products = await productRepository.getAllProducts();

// Get a product by ID
const product = await productRepository.getProductById('1');
```

## Development Tools

We've added several npm scripts to make working with the database easier:

- `npm run db:generate`: Generate SQL migrations based on schema changes
- `npm run db:push`: Apply schema changes to the database
- `npm run db:studio`: Open Drizzle Studio to view and edit database data

## React Integration

We've implemented a React integration for PGlite and Drizzle ORM using React Context and hooks. This allows components to directly access the database and perform queries using Drizzle ORM.

### PGliteDrizzleProvider

The `PGliteDrizzleProvider` component initializes the PGlite database and Drizzle ORM instance and provides them to child components through React Context.

```tsx
import { PGliteDrizzleProvider } from '@/lib/db/pglite-provider';

function App() {
  return (
    <PGliteDrizzleProvider>
      <YourComponent />
    </PGliteDrizzleProvider>
  );
}
```

### useDrizzle Hook

The `useDrizzle` hook provides access to the Drizzle ORM instance from any component within the `PGliteDrizzleProvider`.

```tsx
import { useDrizzle } from '@/lib/db/pglite-provider';
import { schema } from '@/lib/db';

function YourComponent() {
  const db = useDrizzle();
  
  const fetchProducts = async () => {
    const products = await db.select().from(schema.products);
    // Use the products data
  };
  
  return (
    // Your component JSX
  );
}
```

### Example Component

The `DatabaseTest` component demonstrates how to use the PGlite and Drizzle ORM integration in a React component. It fetches products from the database and displays them, with a fallback to the API if the database is not available.

```tsx
function DatabaseTestInner() {
  const db = useDrizzle();

  const fetchProducts = async () => {
    try {
      // Try to fetch products from the database using Drizzle ORM
      const result = await db.select().from(schema.products);
      
      if (result.length > 0) {
        // We have products in the database
        setProducts(result);
        setDbInitialized(true);
      } else {
        // No products in the database, fall back to API
        await fetchFromApi();
      }
    } catch (dbError) {
      // If there's an error with the database, fall back to API
      await fetchFromApi();
    }
  };
  
  // Rest of the component
}

// Wrapper component that provides the PGliteDrizzleProvider
export function DatabaseTest() {
  return (
    <PGliteDrizzleProvider>
      <DatabaseTestInner />
    </PGliteDrizzleProvider>
  );
}
```

## Future Enhancements

1. Add more repositories for other entities (users, orders, etc.)
2. Implement data synchronization for offline-first functionality
3. Add more complex queries and relationships
4. Optimize performance for large datasets
5. Add full-text search capabilities
6. Improve error handling and recovery mechanisms
7. Add database migration support for schema changes
8. Implement caching strategies for better performance
9. Add support for real-time updates using PostgreSQL's LISTEN/NOTIFY
10. Enhance the React integration with more hooks and utilities

## Resources

- [PGlite Documentation](https://pglite.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
