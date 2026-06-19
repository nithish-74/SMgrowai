"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Bot, Zap, BarChart3, Instagram, Twitter } from "lucide-react";
import { Button } from "./ui/button";
import { HeroOrbs } from "./aceternity/HeroOrbs";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <HeroOrbs />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-7xl mx-auto px-6"
      >
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border bg-primary/10 border-primary/20 mx-auto backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              Your AI CMO · Now Live
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
          >
            Your Brand Deserves a{" "}
            <span className="bg-gradient-to-r from-lime via-cyan to-violet bg-clip-text text-transparent">
              CMO
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            SMgrowai is your AI Chief Marketing Officer. It researches, creates, and posts to Instagram & Twitter on autopilot — so you can focus on building, not marketing.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link href="/onboarding">
              <Button size="lg" className="bg-lime text-bg hover:bg-lime-dim hover:shadow-[0_0_40px_rgba(184,255,87,0.3)] text-lg px-8 py-6">
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 border border-border">
              See How It Works
            </Button>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-12"
          >
            {[
              { icon: Bot, title: "Auto Research", desc: "Analyzes your brand & competitors" },
              { icon: Zap, title: "Smart Creation", desc: "Generates posts tailored to your voice" },
              { icon: BarChart3, title: "Auto Post", desc: "Schedules & publishes automatically" }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/30 hover:shadow-[0_0_30px_rgba(184,255,87,0.1)] transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="pt-12 space-y-6"
          >
            <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
              <Instagram className="w-6 h-6" />
              <Twitter className="w-6 h-6" />
              <span>Trusted by 2,400+ founders</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
