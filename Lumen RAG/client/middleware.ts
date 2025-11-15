import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // `auth` may be a function that returns an auth handler (older API)
    // or an auth handler object itself (newer API). Handle both shapes.
    const authHandler = typeof auth === 'function' ? await auth() : auth;

    if (authHandler && typeof authHandler.protect === 'function') {
      // protect() may be async depending on Clerk version
      await authHandler.protect();
    }
  }
}, {
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};