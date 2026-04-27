import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth/config";

const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  const { auth, nextUrl } = req;
  const isLoggedIn = Boolean(auth?.user);
  const path = nextUrl.pathname;

  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/leaderboard",
    "/reminders",
    "/onboarding",
    "/challenges",
  ];

  const requiresAuth = protectedPaths.some((p) => path.startsWith(p));
  if (requiresAuth && !isLoggedIn) {
    const url = new URL("/signin", nextUrl);
    if (path !== "/signin") url.searchParams.set("from", path);
    return Response.redirect(url);
  }

  if (isLoggedIn && (path === "/signin" || path === "/signup")) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|avif)).*)",
  ],
};
