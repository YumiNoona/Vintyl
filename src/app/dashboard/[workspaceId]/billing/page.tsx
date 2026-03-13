import React from "react";
import { onAuthenticatedUser } from "@/actions/user";
import { redirect } from "next/navigation";
import { CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BillingPage() {
  const auth = await onAuthenticatedUser();
  if (!auth.user) return redirect("/auth/sign-in");

  const plan = auth.user.subscription?.plan || "FREE";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Free Plan */}
        <div
          className={`p-6 rounded-xl border-2 transition-colors ${
            plan === "FREE"
              ? "border-purple-500 bg-purple-500/5"
              : "border-neutral-700 bg-neutral-800/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-neutral-400" size={20} />
            <h3 className="text-lg font-semibold">Free</h3>
            {plan === "FREE" && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full ml-auto">
                Current
              </span>
            )}
          </div>
          <p className="text-3xl font-bold mb-2">$0</p>
          <p className="text-neutral-400 text-sm mb-4">per month</p>
          <ul className="text-sm text-neutral-400 space-y-2">
            <li>✓ 1 Workspace</li>
            <li>✓ Up to 25 videos</li>
            <li>✓ Basic features</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div
          className={`p-6 rounded-xl border-2 transition-colors ${
            plan === "PRO"
              ? "border-purple-500 bg-purple-500/5"
              : "border-neutral-700 bg-neutral-800/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-yellow-500" size={20} />
            <h3 className="text-lg font-semibold">Pro</h3>
            {plan === "PRO" && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full ml-auto">
                Current
              </span>
            )}
          </div>
          <p className="text-3xl font-bold mb-2">$99</p>
          <p className="text-neutral-400 text-sm mb-4">per month</p>
          <ul className="text-sm text-neutral-400 space-y-2 mb-6">
            <li>✓ Unlimited Workspaces</li>
            <li>✓ Unlimited videos</li>
            <li>✓ AI features (transcription, summaries)</li>
            <li>✓ Invite team members</li>
          </ul>
          {plan === "FREE" && (
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Zap size={16} className="mr-2" />
              Upgrade to Pro
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
