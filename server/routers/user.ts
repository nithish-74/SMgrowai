import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => ({
    id: ctx.session.user.id,
    name: ctx.session.user.name,
    email: ctx.session.user.email,
    image: ctx.session.user.image,
  })),
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.user.update({
      where: { id: ctx.session.user.id },
      data: { onboardingComplete: true },
    });
  }),
});
