export const dynamic = "force-dynamic";

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth } from "@/auth";
import { createTRPCContext } from "@/server/context";
import { appRouter } from "@/server/routers";

const handler = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export { handler as GET, handler as POST };
