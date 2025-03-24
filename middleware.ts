import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AuthObject } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export default authMiddleware({
  publicRoutes: ["/", "/sign-in[[...sign-in]]", "/sign-up[[...sign-up]]"],
  afterAuth(auth, req) {
    // Redirect signed-in users from landing page to dashboard
    if (auth.userId && new URL(req.url).pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect signed-in users away from auth pages
    if (
      auth.userId &&
      ["/sign-in[[...sign-in]]", "/sign-up[[...sign-up]]"].includes(
        new URL(req.url).pathname
      )
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return Response.redirect(signInUrl);
    }

    // Add authentication to Supabase requests
    if (auth.userId) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("Authorization", `Bearer ${auth.userId}`);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
