"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Bot, Zap, BarChart3, Instagram, Twitter } from "lucide-react";
import { Button } from "./ui/button";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_rgba(184,255,87,0.1)_0%,_transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border bg-primary/10 border-primary/20 mx-auto">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              Your AI CMO · Now Live
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            Your Brand Deserves a{" "}
            <span className="bg-gradient-to-r from-lime via-cyan to-violet bg-clip-text text-transparent">
              CMO
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            SMgrowai is your AI Chief Marketing Officer. It researches, creates, and posts to Instagram & Twitter on autopilot — so you can focus on building, not marketing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="bg-lime text-bg hover:bg-lime-dim hover:shadow-[0_0_40px_rgba(184,255,87,0.3)] text-lg px-8 py-6">
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 border border-border">
              See How It Works
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-12">
            {[
              { icon: Bot, title: "Auto Research", desc: "Analyzes your brand & competitors" },
              { icon: Zap, title: "Smart Creation", desc: "Generates posts tailored to your voice" },
              { icon: BarChart3, title: "Auto Post", desc: "Schedules & publishes automatically" }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all duration-300">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="pt-12 space-y-6">
            <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
              <Instagram className="w-6 h-6" />
              <Twitter className="w-6 h-6" />
              <span>Trusted by 2,400+ founders</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
