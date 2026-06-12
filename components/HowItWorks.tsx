"use client";

import { useState, useEffect } from "react";

const steps = [
  {
    id: 1,
    number: "01",
    title: "Connect & import",
    description: "Link Instagram and Twitter. Paste your product URL — SMgrowai scrapes everything automatically in seconds.",
    tag: "⚡ Takes 2 minutes",
  },
  {
    id: 2,
    number: "02",
    title: "Scan what's winning",
    description: "Your CMO scans 800K+ posts to find the highest-performing formats and hooks in your exact niche.",
    tag: "📡 Real-time intelligence",
  },
  {
    id: 3,
    number: "03",
    title: "Strategy & content",
    description: "The AI CMO builds a weekly plan, rewrites copy in your brand voice, generates platform-native content.",
    tag: "🧠 CMO-level thinking",
  },
  {
    id: 4,
    number: "04",
    title: "Post on autopilot",
    description: "Go full auto or review and approve. CMO tracks performance and improves every week.",
    tag: "🚀 Auto or copilot",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-12 items-start">
          {/* Left: Tabs */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full p-6 rounded-2xl border text-left transition-all duration-300 ${
                  activeStep === step.id
                    ? "bg-surface border-l-lime border-l-[3px]"
                    : "bg-transparent border-l-transparent hover:bg-surface/50"
                }`}
                style={{ borderColor: activeStep === step.id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`text-2xl font-bold ${
                      activeStep === step.id ? "text-lime" : "text-text3"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-clash-display)" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-text2 mb-3">{step.description}</p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm"
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        background: "rgba(139,92,246,0.1)",
                        color: "var(--violet-light)",
                      }}
                    >
                      {step.tag}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Preview */}
          <div className="sticky top-32">
            <div className="p-8 rounded-2xl border bg-surface" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-bg3 border border-white/5 flex items-center gap-3">
                    <span className="text-text3">🔗</span>
                    <span className="text-text2">your-product.com</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 rounded-xl bg-bg3 border border-white/5 text-center">
                      <p className="text-4xl mb-2">📸</p>
                      <p className="text-lime font-bold">Instagram</p>
                      <p className="text-text3 text-sm">Connected</p>
                    </div>
                    <div className="p-6 rounded-xl bg-bg3 border border-white/5 text-center">
                      <p className="text-4xl mb-2">🐦</p>
                      <p className="text-cyan font-bold">Twitter</p>
                      <p className="text-text3 text-sm">Connected</p>
                    </div>
                    <div className="p-6 rounded-xl bg-bg3 border border-white/5 text-center">
                      <p className="text-4xl mb-2">🛒</p>
                      <p className="text-violet-light font-bold">Product</p>
                      <p className="text-text3 text-sm">Scraped</p>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <h4 className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-clash-display)" }}>
                    Format Performance
                  </h4>
                  <div className="space-y-4">
                    {[
                      { name: "Carousel", er: 9.2 },
                      { name: "Reels", er: 8.5 },
                      { name: "Thread", er: 7.8 },
                      { name: "Single Image", er: 6.1 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="text-lime font-bold">{item.er}%</span>
                        </div>
                        <div className="h-3 bg-bg3 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${(item.er / 10) * 100}%`,
                              background: "linear-gradient(90deg, #b8ff57, #22d3ee)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-bg3 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-pink">📸 Instagram</span>
                    </div>
                    <p className="text-sm text-text2 leading-relaxed">
                      "The biggest mistake founders make is not shipping fast enough. We build features, but no one knows about them… (cont.)"
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-bg3 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-cyan">🐦 Twitter</span>
                    </div>
                    <p className="text-sm text-text2 leading-relaxed">
                      1/ Building in public changed everything for me. Here are 7 lessons that took my SaaS from $0 to $10k/mo… (cont.)
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-4">
                  {[
                    { status: "POSTED", day: "Mon", title: "Product launch hook", platform: "Instagram" },
                    { status: "SCHEDULED", day: "Tue", title: "Competitor take down", platform: "Twitter" },
                    { status: "QUEUED", day: "Wed", title: "Problem-solution", platform: "Instagram" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-bg3 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-text3 text-sm">{item.day} · {item.platform}</p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background:
                            item.status === "POSTED"
                              ? "rgba(184,255,87,0.15)"
                              : item.status === "SCHEDULED"
                              ? "rgba(34,211,238,0.15)"
                              : "rgba(139,92,246,0.15)",
                          color:
                            item.status === "POSTED"
                              ? "var(--lime)"
                              : item.status === "SCHEDULED"
                              ? "var(--cyan)"
                              : "var(--violet-light)",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}