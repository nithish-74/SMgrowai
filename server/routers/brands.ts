import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const brandsRouter = createTRPCRouter({
  getBrand: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.brand.findUnique({
      where: { userId: ctx.session.user.id },
    });
  }),

  createBrand: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        website: z.string().optional(),
        industry: z.string().optional(),
        targetAudience: z.string(),
        brandVoice: z.string(),
        goals: z.array(z.string()),
        contentPillars: z.array(z.string()).optional(),
        competitors: z.array(z.string()).optional(),
        avoidTopics: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brand.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    }),

  updateBrand: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        targetAudience: z.string().optional(),
        brandVoice: z.string().optional(),
        goals: z.array(z.string()).optional(),
        contentPillars: z.array(z.string()).optional(),
        competitors: z.array(z.string()).optional(),
        avoidTopics: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brand.update({
        where: { userId: ctx.session.user.id },
        data: input,
      });
    }),

  addInstruction: protectedProcedure
    .input(z.object({ instruction: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.cMOInstruction.create({
        data: {
          userId: ctx.session.user.id,
          instruction: input.instruction,
        },
      });
    }),

  removeInstruction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.cMOInstruction.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { active: false },
      });
    }),

  getInstructions: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.cMOInstruction.findMany({
      where: { userId: ctx.session.user.id, active: true },
      orderBy: { createdAt: "desc" },
    });
  }),
});
