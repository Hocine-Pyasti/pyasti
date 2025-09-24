import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const protectedPaths = [
        /\/checkout(\/.*)?/,
        /\/account(\/.*)?/,
        /\/admin(\/.*)?/,
      ];

      // Allow public access to root and non-protected routes
      if (
        pathname === "/" ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up")
      ) {
        return true;
      }

      // Require auth for protected paths
      return protectedPaths.some((p) => p.test(pathname)) ? !!auth : true;
    },
  },
} satisfies NextAuthConfig;
