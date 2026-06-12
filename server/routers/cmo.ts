import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { generateWeeklyStrategy } from "@/server/cmo/strategy";
import { analyseCompetitorPosts } from "@/server/cmo/competitors";
import { addScanJob } from "@/server/queues/scan.queue";
import { checkRateLimit } from "@/lib/rate-limit";

export const cmoRouter = createTRPCRouter({
  getWeeklyPlan: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    let weeklyPlan = await ctx.prisma.weeklyPlan.findFirst({
      where: {
        userId: ctx.session.user.id,
        weekOf: startOfWeek,
      },
      include: { plannedPosts: true },
    });

    if (!weeklyPlan) {
      await generateWeeklyStrategy(ctx.session.user.id);
      weeklyPlan = await ctx.prisma.weeklyPlan.findFirst({
        where: {
          userId: ctx.session.user.id,
          weekOf: startOfWeek,
        },
        include: { plannedPosts: true },
      });
    }

    return weeklyPlan;
  }),

  scanAccounts: protectedProcedure
    .input(z.object({
      provider: z.enum(["instagram", "twitter"])
    }))
    .mutation(async ({ ctx, input }) => {
      const rateLimit = await checkRateLimit(ctx.session.user.id, "scan", 3, 3600);
      if (!rateLimit.allowed) {
        throw new Error("Too many scans. Please try again later.");
      }

      await addScanJob({
        userId: ctx.session.user.id,
        provider: input.provider
      });
      return { success: true };
    }),

  regenerateWeeklyStrategy: protectedProcedure.mutation(async ({ ctx }) => {
    return generateWeeklyStrategy(ctx.session.user.id);
  }),

  getTopScannedPosts: protectedProcedure.query(async ({ ctx }) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return ctx.prisma.scannedPost.findMany({
      where: {
        userId: ctx.session.user.id,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { engagementRate: "desc" },
      take: 3,
    });
  }),

  updatePlannedPostStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "planned",
          "generating",
          "draft",
          "approved",
          "posted",
          "failed",
          "skipped",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.plannedPost.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { status: input.status },
      });
    }),

  getCompetitorPosts: protectedProcedure.query(async ({ ctx }) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return ctx.prisma.competitorPost.findMany({
      where: {
        userId: ctx.session.user.id,
        postedAt: { gte: sevenDaysAgo },
      },
      orderBy: { engagementRate: "desc" },
      take: 3,
    });
  }),

  getCompetitorAnalysis: protectedProcedure.query(async ({ ctx }) => {
    return analyseCompetitorPosts(ctx.session.user.id);
  }),
});
