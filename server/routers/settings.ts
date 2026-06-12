import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { requireUserId } from "@/server/lib/ownership";
import { maskToken } from "@/server/lib/mask-token";

export const settingsRouter = createTRPCRouter({
  setAutoPost: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);

      await ctx.prisma.user.update({
        where: { id: userId },
        data: { autoPost: input.enabled },
      });

      return { autoPost: input.enabled };
    }),

  setDigestEnabled: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);

      await ctx.prisma.user.update({
        where: { id: userId },
        data: { digestEnabled: input.enabled },
      });

      return { digestEnabled: input.enabled };
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx);

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { autoPost: true, digestEnabled: true },
    });

    return user;
  }),

  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx);

    const tokens = await ctx.prisma.oAuthToken.findMany({
      where: { userId },
      orderBy: { provider: "asc" },
    });

    return tokens.map((token) => ({
      id: token.id,
      provider: token.provider,
      accessToken: maskToken(token.accessToken),
      refreshToken: maskToken(token.refreshToken),
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
    }));
  }),
});
