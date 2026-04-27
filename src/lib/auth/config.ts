import type { NextAuthConfig } from "next-auth";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/leaderboard",
  "/reminders",
  "/onboarding",
  "/challenges",
];

/**
 * Edge-safe shared Auth.js config.
 *
 * Does NOT contain providers — those are added in `src/lib/auth/index.ts`
 * which is only loaded in the Node.js runtime (via the API routes).
 *
 * The middleware imports this file directly and runs on the Edge runtime,
 * so we keep it free of `bcryptjs`, `@prisma/client`, etc.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const requiresAuth = PROTECTED_PATHS.some((path) =>
        pathname.startsWith(path),
      );
      if (!requiresAuth) return true;
      return Boolean(auth?.user);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
