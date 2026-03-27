import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware runtime: default (edge). Keep logic lightweight and avoid
// importing server-only modules here.

const AUTH_PATHS = [
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/forgot-password",
  "/verify-success",
  "/two-factor",
];

// Public pages under src/app/(public)
const PUBLIC_PATHS = [
  "/",
  "/blog",
  "/changelog",
  "/contact",
  "/features",
  "/help",
  "/pricing",
];

function isPublicPath(pathname: string) {
  // allow exact public paths and their children (e.g. /blog, /blog/slug)
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return true;
  // also allow static assets, next internals, and auth API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return true;
  }
  return false;
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Guard against open redirect attacks — only allow relative paths. */
function isValidRedirectPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes(":\\") &&
    !/^\/[^/]*@/.test(path)
  );
}

/**
 * Heuristic check for an authenticated request.
 *
 * We avoid importing server-only auth helpers in middleware (edge runtime).
 * Instead we look for common auth/session cookies set by auth libraries. This
 * is intentionally conservative: if any likely cookie is present we treat the
 * request as authenticated. The server-side APIs (tRPC / server loaders) still
 * enforce auth as the source of truth.
 */
function detectAuthFromCookies(req: NextRequest) {
  try {
    // Check known auth cookie names used by Better Auth
    const common = [
      "better-auth.session_token",
      "better-auth.session",
      "__Secure-better-auth.session_token",
      "ba.session",
      "ba.token",
      "better-auth",
      "better_auth",
      "next-auth.session-token",
    ];
    for (const name of common) {
      if (req.cookies.get(name)) return true;
    }
  } catch (err) {
    // do not block on cookie inspection failures
    void err;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths without auth.
  if (isPublicPath(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isAuth = detectAuthFromCookies(req);

  // If request is to an auth page and user is authenticated, redirect to overview
  if (isAuthPath(pathname)) {
    if (isAuth) {
      const url = req.nextUrl.clone();
      url.pathname = "/overview";
      return NextResponse.redirect(url);
    }
    // unauthenticated users may access auth pages
    return NextResponse.next();
  }

  // All other routes are considered protected. If no auth detected, redirect to sign-in.
  if (!isAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    if (isValidRedirectPath(pathname)) {
      url.searchParams.set("redirectTo", pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Match all routes so middleware runs globally, but exclude next internals
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
