import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL for migrations');
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function main() {
  await migrate(db, { migrationsFolder: './drizzle' });
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
