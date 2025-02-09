import { Adapter, AdapterUser, AdapterAccount, AdapterSession } from '@auth/core/adapters';
import { db, query } from './db';

export function PostgresAdapter(): Adapter {
  return {
    async createUser(user) {
      console.log('Creating user:', user);
      try {
        const { name, email, emailVerified, image } = user;
        const result = await query(
          'INSERT INTO users (name, email, email_verified, image) VALUES ($1, $2, $3, $4) RETURNING *',
          [name, email, emailVerified, image]
        );
        const dbUser = result.rows[0];
        console.log('User created:', dbUser);
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          emailVerified: dbUser.email_verified,
          image: dbUser.image,
        };
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },

    async getUser(id) {
      console.log('Getting user by id:', id);
      try {
        const user = await db.getUserById(id);
        console.log('User found:', user);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          image: user.image,
        };
      } catch (error) {
        console.error('Error getting user:', error);
        throw error;
      }
    },

    async getUserByEmail(email) {
      console.log('Getting user by email:', email);
      try {
        const user = await db.getUserByEmail(email);
        console.log('User found:', user);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          image: user.image,
        };
      } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      console.log('Getting user by account:', { providerAccountId, provider });
      try {
        const account = await db.getAccount({ providerAccountId, provider });
        if (!account) return null;
        const user = await db.getUserById(account.user_id);
        console.log('User found:', user);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          image: user.image,
        };
      } catch (error) {
        console.error('Error getting user by account:', error);
        throw error;
      }
    },

    async updateUser(user) {
      console.log('Updating user:', user);
      try {
        const { id, ...data } = user;
        const result = await query(
          'UPDATE users SET name = $1, email = $2, image = $3, email_verified = $4 WHERE id = $5 RETURNING *',
          [data.name, data.email, data.image, data.emailVerified, id]
        );
        const dbUser = result.rows[0];
        console.log('User updated:', dbUser);
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          emailVerified: dbUser.email_verified,
          image: dbUser.image,
        };
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },

    async deleteUser(userId) {
      console.log('Deleting user:', userId);
      try {
        await query('DELETE FROM users WHERE id = $1', [userId]);
        console.log('User deleted');
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },

    async linkAccount(account) {
      console.log('Linking account:', account);
      try {
        await query(
          `INSERT INTO accounts (
            user_id, provider, type, provider_account_id,
            access_token, expires_at, refresh_token,
            token_type, scope, id_token, session_state
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            account.userId,
            account.provider,
            account.type,
            account.providerAccountId,
            account.access_token,
            account.expires_at,
            account.refresh_token,
            account.token_type,
            account.scope,
            account.id_token,
            account.session_state,
          ]
        );
        console.log('Account linked');
      } catch (error) {
        console.error('Error linking account:', error);
        throw error;
      }
    },

    async unlinkAccount({ providerAccountId, provider }) {
      console.log('Unlinking account:', { providerAccountId, provider });
      try {
        await query(
          'DELETE FROM accounts WHERE provider_account_id = $1 AND provider = $2',
          [providerAccountId, provider]
        );
        console.log('Account unlinked');
      } catch (error) {
        console.error('Error unlinking account:', error);
        throw error;
      }
    },

    async createSession(session) {
      console.log('Creating session:', session);
      try {
        const result = await query(
          'INSERT INTO sessions (session_token, user_id, expires) VALUES ($1, $2, $3) RETURNING *',
          [session.sessionToken, session.userId, session.expires]
        );
        console.log('Session created:', result.rows[0]);
        return result.rows[0];
      } catch (error) {
        console.error('Error creating session:', error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken) {
      console.log('Getting session and user:', sessionToken);
      try {
        const session = await db.getSessionByToken(sessionToken);
        if (!session) return null;
        const user = await db.getUserById(session.user_id);
        console.log('Session and user found:', { session, user });
        if (!user) return null;
        return {
          session: {
            sessionToken: session.session_token,
            userId: session.user_id,
            expires: session.expires,
          },
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.email_verified,
            image: user.image,
          },
        };
      } catch (error) {
        console.error('Error getting session and user:', error);
        throw error;
      }
    },

    async updateSession(session) {
      console.log('Updating session:', session);
      try {
        const result = await query(
          'UPDATE sessions SET expires = $1 WHERE session_token = $2 RETURNING *',
          [session.expires, session.sessionToken]
        );
        console.log('Session updated:', result.rows[0]);
        return result.rows[0];
      } catch (error) {
        console.error('Error updating session:', error);
        throw error;
      }
    },

    async deleteSession(sessionToken) {
      console.log('Deleting session:', sessionToken);
      try {
        await query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
        console.log('Session deleted');
      } catch (error) {
        console.error('Error deleting session:', error);
        throw error;
      }
    },

    async createVerificationToken(token) {
      console.log('Creating verification token:', token);
      try {
        const result = await query(
          'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3) RETURNING *',
          [token.identifier, token.token, token.expires]
        );
        console.log('Verification token created:', result.rows[0]);
        return result.rows[0];
      } catch (error) {
        console.error('Error creating verification token:', error);
        throw error;
      }
    },

    async useVerificationToken({ identifier, token }) {
      console.log('Using verification token:', { identifier, token });
      try {
        const result = await query(
          'DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING *',
          [identifier, token]
        );
        console.log('Verification token used:', result.rows[0]);
        return result.rows[0] ?? null;
      } catch (error) {
        console.error('Error using verification token:', error);
        throw error;
      }
    },
  };
} 