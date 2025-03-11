/**
 * Script to set up SQLite database directly - CommonJS version
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Get database path
const dbPath = path.join(process.cwd(), 'sqlite.db');
console.log(`Setting up SQLite database at: ${dbPath}`);

// Sample product data - Updated to include all 8 products from lib/data.ts
const sampleProducts = [
  {
    id: '1',
    name: 'Hydration Mismatch Resolver Pro',
    description: 'Tired of "Text content did not match server-rendered HTML" errors ruining your React app? Our Hydration Mismatch Resolver Pro uses quantum entanglement to ensure your server and client renders are perfectly synchronized.',
    price: 1899.99,
    images: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2',
      'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e',
    ],
    category: 'frontend',
    featured: true,
    sizes: ['Minor Mismatch', 'Critical Hydration Failure'],
    colors: ['React', 'Next.js', 'Remix'],
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    name: '502 Bad Gateway Exorcist',
    description: 'Banish those demonic 502 errors to the shadow realm! Our Bad Gateway Exorcist performs a ritual cleansing of your load balancers, proxy servers, and API gateways.',
    price: 2349.99,
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      'https://images.unsplash.com/photo-1597600159211-d6c104f408d1',
    ],
    category: 'networking',
    featured: true,
    sizes: ['Intermittent', 'Catastrophic'],
    colors: ['Nginx', 'Apache', 'Cloudflare'],
    inStock: true,
    rating: 4.9,
    reviewCount: 87,
  },
  {
    id: '3',
    name: 'SQL Query Optimizer 9000',
    description: 'Transform your database from a sloth to a cheetah! Our SQL Query Optimizer 9000 analyzes your most horrific queries and performs dark magic to make them blazing fast.',
    price: 3299.99,
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095',
    ],
    category: 'database',
    featured: false,
    sizes: ['Slow Query', 'Table Scan Disaster', 'Join Apocalypse'],
    colors: ['MySQL', 'PostgreSQL', 'SQL Server'],
    inStock: true,
    rating: 4.7,
    reviewCount: 215,
  },
  {
    id: '4',
    name: 'N+1 Query Terminator',
    description: 'Stop your ORM from firing 10,000 queries to load a single page! Our N+1 Query Terminator hunts down and eliminates inefficient database access patterns with extreme prejudice.',
    price: 2499.99,
    images: [
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      'https://images.unsplash.com/photo-1573164574572-cb89e39749b4',
    ],
    category: 'database',
    featured: true,
    sizes: ['One Size'],
    colors: ['Hibernate', 'Sequelize', 'ActiveRecord'],
    inStock: true,
    rating: 4.6,
    reviewCount: 178,
  },
  {
    id: '5',
    name: 'Downtime Defender Shield',
    description: 'Achieve that mythical "five nines" uptime with our Downtime Defender Shield! Creates an impenetrable barrier around your production environment, protecting it from random AWS outages, accidental kubectl deletes, and "just pushing this small change on Friday" syndrome.',
    price: 4999.99,
    images: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
    ],
    category: 'devops',
    featured: false,
    sizes: ['Startup', 'Enterprise', 'Mission Critical'],
    colors: ['AWS', 'GCP', 'Azure'],
    inStock: true,
    rating: 4.9,
    reviewCount: 64,
  },
  {
    id: '6',
    name: 'Dependency Hell Escape Ladder',
    description: 'Climb out of dependency hell with our sturdy Escape Ladder. Untangle your package.json, resolve version conflicts, and eliminate those circular dependencies.',
    price: 899.99,
    images: [
      'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    ],
    category: 'devops',
    featured: false,
    sizes: ['Small Project', 'Monorepo'],
    colors: ['npm Red', 'Yarn Blue'],
    inStock: true,
    rating: 4.7,
    reviewCount: 92,
  },
  {
    id: '7',
    name: 'Database Connection Pooling Lifeguard',
    description: 'Stop your database connections from drowning in a sea of requests! Our Connection Pooling Lifeguard monitors your connection pool, rescues zombie connections, and performs CPR on your database when it\'s gasping for resources.',
    price: 1789.99,
    images: [
      'https://images.unsplash.com/photo-1607798748738-b15c40d33d57',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8',
    ],
    category: 'database',
    featured: false,
    sizes: ['Standard Pool', 'Enterprise Pool'],
    colors: ['PostgreSQL', 'MySQL', 'MongoDB'],
    inStock: true,
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: '8',
    name: 'Unhandled Exception Detection',
    description: 'Catch those sneaky unhandled exceptions before they wreak havoc on your application! Our Exception Detection system proactively identifies potential runtime errors and adds robust error boundaries to prevent catastrophic failures.',
    price: 2999.99,
    images: [
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
      'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2',
    ],
    category: 'microservices',
    featured: true,
    sizes: ['One Size'],
    colors: ['Kubernetes', 'Docker', 'Serverless'],
    inStock: true,
    rating: 4.9,
    reviewCount: 73,
  }
];

// Main function to set up database
function setupDatabase() {
  try {
    // Connect to SQLite database (creates it if it doesn't exist)
    const db = new Database(dbPath);
    console.log('Connected to SQLite database');
    
    // Create tables
    createTables(db);
    
    // Seed data
    seedData(db);
    
    // Display tables in database
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📊 Tables in database:', tables.map(row => row.name));
    
    // Close database connection
    db.close();
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Function to create tables
function createTables(db) {
  console.log('Creating tables...');
  
  // Create products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      in_stock INTEGER NOT NULL DEFAULT 1,
      rating REAL,
      review_count INTEGER DEFAULT 0,
      images TEXT NOT NULL DEFAULT '[]',
      sizes TEXT NOT NULL DEFAULT '[]',
      colors TEXT NOT NULL DEFAULT '[]'
    )
  `);
  
  // Create product_images table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  // Create product_sizes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  // Create product_colors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  console.log('Tables created successfully');
}

// Function to seed data
function seedData(db) {
  console.log('Seeding data...');
  
  // Check if products table already has data
  const countResult = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (countResult && countResult.count > 0) {
    console.log(`Products table already has ${countResult.count} rows, skipping seeding`);
    return;
  }
  
  // Start a transaction
  db.exec('BEGIN TRANSACTION');
  
  try {
    // Prepare statement for inserting products
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, description, price, category, featured, in_stock, 
        rating, review_count, images, sizes, colors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Insert each product
    for (const product of sampleProducts) {
      insertProduct.run(
        product.name,
        product.description,
        product.price,
        product.category,
        product.featured ? 1 : 0,
        product.inStock ? 1 : 0,
        product.rating,
        product.reviewCount,
        JSON.stringify(product.images),
        JSON.stringify(product.sizes || []),
        JSON.stringify(product.colors || [])
      );
    }
    
    // Commit the transaction
    db.exec('COMMIT');
    console.log(`Seeded ${sampleProducts.length} products`);
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Run the setup
setupDatabase();
