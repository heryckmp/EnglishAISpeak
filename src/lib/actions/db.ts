'use server';

import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
});

export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function queryOne<T = any>(sql: string, values?: any[]): Promise<T | null> {
  const results = await query<T>(sql, values);
  return results[0] || null;
}

export async function execute(sql: string, values?: any[]): Promise<void> {
  await query(sql, values);
}

export async function beginTransaction() {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client;
}

export async function commit(client: any) {
  await client.query('COMMIT');
  client.release();
}

export async function rollback(client: any) {
  await client.query('ROLLBACK');
  client.release();
}

export async function createUser({ name, email, image }: { name?: string | null; email?: string | null; image?: string | null }) {
  return queryOne(`
    INSERT INTO users (name, email, image)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [name, email, image]);
}

export async function getUserByEmail(email: string) {
  return queryOne('SELECT * FROM users WHERE email = $1', [email]);
}

export async function getUserById(id: string) {
  return queryOne('SELECT * FROM users WHERE id = $1', [id]);
}

export async function createSession({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }) {
  return queryOne(`
    INSERT INTO sessions (session_token, user_id, expires)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [sessionToken, userId, expires]);
}

export async function getSessionByToken(sessionToken: string) {
  return queryOne('SELECT * FROM sessions WHERE session_token = $1', [sessionToken]);
}

export async function deleteSession(sessionToken: string) {
  await execute('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
}

export async function createAccount({
  userId,
  type,
  provider,
  providerAccountId,
  refresh_token,
  access_token,
  expires_at,
  token_type,
  scope,
  id_token,
}: {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
}) {
  return queryOne(`
    INSERT INTO accounts (
      user_id, type, provider, provider_account_id,
      refresh_token, access_token, expires_at,
      token_type, scope, id_token
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    userId,
    type,
    provider,
    providerAccountId,
    refresh_token,
    access_token,
    expires_at,
    token_type,
    scope,
    id_token,
  ]);
}

export async function getAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
  return queryOne(`
    SELECT * FROM accounts
    WHERE provider = $1 AND provider_account_id = $2
  `, [provider, providerAccountId]);
}

export async function createVerificationToken({ identifier, token, expires }: { identifier: string; token: string; expires: Date }) {
  return queryOne(`
    INSERT INTO verification_tokens (identifier, token, expires)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [identifier, token, expires]);
}

export async function useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
  const result = await queryOne(`
    DELETE FROM verification_tokens
    WHERE identifier = $1 AND token = $2
    RETURNING *
  `, [identifier, token]);
  return result;
}

export async function updateUser(user: any) {
  const { id, ...data } = user;
  return queryOne(`
    UPDATE users 
    SET name = $1, email = $2, image = $3, email_verified = $4 
    WHERE id = $5 
    RETURNING *
  `, [data.name, data.email, data.image, data.emailVerified, id]);
}

export async function deleteUser(userId: string) {
  await execute('DELETE FROM users WHERE id = $1', [userId]);
}

export async function deleteAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
  await execute(
    'DELETE FROM accounts WHERE provider = $1 AND provider_account_id = $2',
    [provider, providerAccountId]
  );
}

export async function updateSession(session: any) {
  return queryOne(`
    UPDATE sessions 
    SET expires = $1 
    WHERE session_token = $2 
    RETURNING *
  `, [session.expires, session.sessionToken]);
} 