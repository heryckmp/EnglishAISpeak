import type { Adapter } from "next-auth/adapters";
import * as db from "./actions/db";

export function PostgresAdapter(): Adapter {
  return {
    async createUser(user) {
      const result = await db.createUser(user);
      if (!result) throw new Error("Failed to create user");
      return {
        id: result.id,
        name: result.name,
        email: result.email,
        emailVerified: result.email_verified,
        image: result.image,
      };
    },

    async getUser(id) {
      const user = await db.getUserById(id);
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        image: user.image,
      };
    },

    async getUserByEmail(email) {
      const user = await db.getUserByEmail(email);
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        image: user.image,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await db.getAccount({ provider, providerAccountId });
      if (!account) return null;
      const user = await db.getUserById(account.user_id);
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        image: user.image,
      };
    },

    async updateUser(user) {
      const result = await db.updateUser(user);
      if (!result) throw new Error("Failed to update user");
      return {
        id: result.id,
        name: result.name,
        email: result.email,
        emailVerified: result.email_verified,
        image: result.image,
      };
    },

    async deleteUser(userId) {
      await db.deleteUser(userId);
    },

    async linkAccount(account) {
      await db.createAccount(account);
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await db.deleteAccount({ provider, providerAccountId });
    },

    async createSession(session) {
      const result = await db.createSession(session);
      if (!result) throw new Error("Failed to create session");
      return result;
    },

    async getSessionAndUser(sessionToken) {
      const session = await db.getSessionByToken(sessionToken);
      if (!session) return null;
      const user = await db.getUserById(session.user_id);
      if (!user) return null;
      return {
        session,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified,
          image: user.image,
        },
      };
    },

    async updateSession(session) {
      const result = await db.updateSession(session);
      if (!result) throw new Error("Failed to update session");
      return result;
    },

    async deleteSession(sessionToken) {
      await db.deleteSession(sessionToken);
    },

    async createVerificationToken(token) {
      const result = await db.createVerificationToken(token);
      if (!result) throw new Error("Failed to create verification token");
      return result;
    },

    async useVerificationToken({ identifier, token }) {
      const result = await db.useVerificationToken({ identifier, token });
      if (!result) return null;
      return result;
    },
  };
} 