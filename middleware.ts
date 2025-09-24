import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import NextAuth from "next-auth";
import authConfig from "./auth.config";

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
  // (/secret requires auth)
];

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false, // Disable automatic locale detection to prevent redirects to unsupported locales like 'en-US'
});

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    if (!req.auth) {
      const newUrl = new URL(
        `/sign-in?callbackUrl=${
          encodeURIComponent(req.nextUrl.pathname) || "/"
        }`,
        req.nextUrl.origin
      );
      return Response.redirect(newUrl);
    } else {
      return intlMiddleware(req);
    }
  }
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
