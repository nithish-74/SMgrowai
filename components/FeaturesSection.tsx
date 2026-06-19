"use client";

import { useState } from "react";

const features = [
  {
    icon: "📊",
    title: "Weekly strategy briefing",
    description: "Every Monday your CMO delivers a written strategy — what to post, why, and what's winning right now.",
    tag: "CMO-grade analysis",
  },
  {
    icon: "🎯",
    title: "Brand voice lock",
    description: "Brief your CMO once — tone, audience, pillars, what to avoid. Sounds like you, not generic AI.",
    tag: "Sounds like you",
  },
  {
    icon: "🔍",
    title: "Competitor monitoring",
    description: "Tracks competitor content and surfaces gaps you can exploit before they do.",
    tag: "Starter + Pro",
  },
  {
    icon: "📈",
    title: "Performance memory",
    description: "Every post is tracked. The CMO learns what works and compounds performance weekly.",
    tag: "Gets smarter",
  },
  {
    icon: "📬",
    title: "Daily digest email",
    description: "Morning briefing — what's posting today, yesterday's performance, one action.",
    tag: "Starter + Pro",
  },
  {
    icon: "⚡",
    title: "Standing instructions",
    description: "Give standing orders: 'always include a product link', 'never post Sundays'.",
    tag: "Full control",
  },
];

export default function FeaturesSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardId, setCardId] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setCardId(index);
  };

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-lime text-sm mb-3 font-medium" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            {/* // Features */}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-clash-display)" }}>
            Not a tool. An operator.
          </h2>
          <p className="text-text2 max-w-2xl mx-auto text-lg">
            SMgrowai thinks like a senior CMO — makes decisions, explains reasoning, only asks when it needs you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border bg-surface relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                borderColor: cardId === index ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.07)",
              }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => setCardId(null)}
            >
              {cardId === index && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(184,255,87,0.12), transparent 40%)`,
                    transition: "opacity 0.3s",
                  }}
                />
              )}

              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(184,255,87,0.1))",
                }}
              >
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-clash-display)" }}>
                {feature.title}
              </h3>

              <p className="text-text2 mb-6 leading-relaxed">
                {feature.description}
              </p>

              <span
                className="inline-block px-3 py-1 rounded-full text-sm"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  color: "var(--violet-light)",
                  background: "rgba(139,92,246,0.1)",
                }}
              >
                {feature.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}