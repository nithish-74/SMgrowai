"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import Link from "next/link";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main>
        <HeroSection />
        <FeaturesSection />
        
        {/* Stats Section */}
        <section className="py-20 border-y border-border bg-bg2">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "800K+", label: "Posts Analysed" },
              { number: "4.2×", label: "Avg Engagement Uplift" },
              { number: "2,400+", label: "Brands Using" },
              { number: "18hrs", label: "Saved/Month" }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl font-bold text-lime mb-2">
                  {stat.number}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <PricingSection />

        {/* CTA Banner */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop writing captions. Start scaling.
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Your AI CMO works 24/7. Costs less than one agency invoice. Gets better every week.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-lg font-bold text-lg bg-lime text-bg hover:shadow-[0_0_40px_rgba(184,255,87,0.25)] hover:-translate-y-1 transition-all duration-300"
            >
              Get Started Free
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-1 text-xl font-bold mb-4">
                  <span>SMgrowai</span>
                  <span className="text-lime">.</span>
                </div>
                <p className="text-muted-foreground text-sm">Your AI Chief Marketing Officer — research, create, post on autopilot.</p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li><Link href="#features" className="hover:text-text transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Integrations</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li><Link href="#" className="hover:text-text transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li><Link href="#" className="hover:text-text transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-text transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} SMgrowai Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
