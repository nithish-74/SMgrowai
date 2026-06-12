"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Instagram, Mail, Settings2, Shield, Twitter } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "instagram") return <Instagram className="h-4 w-4" />;
  if (provider === "twitter") return <Twitter className="h-4 w-4" />;
  return <Shield className="h-4 w-4" />;
}

export default function SettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery(trpc.settings.getSettings.queryOptions());
  const connectedAccountsQuery = useQuery(trpc.settings.getConnectedAccounts.queryOptions());

  const setAutoPostMutation = useMutation(
    trpc.settings.setAutoPost.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.settings.getSettings.queryKey() });
      },
    })
  );

  const setDigestEnabledMutation = useMutation(
    trpc.settings.setDigestEnabled.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.settings.getSettings.queryKey() });
      },
    })
  );

  const settings = settingsQuery.data;
  const accounts = connectedAccountsQuery.data || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-neutral-500">Workspace controls</p>
        <h1 className="mt-1 text-3xl font-semibold">Settings</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                icon: Settings2,
                title: "Auto-post scheduled content",
                copy: "Publish approved posts automatically when their scheduled time arrives.",
                enabled: Boolean(settings?.autoPost),
                pending: setAutoPostMutation.isPending,
                action: () => setAutoPostMutation.mutate({ enabled: !settings?.autoPost }),
              },
              {
                icon: Mail,
                title: "Daily CMO briefing",
                copy: "Receive a morning digest with strategy notes, watched signals, and next actions.",
                enabled: Boolean(settings?.digestEnabled),
                pending: setDigestEnabledMutation.isPending,
                action: () =>
                  setDigestEnabledMutation.mutate({
                    enabled: !settings?.digestEnabled,
                  }),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                      <Icon className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{item.copy}</p>
                    </div>
                  </div>
                  <Button
                    variant={item.enabled ? "default" : "outline"}
                    onClick={item.action}
                    disabled={item.pending || settingsQuery.isLoading}
                    className="sm:w-28"
                  >
                    {item.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Connected accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {accounts.length === 0 && (
                <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
                  No social accounts connected yet.
                </div>
              )}
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                      <ProviderIcon provider={account.provider} />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{account.provider}</p>
                      <p className="text-xs text-neutral-500">
                        Connected {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700" variant="outline">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Active
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 text-white">
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                <Bell className="h-4 w-4" />
              </div>
              <h2 className="font-semibold">Publishing stays approval-first</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Auto-post only affects posts you have approved or scheduled. Drafts remain in review until you move them forward.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
