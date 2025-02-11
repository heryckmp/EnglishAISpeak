import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = config.matcher.some(pattern => {
        const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
        return regex.test(nextUrl.pathname);
      });
      
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  matcher: [
    "/chat/:path*",
    "/write/:path*",
    "/practice/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
} satisfies NextAuthConfig;

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(config); 