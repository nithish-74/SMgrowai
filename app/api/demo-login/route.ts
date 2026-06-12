import { NextResponse } from "next/server";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // First, check if we already have a demo user
  let demoUser = await prisma.user.findUnique({
    where: { email: "demo@smgrowai.com" },
  });

  if (!demoUser) {
    // Create a demo user
    demoUser = await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@smgrowai.com",
        emailVerified: new Date(),
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      },
    });
  }

  // Create a session manually (we'll use a redirect to dashboard for now)
  // Since we're using PrismaAdapter, let's just redirect to dashboard and set a cookie?
  // Alternatively, we can use NextAuth's signIn with credentials, but let's keep it simple for demo!
  // Wait, let's create a Credentials provider temporarily! Wait, let's update our auth.config.ts to add a Credentials provider for demo purposes!
  // But for now, let's just redirect to dashboard and set a cookie, but better to update auth config!
  return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
