import { Pool } from 'pg';

export type Role = 'admin' | 'user';

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: Role;
  created_at: string;
  [key: string]: unknown;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

export async function ensureUsersTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  await ensureUsersTable();
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase().trim()]
  );
  return result.rows[0] ?? null;
}

export async function countUsers(): Promise<number> {
  await ensureUsersTable();
  const result = await pool.query('SELECT COUNT(*)::text as count FROM users');
  return Number(result.rows[0]?.count ?? 0);
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  name?: string | null;
  role: Role;
}): Promise<DbUser> {
  await ensureUsersTable();
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [params.email.toLowerCase().trim(), params.passwordHash, params.name ?? null, params.role]
  );
  return result.rows[0];
}

export async function listUsers(): Promise<SafeUser[]> {
  await ensureUsersTable();
  const result = await pool.query('SELECT id, email, name, role FROM users ORDER BY created_at DESC');
  return result.rows;
}

export async function deleteUser(userId: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}
