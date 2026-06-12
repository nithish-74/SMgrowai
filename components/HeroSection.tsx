"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background orbs */}
      <div
        className="gradient-orb absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,.2) 0%, transparent 70%)",
          animation: "orb-float 8s ease-in-out infinite alternate",
          filter: "blur(80px)",
        }}
      />
      <div
        className="gradient-orb absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(184,255,87,.2) 0%, transparent 70%)",
          animation: "orb-float 8s ease-in-out infinite alternate",
          animationDelay: "-4s",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left side */}
        <div className="space-y-8">
          <div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border"
            style={{
              background: "rgba(184,255,87,0.1)",
              borderColor: "rgba(184,255,87,0.25)",
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
            <span className="text-lime text-sm font-medium font-mono">
              AI CMO · Now live
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight font-display">
            Your brand needs a{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #b8ff57, #22d3ee, #8b5cf6)",
              }}
            >
              CMO.
            </span>{" "}
            Not a budget.
          </h1>

          <p className="text-xl text-text2">
            SMgrowai is your AI Chief Marketing Officer. It researches, creates, and posts content to Instagram and Twitter — so you can focus on building, not marketing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-lg bg-lime text-bg hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Start free today
              <span>→</span>
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-medium border transition-all duration-300 hover:bg-surface hover:border-white/20"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              ▶ See how it works
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-bg flex items-center justify-center text-xs font-bold"
                  style={{ background: `hsl(${(i * 60) % 360}, 70%, 45%)` }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-text2">
              <span className="font-bold text-text">2,400+</span> founders already have an AI CMO
            </p>
          </div>
        </div>

        {/* Right side - Dashboard card */}
        <div className="relative">
          <div className="p-6 rounded-2xl border bg-surface shadow-2xl" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {/* Window header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <p className="text-text3 text-sm">SMgrowai — AI CMO Dashboard</p>
              <div className="w-20" />
            </div>

            {/* CMO Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #f472b6)" }}
              >
                CMO
              </div>
              <div>
                <p className="font-bold">Your AI CMO</p>
                <p className="text-text3 text-sm">Analyzing the market…</p>
              </div>
            </div>

            {/* Message bubble */}
            <div className="mb-6 p-4 rounded-xl bg-surface2 border border-white/5">
              <p className="text-sm">
                This week: <span className="text-lime font-bold">23 new posts</span> planned, <span className="text-lime font-bold">8 competitor gaps</span> identified.
              </p>
            </div>

            {/* 7-day plan */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <div key={day} className="p-3 rounded-lg bg-bg3 border border-white/5 text-center">
                  <p className="text-xs text-text3 mb-2">{day}</p>
                  {i < 5 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold" style={{ background: "#f472b6" }}>
                      IG
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold" style={{ background: "#22d3ee" }}>
                      TW
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-bg3 border border-white/5 text-center">
                <p className="text-2xl font-bold text-lime">17</p>
                <p className="text-xs text-text3">Posts Ready</p>
              </div>
              <div className="p-4 rounded-xl bg-bg3 border border-white/5 text-center">
                <p className="text-2xl font-bold text-cyan">8.2%</p>
                <p className="text-xs text-text3">Avg ER%</p>
              </div>
              <div className="p-4 rounded-xl bg-bg3 border border-white/5 text-center">
                <p className="text-2xl font-bold text-violet-light">+41%</p>
                <p className="text-xs text-text3">Uplift</p>
              </div>
            </div>

            {/* Typing indicator */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-text3 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: "0.15s" }} />
                <div className="w-2 h-2 rounded-full bg-text3 animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
              <p className="text-text3 text-sm">CMO is analysing competitor posts…</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}