import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const healthRouter = createTRPCRouter({
  ping: protectedProcedure.query(() => ({
    ok: true,
    timestamp: new Date().toISOString(),
  })),

  echo: protectedProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => ({
      message: input.message,
    })),
});
