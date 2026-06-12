"use client";

import { useState } from "react";
import Link from "next/link";

const pricing = {
  monthly: {
    free: 0,
    starter: 19,
    pro: 49,
  },
  annual: {
    free: 0,
    starter: 13,
    pro: 34,
  },
};

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const prices = annual ? pricing.annual : pricing.monthly;

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: "var(--font-clash-display)" }}>
            Less than a junior hire.
          </h2>

          <div className="flex items-center justify-center gap-4">
            <span className={`${!annual ? "text-text" : "text-text3"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-14 h-8 rounded-full bg-surface2 border border-white/10 transition-all"
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-lime transition-all ${
                  annual ? "left-7" : "left-1"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`${annual ? "text-text" : "text-text3"}`}>Annual</span>
              {annual && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-bg bg-lime">
                Save 30%
              </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="p-8 rounded-2xl border bg-surface transition-all duration-300 hover:-translate-y-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-clash-display)" }}>
              Free
            </h3>
            <div className="text-5xl font-bold mb-2">
              ${prices.free}<span className="text-lg text-text3">/mo</span>
            </div>
            <p className="text-text2 mb-6">
              Try your AI CMO. No card needed.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "✓ 5 posts per month", "✓ 1 platform", "✓ Weekly strategy briefing",
                "— Competitor monitoring", "— Daily digest email", "— Auto-posting"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-text2">
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block text-center w-full py-3 px-6 rounded-lg border font-bold transition-all duration-300 hover:bg-surface2"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              Get started free
            </Link>
          </div>

          {/* Starter - Most Popular */}
          <div className="p-8 rounded-2xl border bg-surface relative transition-all duration-300 hover:-translate-y-1" style={{
            borderColor: "rgba(255,255,255,0.07)",
            boxShadow: "0 0 40px rgba(184,255,87,0.15)",
          }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold bg-lime text-bg">
              MOST POPULAR
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-lime to-cyan absolute top-0 left-0" />
            <h3 className="text-2xl font-bold mb-2 mt-4" style={{ fontFamily: "var(--font-clash-display)" }}>
              Starter
            </h3>
            <div className="text-5xl font-bold mb-2">
              ${prices.starter}<span className="text-lg text-text3">/mo</span>
            </div>
            <p className="text-text2 mb-6">
              For founders ready to grow on social.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "✓ 30 posts per month", "✓ Instagram + Twitter", "✓ Weekly strategy briefing",
                "✓ 2 competitor monitors", "✓ Daily digest email", "✓ Auto-posting"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-text2">
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/onboarding"
              className="block text-center w-full py-3 px-6 rounded-lg font-bold text-bg bg-lime transition-all duration-300 hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] hover:-translate-y-0.5"
            >
              Start Starter
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-2xl border bg-surface transition-all duration-300 hover:-translate-y-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-clash-display)" }}>
              Pro
            </h3>
            <div className="text-5xl font-bold mb-2">
              ${prices.pro}<span className="text-lg text-text3">/mo</span>
            </div>
            <p className="text-text2 mb-6">
              Full autopilot. Maximum output.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "✓ Unlimited posts", "✓ Instagram + Twitter", "✓ Weekly strategy briefing",
                "✓ 5 competitor monitors", "✓ Daily digest email", "✓ Full autopilot mode"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-text2">
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/onboarding"
              className="block text-center w-full py-3 px-6 rounded-lg border font-bold transition-all duration-300 hover:bg-surface2"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              Go Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}