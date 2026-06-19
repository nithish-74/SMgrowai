import type { NextAuthConfig } from "next-auth";
import Instagram from "next-auth/providers/instagram";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Instagram({
      clientId: process.env.AUTH_INSTAGRAM_ID,
      clientSecret: process.env.AUTH_INSTAGRAM_SECRET,
    }),
    // Only include demo credentials in development
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            name: "Demo",
            credentials: {},
            async authorize() {
              return {
                id: "demo-user-id",
                name: "Demo User",
                email: "demo@smgrowai.com",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
              };
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
