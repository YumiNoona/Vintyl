"use client";

import React from "react";
import LandingPageNavbar from "./_components/navbar";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Video,
  Sparkles,
  Users,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layout,
  MousePointer2,
} from "lucide-react";
import HeroVisual from "@/components/global/hero-visual";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, desc, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`group p-8 rounded-3xl border border-white/5 bg-gradient-to-b ${gradient} hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10`}
  >
    <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
      <Icon size={28} className="text-purple-400" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-neutral-100">{title}</h3>
    <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default function HomePage() {
  return (
    <main className="bg-[#050505] min-h-screen selection:bg-purple-500/30">
      <LandingPageNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">
                  The Future of Collaboration
                </span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white">
                Record. Share.<br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                  Collaborate.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-neutral-400 max-w-lg leading-relaxed font-medium">
                Vintyl is an async video platform that lets teams record, 
                share, and discuss videos with AI-powered insights.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/auth/sign-up">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-7 text-lg font-bold rounded-2xl gap-3 shadow-2xl shadow-purple-500/40 border border-purple-400/20 active:scale-95 transition-all"
                  >
                    Start Free Trial
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-white/10 bg-white/5 hover:bg-white/10 px-10 py-7 text-lg font-bold rounded-2xl gap-3 backdrop-blur-md transition-all active:scale-95"
                >
                  <Play size={20} fill="currentColor" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-neutral-800" />
                  ))}
                </div>
                <p className="text-sm text-neutral-500 font-medium italic">
                  Joined by <span className="text-neutral-300">2,000+</span> teams this month
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:block h-full min-h-[500px] relative"
            >
              <HeroVisual />
              {/* Floating Layered Glow */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-[120px] opacity-30 pointer-events-none -z-10"
                animate={{ 
                  y: [-20, 20, -20],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Global Background Gradients (GPU friendly) */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-40"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(124,58,237,0.15), transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(236,72,153,0.15), transparent 60%)
              `
            }}
          />
          <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] top-[-100px] left-[20%]" />
          <div className="absolute w-[500px] h-[500px] bg-pink-500/20 blur-[120px] bottom-[-120px] right-[10%]" />
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              See Vintyl in Action
            </h2>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">
              Experience the seamless recording and AI summarization flow that saves teams hours every week.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-5xl mx-auto rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] p-4 shadow-3xl shadow-purple-500/5 relative group"
          >
            <div className="rounded-[2rem] overflow-hidden aspect-video bg-neutral-900 border border-white/5 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Play size={80} className="text-white opacity-20 group-hover:opacity-80 transition-all group-hover:scale-110 z-20 cursor-pointer" fill="currentColor" />
               <div className="text-neutral-600 text-xl font-medium tracking-widest hidden group-hover:block absolute bottom-10 z-20">PRESS TO PLAY DEMO</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Everything to <span className="text-purple-500">Communicate Faster</span>
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg leading-relaxed">
              Vintyl provides the tools professional teams need for high-fidelity async communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Video}
              title="Screen Recording"
              desc="Record high-resolution screen, camera, and system audio simultaneously."
              gradient="from-purple-500/10 to-transparent"
            />
            <FeatureCard 
              icon={Sparkles}
              title="AI Transcription"
              desc="Automatic titles, summaries, and transcripts powered by the latest AI models."
              gradient="from-pink-500/10 to-transparent"
            />
            <FeatureCard 
              icon={Users}
              title="Private Workspaces"
              desc="Organize your team's knowledge in structured, secure workspaces."
              gradient="from-blue-500/10 to-transparent"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="workflow" className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Get Started in <span className="text-purple-500">3 Seconds</span>
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg leading-relaxed">
              Vintyl is designed for speed. No complex setup, just pure collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             {/* Connection Line */}
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -translate-y-1/2" />
             
             {[
               { icon: Layout, title: "1. Create", desc: "Start a workspace and invite your team in seconds." },
               { icon: Play, title: "2. Record", desc: "Capture high-fidelity videos with one click or shortcut." },
               { icon: Zap, title: "3. Share", desc: "Get an instant shareable link with AI-transcripts ready." }
             ].map((step, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.2 }}
                 className="relative z-10 flex flex-col items-center text-center space-y-6"
               >
                 <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center shadow-xl shadow-purple-500/5 group">
                    <step.icon size={32} className="text-purple-400 group-hover:scale-110 transition-transform" />
                 </div>
                 <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                 <p className="text-neutral-500 text-sm max-w-[250px]">{step.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral-500">Everything you need to know about Vintyl.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is there a desktop app?", a: "Yes, we offer an optimized Electron app for Windows and macOS with system audio support." },
              { q: "How secure is my data?", a: "All videos are encrypted at rest and delivered via our secure CloudFront pipeline." },
              { q: "Can I use it for free?", a: "Absolutely. Our Personal plan includes everything you need for basic async collaboration." }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-white/5 bg-neutral-900/30 space-y-3"
              >
                <h4 className="flex items-center gap-3 text-lg font-bold text-white">
                  <HelpCircle size={20} className="text-purple-500" />
                  {faq.q}
                </h4>
                <p className="text-neutral-500 pl-8 leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section (Restored) */}
      <section id="ai" className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-neutral-900/40 rounded-[3rem] border border-white/5 p-12 lg:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                AI that <span className="text-purple-400">Contextualizes</span> Everything.
              </h2>
              <ul className="space-y-6">
                {[
                  "Automatic video summarization",
                  "Searchable AI transcriptions",
                  "Actionable highlights from discussions"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-center text-neutral-300 text-lg">
                    <CheckCircle2 className="text-purple-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="bg-white text-black hover:bg-neutral-200 rounded-2xl px-8 py-6 font-bold text-base shadow-xl active:scale-95 transition-all">
                Learn about Vintyl AI
              </Button>
            </div>
            
            <div className="relative">
               <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/5 rounded-3xl border border-white/5 flex items-center justify-center">
                  <Sparkles size={120} className="text-purple-500/30 animate-pulse" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-white">Simple Pricing</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">Start for free, upgrade as your team grows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {[
            { name: "Personal", price: "0", features: ["1 Workspace", "25 Videos", "720p Quality", "Basic AI"], color: "white" },
            { name: "Pro", price: "99", features: ["Unlimited Workspaces", "Unlimited Videos", "4K Quality", "Advanced AI Support", "Custom Branding"], color: "purple", popular: true },
            { name: "Team", price: "249", features: ["SSO Support", "Custom Security", "Shared Library", "Dedicated Support", "Admin Console"], color: "white" }
          ].map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: plan.popular ? 1.07 : 1.02 }}
              className={`p-10 rounded-[2.5rem] border ${
                plan.popular 
                  ? 'border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent shadow-2xl shadow-purple-500/20 scale-105 z-20' 
                  : 'border-white/5 bg-neutral-900/50 grayscale hover:grayscale-0'
              } relative transition-all duration-500 group`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-black text-white">${plan.price}</span>
                <span className="text-neutral-500 font-medium pb-2">/mo</span>
              </div>
              <ul className="space-y-4 text-left mb-10">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex gap-3 text-sm text-neutral-300 font-medium">
                    <CheckCircle2 size={18} className={plan.popular ? "text-purple-400" : "text-neutral-600"} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full py-7 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all ${
                  plan.popular 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20' 
                    : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-white/5'
                }`}
              >
                Pick Plan
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-6">
             <div className="text-3xl font-bold flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1.5">
                  <Image src="/vintyl-logo.svg" alt="logo" width={32} height={32} />
               </div>
               <span className="tracking-tighter text-white">Vintyl</span>
             </div>
             <p className="text-neutral-500 max-w-[250px] leading-relaxed text-sm">
               The asynchronous video platform for teams who value clear communication.
             </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 text-sm">
            <div className="space-y-4">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-3 text-neutral-500">
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">AI Processing</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Pricing</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-3 text-neutral-500">
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Terms</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between text-[11px] font-bold tracking-widest text-neutral-600 uppercase">
           <p>© {new Date().getFullYear()} Vintyl Studio Inc.</p>
           <p>Engineered for Speed & Scale</p>
        </div>
      </footer>
    </main>
  );
}

