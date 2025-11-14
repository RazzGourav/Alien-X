// frontend/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the routes that should be protected
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protects all routes starting with /dashboard
]);

export default clerkMiddleware((auth, req) => {
  // Check if the route is a protected route
  if (isProtectedRoute(req)) {
    //
    // THE FIX IS HERE:
    // It's `auth.protect()`, not `auth().protect()`
    //
    auth.protect(); // If it is, protect it
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};