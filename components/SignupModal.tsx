"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const colors = {
    text: "#f0eeff",
    text2: "#a09ab8",
    text3: "#5c5878",
    surface: "#16161f",
    surface2: "#1e1e2e",
    border: "rgba(255,255,255,0.12)",
    lime: "#b8ff57",
  };

  const avatarImages = [
    "https://i.pravatar.cc/40?img=1",
    "https://i.pravatar.cc/40?img=2",
    "https://i.pravatar.cc/40?img=3",
    "https://i.pravatar.cc/40?img=4",
    "https://i.pravatar.cc/40?img=5",
  ];

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl border relative"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
          style={{ backgroundColor: colors.surface2, color: colors.text3 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.text3)}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1 text-2xl font-bold mb-4">
              <span style={{ color: colors.text }}>SMgrowai</span>
              <span style={{ color: colors.lime }}>.</span>
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              Start for free.
            </h2>
            <p style={{ color: colors.text2 }}>
              No credit card. Cancel anytime.
            </p>
          </div>

          {/* Main Google Button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: "#fff", color: "#05050a" }}
          >
            <GoogleLogo />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: colors.border }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span style={{ backgroundColor: colors.surface, color: colors.text3 }} className="px-4">
                or continue with
              </span>
            </div>
          </div>

          {/* Instagram and Twitter Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => signIn("instagram", { callbackUrl: "/onboarding" })}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surface2;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span className="text-lg">📸</span>
              Continue with Instagram
            </button>

            <button
              onClick={() => signIn("twitter", { callbackUrl: "/onboarding" })}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surface2;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span className="text-lg">𝕏</span>
              Continue with Twitter / X
            </button>
          </div>

          {/* Already have an account? */}
          <div className="text-center">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: colors.text2 }}
            >
              Already have an account? <span style={{ color: colors.lime }}>Sign in →</span>
            </button>
          </div>

          {/* Trust Line with Avatars */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {avatarImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Founder avatar"
                  className="w-8 h-8 rounded-full border-2"
                  style={{ borderColor: colors.surface }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: colors.text2 }}>
              Join 2,400+ founders with an AI CMO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}