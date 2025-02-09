import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

// Helper functions for common operations
export const db = {
  // Users
  async createUser({ name, email, image }: { name?: string | null; email?: string | null; image?: string | null }) {
    const result = await query(
      'INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *',
      [name, email, image]
    );
    return result.rows[0];
  },

  async getUserByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async getUserById(id: string) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Sessions
  async createSession({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }) {
    const result = await query(
      'INSERT INTO sessions (session_token, user_id, expires) VALUES ($1, $2, $3) RETURNING *',
      [sessionToken, userId, expires]
    );
    return result.rows[0];
  },

  async getSessionByToken(sessionToken: string) {
    const result = await query(
      'SELECT * FROM sessions WHERE session_token = $1',
      [sessionToken]
    );
    return result.rows[0];
  },

  async deleteSession(sessionToken: string) {
    await query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
  },

  // Accounts
  async createAccount({
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
    const result = await query(
      `INSERT INTO accounts (
        user_id, type, provider, provider_account_id,
        refresh_token, access_token, expires_at,
        token_type, scope, id_token
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        userId, type, provider, providerAccountId,
        refresh_token, access_token, expires_at,
        token_type, scope, id_token
      ]
    );
    return result.rows[0];
  },

  async getAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
    const result = await query(
      'SELECT * FROM accounts WHERE provider = $1 AND provider_account_id = $2',
      [provider, providerAccountId]
    );
    return result.rows[0];
  },

  // Verification tokens
  async createVerificationToken({ identifier, token, expires }: { identifier: string; token: string; expires: Date }) {
    const result = await query(
      'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3) RETURNING *',
      [identifier, token, expires]
    );
    return result.rows[0];
  },

  async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
    const result = await query(
      'DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING *',
      [identifier, token]
    );
    return result.rows[0];
  }
}; 