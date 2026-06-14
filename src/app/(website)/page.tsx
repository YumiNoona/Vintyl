"use client";

import React from "react";
import LandingPageNavbar from "./_components/navbar";
import DonateModal from "./_components/donate-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Video,
  Sparkles,
  Users,
  Shield,
  Monitor,
  Search,
  ArrowRight,
  Play,
  Check,
  HelpCircle,
  Server,
  Zap,
  Cpu,
  Camera,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, ease: "easeOut" as const, delay },
});

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <motion.div
    {...stagger}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="group p-8 rounded-3xl border border-border bg-card/50 hover:border-foreground/20 hover:bg-card/80 transition-all duration-500"
  >
    <div className="size-12 rounded-2xl bg-foreground flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
      <Icon size={22} className="text-background" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </motion.div>
);

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen">
      <LandingPageNavbar />

      {/* ───── HERO ───── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Zap size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary tracking-wide">
                  100% Free — No Cloud Required
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Record. Share.
                <br />
                <span className="text-muted-foreground">Understand.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                AI-powered video messaging that runs on your own machine.
                No subscriptions, no upload limits, no cloud dependencies.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/auth?mode=signup">
                  <Button
                    size="lg"
                    className="bg-foreground hover:bg-foreground/90 text-background px-10 py-7 text-base font-semibold rounded-2xl gap-2 shadow-xl active:scale-95 transition-all"
                  >
                    Get Started Free
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    document
                      .getElementById("demo")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="border-border bg-transparent hover:bg-secondary px-10 py-7 text-base font-semibold rounded-2xl gap-2 active:scale-95 transition-all text-foreground"
                >
                  <Play size={18} fill="currentColor" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6 border-t border-border">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="size-9 rounded-full border-2 border-background bg-gradient-to-br from-neutral-700 to-neutral-800"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">2,400+</span>{" "}
                  teams already onboard
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:block relative"
            >
              {/* Hero visual mock */}
              <div className="relative aspect-[4/3] rounded-3xl border border-border bg-card overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <div className="p-6 space-y-4 relative z-10">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-500/60" />
                    <div className="size-2.5 rounded-full bg-yellow-500/60" />
                    <div className="size-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="space-y-3 mt-6">
                    <motion.div
                      animate={{ width: ["30%", "85%", "30%"] }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="h-2.5 bg-foreground/10 rounded-full"
                    />
                    <div className="h-2.5 w-3/4 bg-foreground/8 rounded-full" />
                    <div className="h-2.5 w-1/2 bg-foreground/8 rounded-full" />
                    <div className="grid grid-cols-2 gap-3 mt-8">
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                        <Camera size={32} className="text-primary/40" />
                      </div>
                      <div className="aspect-video rounded-xl bg-neutral-900/50 border border-border" />
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 right-6 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full tracking-wider shadow-lg"
                >
                  AI READY
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background glows */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/3 blur-[120px] rounded-full" />
        </div>
      </section>

      {/* ───── STATS BAR ───── */}
      <motion.section
        {...fadeUp()}
        className="py-16 px-6 border-y border-border bg-muted/30"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "Zero Config", label: "Install & run" },
            { value: "100% Free", label: "No paid plans" },
            { value: "Local First", label: "Your data stays yours" },
            { value: "AI Built-in", label: "Optional cloud AI" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything You Need, <span className="text-muted-foreground">Nothing You Don&apos;t</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              A complete video collaboration platform that respects your privacy and your wallet.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Monitor}
              title="Screen & Camera Recording"
              desc="Capture your screen, camera, or both simultaneously in crisp 4K. Desktop app also available."
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Summaries & Transcripts"
              desc="Automatic titles, transcripts, and smart summaries powered by Gemini or Groq (optional)."
            />
            <FeatureCard
              icon={Users}
              title="Team Workspaces"
              desc="Organize videos into shared workspaces. Collaborate with your team in structured folders."
            />
            <FeatureCard
              icon={Server}
              title="100% Local Storage"
              desc="Every video stays on your machine. No cloud uploads, no third-party servers, no data leaks."
            />
            <FeatureCard
              icon={Search}
              title="Searchable Transcripts"
              desc="Every word spoken is indexed and searchable. Find any moment in seconds."
            />
            <FeatureCard
              icon={Shield}
              title="Privacy First"
              desc="No accounts required to view. No tracking. No data mining. Your content belongs to you."
            />
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section
        id="workflow"
        className="py-24 md:py-32 px-6 bg-muted/30 border-y border-border"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              Workflow
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Three Steps to <span className="text-muted-foreground">Clarity</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              From recording to sharing in under a minute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-[16.66%] right-[16.66%] h-px bg-border -translate-y-1/2" />

            {[
              {
                step: "01",
                icon: Camera,
                title: "Record",
                desc: "Capture your screen or camera with one click. Browser or desktop app — your choice.",
              },
              {
                step: "02",
                icon: Cpu,
                title: "Process",
                desc: "AI generates a title, transcript, and summary automatically. Or skip AI and keep it raw.",
              },
              {
                step: "03",
                icon: Users,
                title: "Share",
                desc: "Get a shareable link instantly. No sign-up required for viewers. Works on any device.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center gap-5"
              >
                <div className="size-16 rounded-2xl bg-foreground flex items-center justify-center shadow-xl">
                  <item.icon size={28} className="text-background" />
                </div>
                <span className="text-xs font-mono text-muted-foreground tracking-widest">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── AI SECTION ───── */}
      <section id="ai" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                  <Sparkles size={12} />
                  AI Optional
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                  Smart AI That <span className="text-muted-foreground">Works Offline</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vintyl uses local processing by default. If you want AI summaries
                  and transcripts, bring your own API key for Gemini or Groq.
                  No subscription, no per-minute fees.
                </p>
                <ul className="space-y-4 pt-2">
                {[
                    "Automatic video summarization",
                    "Full-text transcript search",
                    "Smart title generation",
                    "Actionable highlights",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 items-start text-sm">
                      <Check
                        size={16}
                        className="text-primary mt-0.5 shrink-0"
                        strokeWidth={3}
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl bg-card border border-border flex items-center justify-center p-8 shadow-xl">
                  <div className="text-center space-y-4">
                    <Cpu size={64} className="text-foreground/20 mx-auto" />
                    <p className="text-sm text-muted-foreground font-mono">
                      localhost:3000
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-green-500/10 text-green-500 border border-green-500/20">
                        Gemini Ready
                      </span>
                      <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Groq Ready
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── DONATE ───── */}
      <section
        id="donate"
        className="py-24 md:py-32 px-6 bg-muted/30 border-y border-border"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              One Plan. <span className="text-muted-foreground">Free Forever.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              No tiers, no upsells, no hidden limits. Everything is unlocked.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-lg mx-auto rounded-3xl border border-border bg-card p-10 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
            <div className="text-6xl font-bold tracking-tighter mb-2">$0</div>
            <p className="text-muted-foreground text-sm mb-8">
              Per month — no credit card needed
            </p>
            <ul className="space-y-3 text-left mb-10 max-w-xs mx-auto">
              {[
                "Unlimited video recordings",
                "4K resolution support",
                "AI summaries & transcripts",
                "Unlimited team members",
                "Desktop app access",
                "Local storage — your data stays yours",
              ].map((f) => (
                <li key={f} className="flex gap-3 items-center text-sm">
                  <Check size={16} className="text-primary shrink-0" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
            <DonateModal />
          </motion.div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              FAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Got Questions?
            </h2>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: "Is Vintyl actually free?",
                a: "Yes. There are no paid plans, no trial periods, and no hidden limits. Every feature — including AI, 4K recording, and unlimited team members — is available at no cost.",
              },
              {
                q: "Do I need an internet connection?",
                a: "Vintyl runs entirely on your machine. The only time you need internet is for AI features (Gemini/Groq) or sharing links with remote teammates.",
              },
              {
                q: "Where are my videos stored?",
                a: "Right on your computer. Videos are saved to a local directory and never uploaded to any cloud service unless you explicitly share a link.",
              },
              {
                q: "How does the AI work?",
                a: "AI is optional. If you want automatic transcripts and summaries, provide your own Gemini or Groq API key. No subscription fees — you only pay the AI provider directly for what you use.",
              },
              {
                q: "Is there a desktop app?",
                a: "Yes. We provide an Electron-based desktop app for Windows and macOS that captures system audio and supports background recording.",
              },
              {
                q: "Can I collaborate with my team?",
                a: "Absolutely. Create workspaces, invite members, and share video links. Viewers don't need an account to watch.",
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group p-5 rounded-2xl border border-border bg-card/50 open:bg-card/80 transition-colors cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 list-none">
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <HelpCircle size={16} className="text-muted-foreground shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed pl-7">
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-24 md:py-32 px-6 bg-muted/30 border-t border-border">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Start Recording. <span className="text-muted-foreground">For Free.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            No sign-up fees. No credit card. No cloud vendor lock-in.
            Just you, your team, and your videos.
          </p>
          <Link href="/auth?mode=signup">
            <Button className="bg-foreground hover:bg-foreground/90 text-background px-12 py-7 text-base font-semibold rounded-2xl gap-2 shadow-xl active:scale-95 transition-all">
              Get Started Free
              <ArrowRight size={18} />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
              <span className="text-background text-[10px] font-bold">V</span>
            </div>
            <span className="font-medium text-foreground">Vintyl</span>
          </div>
          <p>
            Built with ❤️ — No cloud, no catch, just video.
          </p>
        </div>
      </footer>
    </main>
  );
}
