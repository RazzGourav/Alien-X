// frontend/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  // Only the homepage (where the sign-in button is) needs to be public.
  // All other pages and API routes (/dashboard, /api) require authentication.
  publicRoutes: ["/"]
});

export const config = {
  // This matcher ensures the middleware runs on everything, so Clerk can
  // attach the user session to the request for the API routes to read.
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};