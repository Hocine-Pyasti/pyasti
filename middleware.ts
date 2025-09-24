import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

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

// First apply next-intl routing
export default function middleware(req: Request, ctx: any) {
  const res = intlMiddleware(req);

  // After intl resolves, check auth
  return auth((reqWithAuth: any) => {
    const publicPathRegex = RegExp(
      `^(/(${routing.locales.join("|")}))?(${publicPages
        .flatMap((p) => (p === "/" ? ["", "/"] : p))
        .join("|")})/?$`,
      "i"
    );

    const isPublicPage = publicPathRegex.test(reqWithAuth.nextUrl.pathname);

    if (isPublicPage) {
      return res; // ✅ just use intl result
    }

    if (!reqWithAuth.auth) {
      // Redirect to sign-in if not authenticated
      const newUrl = new URL(
        `/sign-in?callbackUrl=${
          encodeURIComponent(reqWithAuth.nextUrl.pathname) || "/"
        }`,
        reqWithAuth.nextUrl.origin
      );
      return NextResponse.redirect(newUrl);
    }

    return res; // ✅ authorized + localized
  }, ctx)(req, ctx);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
