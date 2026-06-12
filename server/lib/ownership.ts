import { TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";

export function requireUserId(ctx: Context): string {
  const userId = ctx.session?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return userId;
}

export function assertOwner(resourceUserId: string, sessionUserId: string) {
  if (resourceUserId !== sessionUserId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
  }
}
