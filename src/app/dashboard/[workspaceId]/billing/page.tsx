"use client";

import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  "Unlimited videos",
  "AI summaries & transcription",
  "4K quality",
  "Unlimited members",
  "Desktop app recording",
  "Priority support",
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pt-20 pb-16 px-4 sm:px-8 lg:px-12 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-eyebrow mb-6 border border-primary/20">
            <Sparkles size={12} />
            Everything Unlocked
          </div>
          <h1 className="text-display md:text-[3.5rem] mb-6">
            All Features, <span className="text-purple-600">Free</span>.
          </h1>
          <p className="text-subheading max-w-2xl mx-auto">
            Vintyl is fully free with no paid plans. All features — including AI summaries, unlimited videos, 4K quality, and team collaboration — are available to everyone.
          </p>
        </motion.div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 pb-40">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-[2rem] border border-border bg-card/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="text-5xl font-bold tracking-tighter mb-2">
                  Free
                </div>
                <p className="text-muted-foreground">Forever — no credit card needed</p>
              </div>

              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex-shrink-0 size-6 rounded-full bg-purple-600/10 flex items-center justify-center">
                      <Check size={14} className="text-purple-600" strokeWidth={3} />
                    </div>
                    <span className="text-body-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
