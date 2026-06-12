"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Cpu, CreditCard, Settings, Sparkles } from "lucide-react";

const navItems = [
  { href: "/dashboard/cmo", label: "Strategy", icon: Cpu },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/pricing", label: "Billing", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const currentPlan = "free";

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white px-4 py-5 lg:block">
        <div className="flex h-full flex-col">
          <Link href="/dashboard/cmo" className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-950 text-sm font-bold text-white">
              YC
            </span>
            <span className="font-semibold">Your CMO</span>
          </Link>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Weekly engine
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-600">
              Strategy, competitor signals, and approvals stay synced across desktop and mobile.
            </p>
          </div>

          <div className="mt-auto border-t border-neutral-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-neutral-500">Plan</span>
              <Badge variant={currentPlan === "free" ? "outline" : "default"}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            </div>
            <Button asChild className="w-full" size="sm">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/cmo" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-950 text-xs font-bold text-white">
              YC
            </span>
            <span className="font-semibold">Your CMO</span>
          </Link>
          <Badge variant="outline">
            <BarChart3 className="mr-1 h-3.5 w-3.5" />
            Live
          </Badge>
        </div>
      </header>

      <main className="pb-20 lg:ml-64 lg:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-neutral-200 bg-white px-2 py-2 lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-md py-2 text-xs font-medium ${
                active ? "bg-neutral-950 text-white" : "text-neutral-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
