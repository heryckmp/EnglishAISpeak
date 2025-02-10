import { Pool } from 'pg';
import config from './config';

const pool = new Pool({
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
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

export const db = {
  createUser: async ({ name, email, image }: { name?: string | null; email?: string | null; image?: string | null }) => {
    return queryOne(`
      INSERT INTO users (name, email, image)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, email, image]);
  },

  getUserByEmail: async (email: string) => {
    return queryOne('SELECT * FROM users WHERE email = $1', [email]);
  },

  getUserById: async (id: string) => {
    return queryOne('SELECT * FROM users WHERE id = $1', [id]);
  },

  createSession: async ({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }) => {
    return queryOne(`
      INSERT INTO sessions (session_token, user_id, expires)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [sessionToken, userId, expires]);
  },

  getSessionByToken: async (sessionToken: string) => {
    return queryOne('SELECT * FROM sessions WHERE session_token = $1', [sessionToken]);
  },

  deleteSession: async (sessionToken: string) => {
    await execute('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
  },

  createAccount: async ({
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
  }) => {
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
  },

  getAccount: async ({ provider, providerAccountId }: { provider: string; providerAccountId: string }) => {
    return queryOne(`
      SELECT * FROM accounts
      WHERE provider = $1 AND provider_account_id = $2
    `, [provider, providerAccountId]);
  },

  createVerificationToken: async ({ identifier, token, expires }: { identifier: string; token: string; expires: Date }) => {
    return queryOne(`
      INSERT INTO verification_tokens (identifier, token, expires)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [identifier, token, expires]);
  },

  useVerificationToken: async ({ identifier, token }: { identifier: string; token: string }) => {
    const result = await queryOne(`
      DELETE FROM verification_tokens
      WHERE identifier = $1 AND token = $2
      RETURNING *
    `, [identifier, token]);
    return result;
  },
}; 