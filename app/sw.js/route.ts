export const dynamic = "force-static";

import { NextResponse } from "next/server";
import { SERVICE_WORKER_SOURCE } from "@/lib/serviceWorkerSource";

export async function GET() {
  return new NextResponse(SERVICE_WORKER_SOURCE, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}