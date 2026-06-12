export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      subscription: true,
      generatedPosts: true,
    },
  });

  const userData = users.map((user) => ({
    id: user.id,
    email: user.email,
    plan: user.subscription?.plan || "free",
    postsPublished: user.generatedPosts.filter((p) => p.status === "posted").length,
    lastActive: user.updatedAt.toISOString(),
  }));

  return NextResponse.json(userData);
}
