"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import SignupModal from "@/components/SignupModal";
import InteractiveDemo from "@/components/InteractiveDemo";
import Link from "next/link";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main>
        <HeroSection />

        {/* Platform Ticker */}
        <section className="py-8 border-y border-white/5 overflow-hidden">
          <div className="flex animate-marquee gap-12">
            {[
              "📸 Instagram Reels",
              "📸 Instagram Carousels",
              "𝕏 Twitter Threads",
              "🐦 Twitter Posts",
              "🎵 TikTok Coming Soon",
              "💼 LinkedIn Coming Soon",
            ].map((item, i) => (
              <span
                key={i}
                className="text-text2 whitespace-nowrap text-sm font-medium font-mono"
              >
                {item}
              </span>
            ))}
            {[
              "📸 Instagram Reels",
              "📸 Instagram Carousels",
              "𝕏 Twitter Threads",
              "🐦 Twitter Posts",
              "🎵 TikTok Coming Soon",
              "💼 LinkedIn Coming Soon",
            ].map((item, i) => (
              <span
                key={`copy-${i}`}
                className="text-text2 whitespace-nowrap text-sm font-medium font-mono"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <HowItWorks />
        <InteractiveDemo />
        <FeaturesSection />

        {/* Stats strip */}
        <section className="py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-lime mb-2 font-display">
                800K+
              </p>
              <p className="text-text2 text-sm">Posts analysed</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-cyan mb-2 font-display">
                4.2×
              </p>
              <p className="text-text2 text-sm">Avg engagement uplift</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-violet-light mb-2 font-display">
                2,400+
              </p>
              <p className="text-text2 text-sm">Brands using SMgrowai</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-pink mb-2 font-display">
                18hrs
              </p>
              <p className="text-text2 text-sm">Saved per month</p>
            </div>
          </div>
        </section>

        <PricingSection />

        {/* CTA Banner */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-display">
              Stop writing captions. Start scaling.
            </h2>
            <p className="text-xl text-text2 mb-10">
              Your AI CMO works 24/7. Costs less than one agency invoice. Gets better every week.
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-lg font-bold text-lg bg-lime text-bg hover:shadow-[0_0_40px_rgba(184,255,87,0.25)] hover:-translate-y-1 transition-all duration-300"
            >
              Get your AI CMO free
              <span>→</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-1 text-xl font-bold mb-4 font-display">
                  <span>SMgrowai</span>
                  <span className="text-lime">.</span>
                </div>
                <p className="text-text2 text-sm">Your AI Chief Marketing Officer — research, create, post on autopilot.</p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-text2 text-sm">
                  <li><Link href="#" className="hover:text-text transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Integrations</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-text2 text-sm">
                  <li><Link href="#" className="hover:text-text transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-text2 text-sm">
                  <li><Link href="#" className="hover:text-text transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-text3 text-sm">© {new Date().getFullYear()} SMgrowai Inc. All rights reserved.</p>
              <div className="flex items-center gap-4">
                {["𝕏", "📸", "💼"].map((icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-full bg-surface2 border border-white/10 flex items-center justify-center text-text2 hover:text-text hover:border-white/20 transition-all">
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>

      <SignupModal isOpen={modalOpen} onClose={closeModal} />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes orb-float { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px,20px) scale(1.05); } }
      `}</style>
    </div>
  );
}