import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

export type Role = "admin" | "user";

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: Role;
  created_at: string;
  /** Requerido por @vercel/postgres: sql<T> exige que T extienda QueryResultRow */
  [key: string]: unknown;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  created_at: string;
  [key: string]: unknown;
}

let tableEnsured = false;

/** Crea la tabla si no existe. Se llama antes de cada query, es idempotente. */
async function ensureUsersTable() {
  if (tableEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  tableEnsured = true;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  await ensureUsersTable();
  const { rows } = await sql<DbUser>`
    SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1;
  `;
  return rows[0] ?? null;
}

export async function countUsers(): Promise<number> {
  await ensureUsersTable();
  const { rows } = await sql<{ count: string; [key: string]: unknown }>`SELECT COUNT(*)::text as count FROM users;`;
  return Number(rows[0]?.count ?? 0);
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  name?: string | null;
  role: Role;
}): Promise<DbUser> {
  await ensureUsersTable();
  const id = randomUUID();
  const { rows } = await sql<DbUser>`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (${id}, ${params.email.toLowerCase().trim()}, ${params.passwordHash}, ${params.name ?? null}, ${params.role})
    RETURNING *;
  `;
  return rows[0];
}

export async function listUsers(): Promise<SafeUser[]> {
  await ensureUsersTable();
  const { rows } = await sql<SafeUser>`
    SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC;
  `;
  return rows;
}

export async function deleteUser(id: string): Promise<void> {
  await ensureUsersTable();
  await sql`DELETE FROM users WHERE id = ${id};`;
}
