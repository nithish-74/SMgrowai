"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardClient() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.user.me.queryOptions());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your profile</CardTitle>
        <CardDescription>Client-side tRPC + React Query</CardDescription>
      </CardHeader>
      <CardContent className="font-mono text-sm">
        {isLoading ? "Loading…" : JSON.stringify(data, null, 2)}
      </CardContent>
    </Card>
  );
}
