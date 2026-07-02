import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return;
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
