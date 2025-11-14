// frontend/middleware.ts
import { clerkMiddleware, getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((auth, req: NextRequest) => {
  // --- START DEBUGGING ---
  console.log(`\n[MIDDLEWARE] Running for: ${req.nextUrl.pathname}`);
  // --- END DEBUGGING ---

  // Make the homepage (where your sign-in is) public
  if (req.nextUrl.pathname === "/") {
    return;
  }

  // If not the homepage, protect the route
  auth.protect();
});

export const config = {
  // This matcher will run the middleware on all routes
  // including your API routes.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};