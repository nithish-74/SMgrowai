import { type Plan as PrismaPlan } from "@prisma/client";

export type PlanKey = "free" | "starter" | "pro";

export interface PlanLimits {
  postsPerMonth: number;
  competitors: number;
  digest: boolean;
  platforms: number;
  price: number; // in cents
  name: string;
}

export const PLANS: Record<PlanKey, PlanLimits> = {
  free: {
    postsPerMonth: 5,
    competitors: 0,
    digest: false,
    platforms: 1,
    price: 0,
    name: "Free",
  },
  starter: {
    postsPerMonth: 30,
    competitors: 2,
    digest: true,
    platforms: 2,
    price: 1900,
    name: "Starter",
  },
  pro: {
    postsPerMonth: 999,
    competitors: 5,
    digest: true,
    platforms: 2,
    price: 4900,
    name: "Pro",
  },
};

export function getPlanLimits(plan: PrismaPlan): PlanLimits {
  return PLANS[plan as PlanKey];
}
