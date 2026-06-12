import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createTRPCContext() {
  const session = await auth();

  return {
    prisma,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
