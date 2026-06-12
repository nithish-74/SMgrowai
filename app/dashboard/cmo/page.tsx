"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck,
  Flame,
  Instagram,
  MessageSquareText,
  Plus,
  Quote,
  RefreshCw,
  Settings,
  SkipForward,
  Sparkles,
  Twitter,
  X,
  Zap,
} from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// CSS variables
const colors = {
  bg: "#05050a",
  bg2: "#0c0c14",
  bg3: "#12121e",
  surface: "#16161f",
  surface2: "#1e1e2e",
  border: "rgba(255,255,255,.07)",
  border2: "rgba(255,255,255,.12)",
  lime: "#b8ff57",
  limeDim: "#96d943",
  violet: "#8b5cf6",
  violetLight: "#a78bfa",
  pink: "#f472b6",
  cyan: "#22d3ee",
  text: "#f0eeff",
  text2: "#a09ab8",
  text3: "#5c5878",
};

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "instagram") return <Instagram className="h-4 w-4" style={{ color: colors.pink }} />;
  if (platform === "twitter") return <Twitter className="h-4 w-4" style={{ color: colors.cyan }} />;
  return <MessageSquareText className="h-4 w-4" style={{ color: colors.violetLight }} />;
}

export default function CMODashboardPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideText, setOverrideText] = useState("");
  const [newInstruction, setNewInstruction] = useState("");

  const weeklyPlanQuery = useQuery(trpc.cmo.getWeeklyPlan.queryOptions());
  const topScannedPostsQuery = useQuery(trpc.cmo.getTopScannedPosts.queryOptions());
  const instructionsQuery = useQuery(trpc.brands.getInstructions.queryOptions());
  const competitorPostsQuery = useQuery(trpc.cmo.getCompetitorPosts.queryOptions());
  const competitorAnalysisQuery = useQuery(trpc.cmo.getCompetitorAnalysis.queryOptions());

  const regenerateMutation = useMutation(
    trpc.cmo.regenerateWeeklyStrategy.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.cmo.getWeeklyPlan.queryKey() });
      },
    })
  );

  const updatePostStatusMutation = useMutation(
    trpc.cmo.updatePlannedPostStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.cmo.getWeeklyPlan.queryKey() });
      },
    })
  );

  const addInstructionMutation = useMutation(
    trpc.brands.addInstruction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.brands.getInstructions.queryKey() });
        setNewInstruction("");
      },
    })
  );

  const removeInstructionMutation = useMutation(
    trpc.brands.removeInstruction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.brands.getInstructions.queryKey() });
      },
    })
  );

  const handleAddInstruction = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (newInstruction.trim()) {
      addInstructionMutation.mutate({ instruction: newInstruction });
    }
  };

  const handleOverrideSubmit = async () => {
    if (!overrideText.trim()) return;
    await addInstructionMutation.mutateAsync({ instruction: overrideText });
    setOverrideText("");
    setShowOverrideDialog(false);
    await regenerateMutation.mutateAsync();
  };

  const weeklyPlan = weeklyPlanQuery.data as any;
  const activeInstructions = (instructionsQuery.data || []) as any[];
  const plannedPosts = (weeklyPlan?.plannedPosts || []) as any[];
  const topSignals = (topScannedPostsQuery.data || []) as any[];
  const competitorPosts = (competitorPostsQuery.data || []) as any[];

  const postsByDay = plannedPosts.reduce((acc: Record<string, any[]>, post: any) => {
    const day = post.scheduledDay.toLowerCase();
    if (!acc[day]) acc[day] = [];
    acc[day].push(post);
    return acc;
  }, {});

  if (weeklyPlanQuery.isError) {
    return (
      <div style={{ background: colors.bg, color: colors.text, minHeight: "100vh" }}>
        <style>{`
          @keyframes fade-up { from { opacity:0; transform: translateY(24px);} to {opacity:1; transform: translateY(0);} }
        `}</style>
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center px-4 py-8">
          <div className="w-full p-10 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}`, boxShadow: "0 40px 120px rgba(0,0,0,.8)" }}>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${colors.violet}, ${colors.pink})` }}>
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ letterSpacing: "-0.02em" }}>Set up your brand first</h1>
            <p className="text-sm leading-6 mb-8" style={{ color: colors.text2 }}>
              Your weekly strategy needs audience, voice, goals, and competitor context before it can generate useful plans.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5"
              style={{ background: colors.lime, color: "#0a0a0a" }}
            >
              Start onboarding <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, color: colors.text, minHeight: "100vh" }}>
      <style>{`
        @keyframes fade-up { from { opacity:0; transform: translateY(24px);} to {opacity:1; transform: translateY(0);} }
        @keyframes orb-float { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px,20px) scale(1.05); } }
      `}</style>

      {/* Background orbs */}
      <div className="gradient-orb fixed" style={{
        width: "600px", height: "600px",
        background: `rgba(139,92,246,.18)`,
        top: "-100px", left: "-150px",
        animation: "orb-float 8s ease-in-out infinite alternate",
        borderRadius: "50%", filter: "blur(100px)", zIndex: 0
      }}></div>
      <div className="gradient-orb fixed" style={{
        width: "400px", height: "400px",
        background: `rgba(184,255,87,.1)`,
        top: "200px", right: "-100px",
        animation: "orb-float 8s ease-in-out infinite alternate",
        animationDelay: "-4s",
        borderRadius: "50%", filter: "blur(100px)", zIndex: 0
      }}></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: colors.lime }}>AI CMO WORKSPACE</p>
            <h1 className="text-3xl font-bold" style={{ letterSpacing: "-0.03em" }}>Strategy command center</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowOverrideDialog(!showOverrideDialog)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:-translate-y-0.5"
              style={{ background: colors.surface2, border: `1px solid ${colors.border2}`, color: colors.text }}
            >
              <Settings className="h-4 w-4" />
              Override
            </button>

            <button
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all hover:-translate-y-0.5"
              style={{ background: colors.lime, color: "#0a0a0a" }}
            >
              <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Metrics section */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            ["Planned posts", plannedPosts.length, CalendarCheck, "This week", colors.lime],
            ["Instructions", activeInstructions.length, MessageSquareText, "Active", colors.violetLight],
            ["Market signals", topSignals.length, Flame, "Last 7 days", colors.cyan],
            ["Competitors", competitorPosts.length, Zap, "Watched", colors.pink],
          ].map(([label, value, Icon, meta, accentColor]) => {
            const MetricIcon = Icon as typeof CalendarCheck;
            return (
              <div key={label as string} className="p-5 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}` }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono uppercase tracking-widest" style={{ color: colors.text3 }}>{label as string}</p>
                  <MetricIcon className="h-4 w-4" style={{ color: accentColor as string }} />
                </div>
                <p className="text-4xl font-bold mb-1" style={{ letterSpacing: "-0.02em" }}>{String(value)}</p>
                <p className="text-xs" style={{ color: colors.text3 }}>{meta as string}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
          <div className="space-y-5">
            {/* Weekly strategy card */}
            <div className="p-6 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${colors.violet}, ${colors.pink})` }}>
                  <Quote className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">This week&apos;s strategy</h2>
                  <p className="text-xs mt-1" style={{ color: colors.text3 }}>
                    The operating thesis behind the current plan
                  </p>
                </div>
              </div>
              <div className="p-5 rounded-xl border-l-2" style={{ background: `rgba(184,255,87,.08)`, borderColor: colors.lime }}>
                <p className="text-sm leading-7" style={{ color: colors.text }}>
                  {weeklyPlan?.summary ||
                    (weeklyPlanQuery.isLoading
                      ? "Generating your weekly strategy..."
                      : "No weekly strategy has been generated yet.")}
                </p>
              </div>
            </div>

            {/* Weekly plan */}
            <div className="p-6 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}` }}>
              <h2 className="text-lg font-semibold mb-5">Weekly plan</h2>
              <div className="grid gap-3 lg:grid-cols-7">
                {DAYS.map((day) => {
                  const dayKey = day.toLowerCase();
                  const dayPosts = postsByDay[dayKey] || [];
                  return (
                    <div key={day} className="p-4 rounded-xl" style={{ background: colors.bg3, border: `1px solid ${colors.border}` }}>
                      <div className="mb-3 flex items-center justify-between lg:block">
                        <p className="text-sm font-bold" style={{ color: colors.text }}>{day.slice(0, 3)}</p>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-mono mt-1" style={{ background: colors.surface2, border: `1px solid ${colors.border2}`, color: colors.lime }}>
                          {dayPosts.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {dayPosts.length === 0 && (
                          <p className="text-xs" style={{ color: colors.text3 }}>No post planned</p>
                        )}
                        {dayPosts.map((post: any) => {
                          const expanded = expandedPostId === post.id;
                          return (
                            <div
                              key={post.id}
                              className="p-3 rounded-xl cursor-pointer transition-all"
                              style={{ background: colors.surface2, border: `1px solid ${colors.border2}` }}
                              onClick={() => setExpandedPostId(expanded ? null : post.id)}
                            >
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5">
                                  <PlatformIcon platform={post.platform} />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>{post.topic}</p>
                                  <p className="text-xs capitalize mt-1" style={{ color: colors.text3 }}>{post.contentType}</p>
                                </div>
                              </div>
                              {expanded && (
                                <div className="mt-4 space-y-3">
                                  <p className="text-xs leading-5" style={{ color: colors.text2 }}>{post.angle}</p>
                                  <p className="text-xs leading-5 border-l-2 pl-3 italic" style={{ color: colors.text3, borderColor: colors.violetLight }}>
                                    {post.reasoning}
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updatePostStatusMutation.mutate({ id: post.id, status: "generating" });
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                      style={{ background: colors.lime, color: "#0a0a0a" }}
                                    >
                                      <Zap className="h-3.5 w-3.5" />
                                      Generate
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updatePostStatusMutation.mutate({ id: post.id, status: "skipped" });
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                      style={{ background: colors.surface, border: `1px solid ${colors.border2}`, color: colors.text2 }}
                                    >
                                      <SkipForward className="h-3.5 w-3.5" />
                                      Skip
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            {/* Standing instructions */}
            <div className="p-6 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}` }}>
              <h2 className="text-lg font-semibold mb-4">Standing instructions</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {activeInstructions.map((instruction) => (
                  <span key={instruction.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: colors.bg3, border: `1px solid ${colors.border2}` }}>
                    <span className="max-w-[15rem] truncate">{instruction.instruction}</span>
                    <button
                      type="button"
                      onClick={() => removeInstructionMutation.mutate({ id: instruction.id })}
                      className="p-0.5 rounded-md transition-all hover:bg-red-500/20"
                    >
                      <X className="h-3 w-3" style={{ color: colors.text3 }} />
                    </button>
                  </span>
                ))}
                {activeInstructions.length === 0 && (
                  <p className="text-sm" style={{ color: colors.text3 }}>No standing instructions yet.</p>
                )}
              </div>
              <form onSubmit={handleAddInstruction} className="flex gap-2">
                <input
                  value={newInstruction}
                  onChange={(event) => setNewInstruction(event.target.value)}
                  placeholder="Add instruction"
                  className="flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none transition-all"
                  style={{ background: colors.bg3, border: `1px solid ${colors.border2}`, color: colors.text }}
                />
                <button
                  type="submit"
                  disabled={!newInstruction.trim()}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: colors.lime, color: "#0a0a0a" }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Market signals */}
            <div className="p-6 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}` }}>
              <h2 className="text-lg font-semibold mb-4">Market signals</h2>
              {topSignals.length === 0 && (
                <p className="text-sm" style={{ color: colors.text3 }}>No scanned posts yet.</p>
              )}
              {topSignals.map((post: any) => (
                <div key={post.id} className="border-b py-3 last:border-b-0" style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: colors.text2 }}>
                      <PlatformIcon platform={post.provider} />
                      <span className="capitalize">{post.provider}</span>
                    </div>
                    <span className="px-2 py-1 rounded-lg text-xs font-mono" style={{ background: colors.bg3, border: `1px solid ${colors.border2}`, color: colors.lime }}>
                      {(post.engagementRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6" style={{ color: colors.text2 }}>
                    {post.caption || "No caption"}
                  </p>
                </div>
              ))}
            </div>

            {/* Competitor pulse */}
            <div className="p-6 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}` }}>
              <h2 className="text-lg font-semibold mb-4">Competitor pulse</h2>
              {competitorPosts.length === 0 && (
                <p className="text-sm" style={{ color: colors.text3 }}>No competitor posts yet.</p>
              )}
              {competitorPosts.map((post: any) => (
                <div key={post.id} className="border-b py-3 last:border-b-0" style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 text-sm font-medium" style={{ color: colors.text }}>
                      <p className="truncate">{post.competitorDomain}</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg text-xs font-mono" style={{ background: colors.bg3, border: `1px solid ${colors.border2}`, color: colors.cyan }}>
                      {(post.engagementRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6" style={{ color: colors.text2 }}>
                    {post.caption || "No caption"}
                  </p>
                </div>
              ))}
              {competitorAnalysisQuery.data && (
                <div className="p-4 rounded-xl mt-3" style={{ background: `rgba(167,139,250,.1)`, border: `1px solid rgba(139,92,246,.3)` }}>
                  <p className="text-sm leading-6" style={{ color: colors.violetLight }}>
                    {competitorAnalysisQuery.data}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* Override dialog */}
        {showOverrideDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.8)", backdropFilter: "blur(12px)" }} onClick={() => setShowOverrideDialog(false)}>
            <div className="w-full max-w-lg p-8 rounded-2xl" style={{ background: colors.surface, border: `1px solid ${colors.border2}` }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ letterSpacing: "-0.02em" }}>Give your CMO a new directive</h3>
                <button onClick={() => setShowOverrideDialog(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.text3 }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={overrideText}
                onChange={(event) => setOverrideText(event.target.value)}
                placeholder="Focus on the summer sale and avoid product education this week."
                rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none mb-6"
                style={{ background: colors.bg3, border: `1px solid ${colors.border2}`, color: colors.text }}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowOverrideDialog(false);
                    setOverrideText("");
                  }}
                  className="px-5 py-2.5 rounded-xl font-medium transition-all"
                  style={{ background: colors.surface2, border: `1px solid ${colors.border2}`, color: colors.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverrideSubmit}
                  disabled={!overrideText.trim() || addInstructionMutation.isPending || regenerateMutation.isPending}
                  className="px-6 py-2.5 rounded-xl font-bold transition-all"
                  style={{ background: colors.lime, color: "#0a0a0a" }}
                >
                  Save and regenerate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
