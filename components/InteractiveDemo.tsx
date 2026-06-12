"use client";

import { useState } from "react";

const steps = [
  {
    title: "Your AI CMO researches",
    description: "We scan competitors, trends, and your historical posts to understand what works.",
    image: "🔍"
  },
  {
    title: "Strategy is planned",
    description: "Weekly content plan tailored to your goals and brand voice.",
    image: "📅"
  },
  {
    title: "Posts are created",
    description: "High-quality content ready to go — you can tweak anything before publishing.",
    image: "✍️"
  },
  {
    title: "Auto-published",
    description: "Posts go live automatically, or you can approve first. Results tracked in real-time.",
    image: "🚀"
  }
];

export default function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4">
            How your AI CMO works in 4 steps
          </h2>
          <p className="text-text2 text-lg max-w-2xl mx-auto">
            From research to published posts in one seamless workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  activeStep === i
                    ? "border-l-lime border-l-4 bg-surface"
                    : "border-white/5 bg-bg hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                      activeStep === i
                        ? "bg-lime text-bg"
                        : "bg-bg3 text-text3"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className={`font-bold ${activeStep === i ? "text-text" : "text-text2"}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-text2 mt-1">{step.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Demo Panel */}
          <div className="rounded-2xl border border-white/10 bg-surface p-6 min-h-[400px]">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-8xl mb-6">{steps[activeStep].image}</div>
                <h3 className="text-2xl font-bold font-display mb-4">
                  {steps[activeStep].title}
                </h3>
                <p className="text-text2">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
