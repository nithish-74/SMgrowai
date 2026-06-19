"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Check, Instagram, Twitter, ArrowRight } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// CSS variables for dark theme
const colors = {
  bg: "#05050a",
  surface: "#16161f",
  border2: "rgba(255,255,255,0.12)",
  lime: "#b8ff57",
  limeDim: "#96d943",
  text: "#f0eeff",
  text2: "#a09ab8",
  text3: "#5c5878",
};

const ALL_GOALS = [
  "Grow followers",
  "Drive sales",
  "Build authority",
  "Launch a product",
  "Grow email list",
  "Build community",
];

type OnboardingData = {
  brandName: string;
  targetAudience: string;
  brandVoice: string;
  goals: string[];
  avoidTopics: string;
  instagramConnected: boolean;
  twitterConnected: boolean;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const trpc = useTRPC();
  const { data: session } = useSession();

  const [data, setData] = useState<OnboardingData>({
    brandName: "",
    targetAudience: "",
    brandVoice: "",
    goals: [],
    avoidTopics: "",
    instagramConnected: false,
    twitterConnected: false,
  });

  const createBrand = useMutation(trpc.brands.createBrand.mutationOptions());
  const completeOnboarding = useMutation(trpc.user.completeOnboarding.mutationOptions());
  const progress = step * 25;

  // Pre-fill brand name from Google
  useEffect(() => {
    if (session?.user?.name) {
      setData(prev => ({ ...prev, brandName: session.user.name || "" }));
    }
  }, [session]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // Create brand
      await createBrand.mutateAsync({
        name: data.brandName,
        targetAudience: data.targetAudience,
        brandVoice: data.brandVoice,
        goals: data.goals,
        avoidTopics: data.avoidTopics ? [data.avoidTopics] : [],
        contentPillars: [],
        competitors: [],
      });
      // Complete onboarding
      await completeOnboarding.mutateAsync();
      // Redirect to dashboard
      router.push("/dashboard/cmo");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const toggleGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  // Can continue check
  const canContinue =
    step === 1
      ? data.brandName.trim().length > 1
      : step === 2
        ? data.targetAudience.trim().length > 10 && data.brandVoice.trim().length > 10
        : step === 3
          ? data.goals.length > 0
          : true;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="w-full max-w-md">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-1 text-xl font-bold mb-6">
            <span>SMgrowai</span>
            <span style={{ color: colors.lime }}>.</span>
          </div>
          <Progress value={progress} className="h-2" style={{
            background: "#2a2a3a",
            "--tw-progress-fill": colors.lime
          } as React.CSSProperties & { [key: string]: string }} />
        </div>

        {/* Step Content with Animation */}
        <div className="p-8 rounded-2xl" style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border2}`
        }}>
          {/* Step 1: Welcome */}
          {step === 1 && (
            <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Welcome back.</h2>
                <p className="text-sm" style={{ color: colors.text2 }}>
                  Here&apos;s what we got from Google — look right?
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#1e1e2e" }}>
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{
                    background: "linear-gradient(135deg, #8b5cf6, #f472b6)"
                  }}>
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{session?.user?.name || "User"}</p>
                  <p className="text-xs" style={{ color: colors.text2 }}>{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="brandName" className="text-sm" style={{ color: colors.text2 }}>
                  What do you call your brand?
                </label>
                <Input
                  id="brandName"
                  value={data.brandName}
                  onChange={(e) => setData(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="Your brand name"
                  className="bg-[#12121e] border-[rgba(255,255,255,0.1)] focus-visible:ring-lime"
                />
              </div>

              <Button
                onClick={handleNext}
                disabled={!canContinue}
                className="w-full py-3 px-6 text-bg font-bold hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: colors.lime }}
              >
                That&apos;s me, let&apos;s go →
              </Button>
            </section>
          )}

          {/* Step 2: Audience & Voice */}
          {step === 2 && (
            <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your audience</h2>
              </div>

              <div className="space-y-2">
                <label htmlFor="targetAudience" className="text-sm" style={{ color: colors.text2 }}>
                  Who do you sell to?
                </label>
                <Textarea
                  id="targetAudience"
                  value={data.targetAudience}
                  onChange={(e) => setData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="Female founders aged 25-40 running product businesses"
                  rows={4}
                  className="bg-[#12121e] border-[rgba(255,255,255,0.1)] focus-visible:ring-lime"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="brandVoice" className="text-sm" style={{ color: colors.text2 }}>
                  What&apos;s your brand voice?
                </label>
                <Textarea
                  id="brandVoice"
                  value={data.brandVoice}
                  onChange={(e) => setData(prev => ({ ...prev, brandVoice: e.target.value }))}
                  placeholder="Direct, witty, never corporate, uses real language"
                  rows={4}
                  className="bg-[#12121e] border-[rgba(255,255,255,0.1)] focus-visible:ring-lime"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="secondary"
                  className="flex-1"
                  style={{ backgroundColor: "#1e1e2e", border: `1px solid ${colors.border2}`, color: colors.text }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="flex-1 py-3 px-6 text-bg font-bold hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: colors.lime }}
                >
                  Next →
                </Button>
              </div>
            </section>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your goals</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm" style={{ color: colors.text2 }}>
                  What do you want from social media?
                </label>
                <div className="flex flex-wrap gap-3">
                  {ALL_GOALS.map((goal) => {
                    const selected = data.goals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          selected
                            ? "border-[#b8ff57] bg-[rgba(184,255,87,0.1)] text-[#b8ff57]"
                            : "border-[rgba(255,255,255,0.1)] bg-[#12121e] text-[#f0eeff] hover:border-[rgba(255,255,255,0.2)]"
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="avoidTopics" className="text-sm" style={{ color: colors.text2 }}>
                  Anything you never want to post about? (optional)
                </label>
                <Input
                  id="avoidTopics"
                  value={data.avoidTopics}
                  onChange={(e) => setData(prev => ({ ...prev, avoidTopics: e.target.value }))}
                  placeholder="e.g., Politics, Religion"
                  className="bg-[#12121e] border-[rgba(255,255,255,0.1)] focus-visible:ring-lime"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="secondary"
                  className="flex-1"
                  style={{ backgroundColor: "#1e1e2e", border: `1px solid ${colors.border2}`, color: colors.text }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="flex-1 py-3 px-6 text-bg font-bold hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: colors.lime }}
                >
                  Almost done →
                </Button>
              </div>
            </section>
          )}

          {/* Step 4: Connect Platforms */}
          {step === 4 && (
            <section className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <h2 className="text-2xl font-bold mb-2">Connect your platforms</h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setData(prev => ({ ...prev, instagramConnected: !prev.instagramConnected }))}
                  className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all ${
                    data.instagramConnected
                      ? "border-lime bg-[rgba(184,255,87,0.1)]"
                      : "border-[rgba(255,255,255,0.1)] bg-[#12121e] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="h-6 w-6" style={{ color: "#f472b6" }} />
                    <span className="font-medium">Connect Instagram</span>
                  </div>
                  {data.instagramConnected && <Check className="h-5 w-5" style={{ color: colors.lime }} />}
                </button>

                <button
                  onClick={() => setData(prev => ({ ...prev, twitterConnected: !prev.twitterConnected }))}
                  className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all ${
                    data.twitterConnected
                      ? "border-lime bg-[rgba(184,255,87,0.1)]"
                      : "border-[rgba(255,255,255,0.1)] bg-[#12121e] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Twitter className="h-6 w-6" style={{ color: "#22d3ee" }} />
                    <span className="font-medium">Connect Twitter / X</span>
                  </div>
                  {data.twitterConnected && <Check className="h-5 w-5" style={{ color: colors.lime }} />}
                </button>
              </div>

              <button
                onClick={() => setData(prev => ({ ...prev, instagramConnected: false, twitterConnected: false }))}
                className="text-center w-full text-sm"
                style={{ color: colors.text2 }}
              >
                I&apos;ll connect later
              </button>

              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="secondary"
                  className="flex-1"
                  style={{ backgroundColor: "#1e1e2e", border: `1px solid ${colors.border2}`, color: colors.text }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createBrand.isPending || completeOnboarding.isPending}
                  className="flex-1 py-3 px-6 text-bg font-bold hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: colors.lime }}
                >
                  {createBrand.isPending || completeOnboarding.isPending ? "Saving..." : "Meet your AI CMO →"}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}
