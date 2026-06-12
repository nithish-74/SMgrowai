import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { requireUserId } from "@/server/lib/ownership";
import { addScrapeJob } from "@/server/queues/scrape.queue";
import { checkRateLimit } from "@/lib/rate-limit";

export const productsRouter = createTRPCRouter({
  importProduct: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);
      
      const rateLimit = await checkRateLimit(userId, "import", 10, 3600);
      if (!rateLimit.allowed) {
        throw new Error("Too many imports. Please try again later.");
      }

      const product = await ctx.prisma.product.create({
        data: {
          userId,
          url: input.url,
          title: "Pending import",
          images: [],
        },
      });

      await addScrapeJob({
        productId: product.id,
        url: input.url,
      });

      return { productId: product.id };
    }),

  getProducts: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx);

    return ctx.prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }),
});
