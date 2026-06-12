"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function isAdmin() {
  const session = await auth();
  if (!session?.user.email) return false;
  return session.user.email === process.env.ADMIN_EMAIL;
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const authorized = await isAdmin();
      if (!authorized) {
        redirect("/");
      }
      setIsAuthorized(true);
    }
    checkAuth();
  }, []);

  if (!isAuthorized) return null;

  return <AdminClient />;
}

function AdminClient() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Note: In a real app, we'd have an admin tRPC router!
      // Since we don't, let's use a client-side fetch for demo purposes
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const regenerateStrategyMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/regenerate-strategy?userId=${userId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to regenerate strategy");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Plan</th>
                    <th className="py-2 px-4">Posts Published</th>
                    <th className="py-2 px-4">Last Active</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user: any) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.plan}</td>
                      <td className="py-3 px-4">{user.postsPublished}</td>
                      <td className="py-3 px-4">{user.lastActive}</td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => regenerateStrategyMutation.mutate(user.id)}
                          disabled={regenerateStrategyMutation.isPending}
                        >
                          Regenerate Strategy
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
