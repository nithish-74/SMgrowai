import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: {
    // Use JWT for demo/credentials provider, database for OAuth
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.onboardingComplete = false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
});
