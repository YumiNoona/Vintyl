"use client";

import React from "react";
import { CreditCard, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/actions/payment";
import { useQueryData } from "@/hooks/useQueryData";
import { getSubscription } from "@/actions/payment";
import { toast } from "sonner";

export default function BillingPage() {
  const { data: subData, isFetched } = useQueryData(
    ["user-subscription"],
    getSubscription
  );
  const [loading, setLoading] = React.useState(false);

  const plan = (subData as any)?.data?.plan || "FREE";

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const result = await createCheckoutSession();
      if (result.status === 200 && result.data) {
        window.location.href = result.data;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-black text-foreground mb-6 tracking-tighter uppercase italic">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
          Scale your communication with AI-powered video messages. Seamless collaboration with no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1500px] mx-auto items-stretch pb-32">
        {/* Starter Plan */}
        <div className="p-10 rounded-[3rem] border-2 border-border bg-card/30 backdrop-blur-sm flex flex-col h-full hover:border-foreground/20 transition-all duration-500 group">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tighter">Starter</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">Perfect for individuals just getting started.</p>
          </div>
          <div className="mb-10 flex items-baseline gap-1">
            <span className="text-5xl font-black text-foreground tracking-tighter">$0</span>
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mo</span>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            {["1 Workspace", "Up to 25 videos", "Standard quality", "Community support"].map((feature) => (
              <li key={feature} className="flex items-center gap-4 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                <div className="w-2 h-2 rounded-full bg-border group-hover:bg-foreground transition-colors" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-border bg-transparent hover:bg-secondary text-foreground font-black uppercase tracking-widest text-xs transition-all active:scale-95">
            Current Plan
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="p-10 rounded-[3rem] border-4 border-purple-600 dark:border-purple-500 bg-gradient-to-b from-purple-500/10 to-transparent shadow-[0_20px_80px_rgba(168,85,247,0.15)] scale-105 flex flex-col h-full relative z-10 hover:shadow-[0_20px_100px_rgba(168,85,247,0.25)] transition-all duration-500">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-full shadow-2xl uppercase tracking-[0.2em] whitespace-nowrap ring-4 ring-background">
            Most Popular
          </div>
          <div className="mb-10">
            <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tighter">Pro</h3>
            <p className="text-foreground/80 dark:text-purple-100 text-sm font-bold leading-relaxed">For power users and solo professionals.</p>
          </div>
          <div className="mb-10 flex items-baseline gap-1">
            <span className="text-5xl font-black text-foreground tracking-tighter text-purple-600 dark:text-purple-400">$29</span>
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mo</span>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            {["Unlimited videos", "AI summaries", "Transcript search", "4K quality support"].map((feature) => (
              <li key={feature} className="flex items-center gap-4 text-sm font-black text-foreground">
                <div className="bg-purple-600/20 p-1 rounded-lg">
                  <Zap className="text-purple-600 dark:text-purple-400 size-4 shrink-0 fill-current" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          <Button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Upgrade to Pro"}
          </Button>
        </div>

        {/* Team Plan */}
        <div className="p-10 rounded-[3rem] border-2 border-border bg-card/30 backdrop-blur-sm flex flex-col h-full hover:border-foreground/20 transition-all duration-500 group">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tighter">Team</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">Collaborate across your whole department.</p>
          </div>
          <div className="mb-10 flex items-baseline gap-1">
            <span className="text-5xl font-black text-foreground tracking-tighter">$99</span>
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mo</span>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            {["Up to 10 members", "Shared library", "Branded player", "Priority support"].map((feature) => (
              <li key={feature} className="flex items-center gap-4 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                <div className="w-2 h-2 rounded-full bg-border group-hover:bg-foreground transition-colors" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-border bg-transparent hover:bg-secondary text-foreground font-black uppercase tracking-widest text-xs transition-all active:scale-95">
            Get Started
          </Button>
        </div>

        {/* Enterprise Plan */}
        <div className="p-10 rounded-[3rem] border-2 border-border bg-card/30 backdrop-blur-sm flex flex-col h-full hover:border-foreground/20 transition-all duration-500 group">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tighter">Enterprise</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">Advanced security and support for large orgs.</p>
          </div>
          <div className="mb-10">
            <span className="text-4xl font-black text-foreground uppercase tracking-tighter">Custom</span>
          </div>
          <ul className="space-y-5 mb-12 flex-1">
            {["Unlimited members", "SSO & SAML", "Dedicated manager", "Custom contracts"].map((feature) => (
              <li key={feature} className="flex items-center gap-4 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                <div className="w-2 h-2 rounded-full bg-border group-hover:bg-foreground transition-colors" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-border bg-transparent hover:bg-secondary text-foreground font-black uppercase tracking-widest text-xs transition-all active:scale-95">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
