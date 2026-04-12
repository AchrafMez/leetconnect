import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';


//Creates a Postgres connection pool compatible with Prisma 7 Driver Adapters.
// Used by services to bypass the Rust binary engine issues in Docker.

export function createPrismaAdapter(databaseUrl?: string) {
    const url = databaseUrl || process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required');

    const pool = new pg.Pool({ connectionString: url });
    return new PrismaPg(pool);
}