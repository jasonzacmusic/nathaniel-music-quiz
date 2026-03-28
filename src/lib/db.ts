import { neon } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL!;
const sql = neon(connectionString);

export default sql;
