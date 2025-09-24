import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const publicPages = [
  "/",
  "/search",
  "/sign-in",
  "/sign-up",
  "/sign-up/verify/(.*)",
  "/verify/(.*)",
  "/cart",
  "/cart/(.*)",
  "/product/(.*)",
  "/page/(.*)",
];

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip API and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Public pages don't require auth
  const isPublicPage = publicPages.some((path) =>
    new RegExp(`^(/(${routing.locales.join("|")}))?${path}$`, "i").test(
      pathname
    )
  );

  if (isPublicPage) {
    return intlMiddleware(req);
  }

  // Require auth for everything else
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"], // skip static files
};
