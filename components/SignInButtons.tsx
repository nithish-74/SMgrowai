"use client";

import { Chrome, Instagram, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";

// CSS variables for our dark neon aesthetic
const colors = {
  surface2: "#1e1e2e",
  border2: "rgba(255,255,255,.12)",
  text: "#f0eeff",
  text2: "#a09ab8",
  lime: "#b8ff57",
};

export default function SignInButtons() {
  const handleSignIn = async (provider: string) => {
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleSignIn("credentials")}
        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px] hover:shadow-[0_0_30px_rgba(184,255,87,0.25)]"
        style={{
          background: colors.lime,
          color: "#05050a"
        }}
      >
        <Sparkles className="h-5 w-5" />
        Continue with Demo
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: colors.border2 }}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span
            className="px-4"
            style={{
              background: "#16161f",
              color: colors.text3
            }}
          >
            Or sign in with
          </span>
        </div>
      </div>

      <button
        onClick={() => handleSignIn("google")}
        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
        style={{
          background: colors.surface2,
          border: `1px solid ${colors.border2}`,
          color: colors.text
        }}
      >
        <span className="text-xl" style={{ color: "#ea4335" }}>G</span>
        Continue with Google
      </button>

      <button
        onClick={() => handleSignIn("instagram")}
        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
        style={{
          background: colors.surface2,
          border: `1px solid ${colors.border2}`,
          color: colors.text
        }}
      >
        <span className="text-xl">📷</span>
        Continue with Instagram
      </button>
    </div>
  );
}
