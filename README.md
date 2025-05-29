# Next.js E-commerce Project

This is a Next.js e-commerce project using PostgreSQL for the database and Drizzle ORM for database operations.

## Database Setup

The project uses PostgreSQL as the database. The connection details are stored in the `.env` file.

### Database Migration and Seeding

The project includes scripts to migrate the database schema and seed the database with initial data:

1. **Run Migrations**: This will create the necessary tables in the database.

   ```bash
   npm run db:migrate
   ```

2. **Seed Database**: This will populate the database with product data.
   ```bash
   npm run db:seed
   ```

### Database Management

The project includes several scripts for database management:

- `npm run db:generate`: Generate migration files based on schema changes
- `npm run db:push`: Push schema changes to the database
- `npm run db:studio`: Open Drizzle Studio to view and manage database data
- `npm run db:seed`: Seed the database with initial data

## Development

To start the development server:

```bash
npm run dev
```

## Build and Start

To build and start the production server:

```bash
npm run build
npm run start
```

## Project Structure

- `app/`: Next.js app directory
- `components/`: React components
- `lib/`: Utility functions and modules
  - `lib/db/`: Database-related code
- `scripts/`: Utility scripts
  - `scripts/run-migrations.ts`: Script to run database migrations
  - `scripts/seed-database.ts`: Script to seed the database with initial data
