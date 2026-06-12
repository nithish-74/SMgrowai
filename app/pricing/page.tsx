"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Minus, Sparkles } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PLANS, type PlanKey } from "@/lib/plans";

const planFeatures: Record<PlanKey, { feature: string; included: boolean }[]> = {
  free: [
    { feature: "5 AI-generated posts/month", included: true },
    { feature: "1 social platform", included: true },
    { feature: "Manual approval workflow", included: true },
    { feature: "Daily CMO briefing", included: false },
    { feature: "Competitor analysis", included: false },
  ],
  starter: [
    { feature: "30 AI-generated posts/month", included: true },
    { feature: "2 social platforms", included: true },
    { feature: "Daily CMO briefing", included: true },
    { feature: "2 competitor brands", included: true },
    { feature: "Priority support", included: false },
  ],
  pro: [
    { feature: "Unlimited generated drafts", included: true },
    { feature: "2 social platforms", included: true },
    { feature: "Daily CMO briefing", included: true },
    { feature: "5 competitor brands", included: true },
    { feature: "Priority support", included: true },
  ],
};

export default function PricingPage() {
  const trpc = useTRPC();
  const createCheckoutSessionMutation = useMutation(
    trpc.billing.createCheckoutSession.mutationOptions({
      onSuccess: (data) => {
        if (data?.url) window.location.href = data.url;
      },
      onError: () => {
        window.location.href = "/login";
      },
    })
  );

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-6 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between">
          <Button asChild variant="ghost" className="px-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </header>

        <section className="mx-auto max-w-3xl py-12 text-center">
          <Badge className="mb-4 bg-white text-neutral-800 shadow-none">
            <Sparkles className="h-3.5 w-3.5" />
            Plans for lean marketing teams
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Start small, then let the content engine pick up speed.
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600">
            Every plan keeps you in control with approvals. Paid plans add more output, competitor intelligence, and briefings.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {(["free", "starter", "pro"] as PlanKey[]).map((planKey) => {
            const plan = PLANS[planKey];
            const isPrimary = planKey === "starter";
            return (
              <Card
                key={planKey}
                className={`relative bg-white ${
                  isPrimary ? "border-neutral-950 shadow-md" : "border-neutral-200"
                }`}
              >
                {isPrimary && (
                  <div className="absolute right-4 top-4">
                    <Badge>Recommended</Badge>
                  </div>
                )}
                <CardContent className="flex h-full flex-col p-6">
                  <div>
                    <h2 className="text-xl font-semibold">{plan.name}</h2>
                    <p className="mt-4 text-4xl font-semibold">
                      ${plan.price / 100}
                      {plan.price > 0 && (
                        <span className="text-sm font-normal text-neutral-500">/month</span>
                      )}
                    </p>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {planFeatures[planKey].map((item) => (
                      <li
                        key={item.feature}
                        className={`flex gap-2 text-sm ${
                          item.included ? "text-neutral-800" : "text-neutral-400"
                        }`}
                      >
                        {item.included ? (
                          <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                        ) : (
                          <Minus className="mt-0.5 h-4 w-4" />
                        )}
                        {item.feature}
                      </li>
                    ))}
                  </ul>

                  {planKey === "free" ? (
                    <Button asChild variant="outline" className="mt-8 bg-white">
                      <Link href="/login">Start free</Link>
                    </Button>
                  ) : (
                    <Button
                      className="mt-8"
                      variant={isPrimary ? "default" : "outline"}
                      onClick={() => createCheckoutSessionMutation.mutate({ plan: planKey })}
                      disabled={createCheckoutSessionMutation.isPending}
                    >
                      {createCheckoutSessionMutation.isPending ? "Opening checkout" : "Upgrade"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
