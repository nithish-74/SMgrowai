import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { assertOwner, requireUserId } from "@/server/lib/ownership";
import { addPostJob } from "@/server/queues/post.queue";

async function getOwnedGeneratedPost(
  prisma: Context["prisma"],
  generatedPostId: string,
  userId: string
) {
  const post = await prisma.generatedPost.findUnique({
    where: { id: generatedPostId },
  });

  if (!post) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
  }

  assertOwner(post.userId, userId);
  return post;
}

export const postsRouter = createTRPCRouter({
  getPendingPosts: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx);

    return ctx.prisma.generatedPost.findMany({
      where: { userId, status: "draft" },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, title: true, url: true, images: true },
        },
      },
    });
  }),

  approvePost: protectedProcedure
    .input(z.object({ generatedPostId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);
      const post = await getOwnedGeneratedPost(
        ctx.prisma,
        input.generatedPostId,
        userId
      );

      if (post.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft posts can be approved",
        });
      }

      const scheduledAt = post.scheduledAt ?? new Date();

      await ctx.prisma.generatedPost.update({
        where: { id: post.id },
        data: { status: "approved", scheduledAt },
      });

      await addPostJob({
        generatedPostId: post.id,
        scheduledAt,
      });

      return { success: true };
    }),

  rejectPost: protectedProcedure
    .input(z.object({ generatedPostId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);
      const post = await getOwnedGeneratedPost(
        ctx.prisma,
        input.generatedPostId,
        userId
      );

      if (post.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft posts can be rejected",
        });
      }

      await ctx.prisma.generatedPost.update({
        where: { id: post.id },
        data: { status: "rejected" },
      });

      return { success: true };
    }),

  schedulePost: protectedProcedure
    .input(
      z.object({
        generatedPostId: z.string().cuid(),
        scheduledAt: z.coerce.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);
      const post = await getOwnedGeneratedPost(
        ctx.prisma,
        input.generatedPostId,
        userId
      );

      if (post.status !== "draft" && post.status !== "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft or approved posts can be scheduled",
        });
      }

      if (input.scheduledAt.getTime() <= Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "scheduledAt must be in the future",
        });
      }

      await ctx.prisma.generatedPost.update({
        where: { id: post.id },
        data: {
          scheduledAt: input.scheduledAt,
          status: "approved",
        },
      });

      await addPostJob({
        generatedPostId: post.id,
        scheduledAt: input.scheduledAt,
      });

      return { success: true };
    }),
});
