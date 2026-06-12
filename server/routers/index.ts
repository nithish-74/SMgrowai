import { createTRPCRouter } from "@/server/trpc";
import { healthRouter } from "@/server/routers/health";
import { userRouter } from "@/server/routers/user";
import { productsRouter } from "@/server/routers/products";
import { postsRouter } from "@/server/routers/posts";
import { settingsRouter } from "@/server/routers/settings";
import { brandsRouter } from "@/server/routers/brands";
import { cmoRouter } from "@/server/routers/cmo";
import { billingRouter } from "@/server/routers/billing";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  user: userRouter,
  products: productsRouter,
  posts: postsRouter,
  settings: settingsRouter,
  brands: brandsRouter,
  cmo: cmoRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
