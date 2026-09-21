import { clerkMiddleware } from "@clerk/nextjs/server";

import { isAppPath } from "@/lib/nav";

function isProtectedPath(pathname: string): boolean {
  return (
    isAppPath(pathname) ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/")
  );
}

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedPath(request.nextUrl.pathname)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
