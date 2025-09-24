import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const authPages = ["/sign-in", "/sign-up"]; // never localized
const publicPages = [
  "/",
  "/search",
  "/cart",
  "/cart/(.*)",
  "/product/(.*)",
  "/page/(.*)",
  "/verify/(.*)",
  "/sign-up/verify/(.*)",
];

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Skip API & static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // 2. Skip auth pages completely (no locale, no redirect)
  if (authPages.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 3. Public pages (locale handled by intlMiddleware)
  const isPublicPage = publicPages.some((p) =>
    new RegExp(`^(/(${routing.locales.join("|")}))?${p}$`, "i").test(pathname)
  );
  if (isPublicPage) {
    return intlMiddleware(req);
  }

  // 4. Protected pages
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
