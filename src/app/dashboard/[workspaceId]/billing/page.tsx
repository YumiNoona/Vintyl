"use client";

import React from "react";
import { CreditCard, Zap, Loader2, Check, Star, Shield, Users, Mail, Globe, Brain, Search, Monitor, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/actions/payment";
import { useQueryData } from "@/hooks/useQueryData";
import { getSubscription } from "@/actions/payment";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for individuals just getting started.",
    features: ["1 Workspace", "Up to 25 videos", "Standard quality", "Community support"],
    buttonText: "Current Plan",
    variant: "standard",
  },
  {
    name: "Pro",
    price: "$29",
    description: "For power users and solo professionals.",
    features: ["Unlimited videos", "AI summaries", "Transcript search", "4K quality support"],
    buttonText: "Upgrade to Pro",
    variant: "premium",
    popular: true,
  },
  {
    name: "Team",
    price: "$99",
    description: "Collaborate across your whole department.",
    features: ["Up to 10 members", "Shared library", "Branded player", "Priority support"],
    buttonText: "Get Started",
    variant: "standard",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced security and support for large orgs.",
    features: ["Unlimited members", "SSO & SAML", "Dedicated manager", "Custom contracts"],
    buttonText: "Contact Sales",
    variant: "standard",
  },
];

const comparisonData = [
  { category: "Recording", features: [
    { name: "Video Limit", starter: "25 videos", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
    { name: "Resolution", starter: "720p", pro: "4K UHD", team: "4K UHD", enterprise: "4K UHD" },
    { name: "Browser Recording", starter: true, pro: true, team: true, enterprise: true },
    { name: "Desktop App", starter: false, pro: true, team: true, enterprise: true },
  ]},
  { category: "AI & Tools", features: [
    { name: "AI Summaries", starter: false, pro: true, team: true, enterprise: true },
    { name: "Transcription", starter: false, pro: true, team: true, enterprise: true },
    { name: "Custom Branding", starter: false, pro: false, team: true, enterprise: true },
  ]},
  { category: "Admin & Security", features: [
    { name: "Members", starter: "1", pro: "1", team: "Up to 10", enterprise: "Unlimited" },
    { name: "SSO/SAML", starter: false, pro: false, team: false, enterprise: true },
    { name: "Support", starter: "Community", pro: "Priority", team: "24/7 Priority", enterprise: "Dedicated Manager" },
  ]}
];

export default function BillingPage() {
  const { data: subData, isFetched } = useQueryData(
    ["user-subscription"],
    getSubscription
  );
  const [loading, setLoading] = React.useState(false);

  const currentPlan = (subData as any)?.data?.plan || "FREE";

  const handleUpgrade = async (plan: "PRO" | "TEAM") => {
    setLoading(true);
    try {
      const result = await createCheckoutSession(plan);
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4 sm:px-8 lg:px-12 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-eyebrow mb-6 border border-primary/20">
            <Star size={12} fill="currentColor" />
            Pricing Plans
          </div>
          <h1 className="text-display md:text-[3.5rem] mb-6">
            Simple, <span className="text-purple-600">Transparent</span> Pricing.
          </h1>
          <p className="text-subheading max-w-2xl mx-auto">
            Everything you need to record, share, and collaborate on videos with the power of artificial intelligence.
          </p>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 sm:px-8 lg:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "group relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300",
                plan.variant === "premium" 
                  ? "bg-foreground text-background border-foreground shadow-2xl scale-105 z-10" 
                  : "bg-card border-border hover:border-foreground/20 shadow-sm"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-eyebrow px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={cn(
                  "text-xl font-semibold tracking-tight mb-2",
                  plan.variant === "premium" ? "text-background" : "text-foreground"
                )}>
                  {plan.name}
                </h3>
                <p className={cn(
                  "text-body-sm opacity-80",
                  plan.variant === "premium" ? "text-background" : "text-muted-foreground"
                )}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className="text-caption opacity-70">/mo</span>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className={cn(
                      "flex-shrink-0 size-5 rounded-full flex items-center justify-center",
                      plan.variant === "premium" ? "bg-background/20" : "bg-purple-600/10"
                    )}>
                      <Check size={12} className={plan.variant === "premium" ? "text-background" : "text-purple-600"} strokeWidth={3} />
                    </div>
                    <span className={cn(
                      "text-body-sm font-medium",
                      plan.variant === "premium" ? "text-background/90" : "text-foreground/80"
                    )}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={
                  plan.name === "Pro" 
                    ? () => handleUpgrade("PRO") 
                    : plan.name === "Team" 
                      ? () => handleUpgrade("TEAM") 
                      : undefined
                }
                disabled={loading || currentPlan === plan.name.toUpperCase()}
                className={cn(
                  "w-full h-14 rounded-2xl font-semibold text-sm transition-all active:scale-95 shadow-lg",
                  plan.variant === "premium" 
                    ? "bg-background text-foreground hover:bg-background/90" 
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  currentPlan === plan.name.toUpperCase() ? "Current Plan" : plan.buttonText
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison Grid Section */}
      <div className="px-4 sm:px-8 lg:px-12 pb-40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-page-title mb-4">Compare Features</h2>
            <p className="text-body">Find the perfect fit for your workflow.</p>
          </div>

          <div className="rounded-[2rem] border border-border bg-card/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-5 p-6 border-b border-border bg-muted/30">
              <div className="col-span-1 font-bold text-xs uppercase text-muted-foreground tracking-widest">Features</div>
              <div className="text-center font-semibold text-sm uppercase">Starter</div>
              <div className="text-center font-semibold text-sm uppercase text-purple-600">Pro</div>
              <div className="text-center font-semibold text-sm uppercase">Team</div>
              <div className="text-center font-semibold text-sm uppercase">Enterprise</div>
            </div>

            {comparisonData.map((category) => (
              <div key={category.category}>
                <div className="px-6 py-4 bg-secondary/20 text-eyebrow tracking-[0.2em] text-muted-foreground border-b border-border/50">
                  {category.category}
                </div>
                {category.features.map((feature, idx) => (
                  <div 
                    key={feature.name} 
                    className={cn(
                      "grid grid-cols-5 px-6 py-5 items-center transition-colors hover:bg-secondary/10",
                      idx !== category.features.length - 1 && "border-b border-border/30"
                    )}
                  >
                    <div className="col-span-1 text-sm font-bold text-foreground/80">{feature.name}</div>
                    <div className="text-center text-sm font-medium">
                      {typeof feature.starter === "boolean" ? (feature.starter ? <Check size={16} className="mx-auto text-green-500" /> : "-") : feature.starter}
                    </div>
                    <div className="text-center text-sm font-bold text-purple-600">
                      {typeof feature.pro === "boolean" ? (feature.pro ? <Check size={16} className="mx-auto" /> : "-") : feature.pro}
                    </div>
                    <div className="text-center text-sm font-medium">
                      {typeof feature.team === "boolean" ? (feature.team ? <Check size={16} className="mx-auto text-foreground" /> : "-") : feature.team}
                    </div>
                    <div className="text-center text-sm font-medium">
                      {typeof feature.enterprise === "boolean" ? (feature.enterprise ? <Check size={16} className="mx-auto text-foreground" /> : "-") : feature.enterprise}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Customer Support Banner */}
          <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="size-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-xl">
                <Mail size={32} />
              </div>
              <div>
                <h4 className="text-xl font-semibold tracking-tight">Need a custom plan?</h4>
                <p className="text-body-sm">Our team is happy to help you build a package that fits your organization perfectly.</p>
              </div>
            </div>
            <Button variant="outline" className="h-14 px-8 rounded-2xl font-semibold text-sm border-2 border-foreground/10 hover:border-foreground/20 hover:bg-background">
              Talk to an Expert
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
