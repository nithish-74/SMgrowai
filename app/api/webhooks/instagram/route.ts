export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hubMode = searchParams.get("hub.mode");
  const hubVerifyToken = searchParams.get("hub.verify_token");
  const hubChallenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (hubMode === "subscribe" && hubVerifyToken === verifyToken) {
    return new NextResponse(hubChallenge);
  }

  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Handle data-deletion requests
    if (body.object === "user" && body.entry?.[0]?.messaging?.[0]?.message?.text?.toLowerCase().includes("delete")) {
      // This is a simplified version; real deauth/data-deletion handlers need proper handling
      console.log("Received Instagram data deletion request", body);
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error processing Instagram webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
