import React from "react";
import LandingPageNavbar from "./_components/navbar";
import Link from "next/link";
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
} from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <LandingPageNavbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-24 mb-20 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-sm text-purple-400 font-medium">
            AI-Powered Video Platform
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl leading-tight tracking-tight">
          Record. Share.{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            Collaborate.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mt-6 leading-relaxed">
          Venus is your all-in-one video messaging tool. Record your screen,
          get AI-generated summaries, and share instantly with your team.
        </p>
        <div className="flex gap-4 mt-10">
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-base rounded-xl gap-2 shadow-lg shadow-purple-500/25"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-neutral-700 hover:bg-neutral-800 px-8 py-6 text-base rounded-xl gap-2"
          >
            <Play size={18} />
            Watch Demo
          </Button>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-1 shadow-2xl shadow-purple-500/5">
          <div className="rounded-xl bg-neutral-900 p-8 min-h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-neutral-600">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Play size={36} className="text-purple-500 ml-1" />
              </div>
              <p className="text-neutral-500">Your video workspace preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need to{" "}
            <span className="text-purple-400">communicate faster</span>
          </h2>
          <p className="text-neutral-400 mt-4 max-w-xl mx-auto">
            Stop writing long emails. Record a quick video and let AI do the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Video,
              title: "Screen Recording",
              desc: "Record your screen, camera, or both with one click from the desktop app.",
              gradient: "from-purple-500/20 to-purple-600/5",
            },
            {
              icon: Sparkles,
              title: "AI Summaries",
              desc: "Get automatic titles, descriptions, and transcriptions powered by AI.",
              gradient: "from-pink-500/20 to-pink-600/5",
            },
            {
              icon: Users,
              title: "Team Workspaces",
              desc: "Organize videos in shared workspaces. Invite team members and collaborate.",
              gradient: "from-blue-500/20 to-blue-600/5",
            },
            {
              icon: Zap,
              title: "Instant Sharing",
              desc: "Share videos with a link. No downloads, no uploads, just instant access.",
              gradient: "from-yellow-500/20 to-yellow-600/5",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              desc: "Your videos are encrypted and stored securely. Control who can access them.",
              gradient: "from-green-500/20 to-green-600/5",
            },
            {
              icon: Globe,
              title: "Access Anywhere",
              desc: "Desktop app for recording, web app for viewing. Works on all platforms.",
              gradient: "from-cyan-500/20 to-cyan-600/5",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`group p-6 rounded-2xl border border-neutral-800 bg-gradient-to-b ${feature.gradient} hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-neutral-700 transition-colors">
                <feature.icon size={22} className="text-neutral-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple, transparent{" "}
            <span className="text-purple-400">pricing</span>
          </h2>
          <p className="text-neutral-400 mt-4">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-4xl font-bold mb-1">
              $0<span className="text-lg text-neutral-500 font-normal">/mo</span>
            </p>
            <p className="text-neutral-500 text-sm mb-6">Perfect for getting started</p>
            <ul className="space-y-3 text-sm text-neutral-400 mb-8">
              <li className="flex gap-2">✓ <span>1 personal workspace</span></li>
              <li className="flex gap-2">✓ <span>Up to 25 videos</span></li>
              <li className="flex gap-2">✓ <span>Basic screen recording</span></li>
              <li className="flex gap-2">✓ <span>Share via link</span></li>
            </ul>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="w-full rounded-xl border-neutral-700">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-2xl border-2 border-purple-500/50 bg-gradient-to-b from-purple-500/5 to-transparent relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-500 text-white text-xs rounded-full font-medium">
              Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="text-4xl font-bold mb-1">
              $99<span className="text-lg text-neutral-500 font-normal">/mo</span>
            </p>
            <p className="text-neutral-500 text-sm mb-6">For teams and power users</p>
            <ul className="space-y-3 text-sm text-neutral-400 mb-8">
              <li className="flex gap-2">✓ <span>Unlimited workspaces</span></li>
              <li className="flex gap-2">✓ <span>Unlimited videos</span></li>
              <li className="flex gap-2">✓ <span>AI summaries & transcriptions</span></li>
              <li className="flex gap-2">✓ <span>Invite team members</span></li>
              <li className="flex gap-2">✓ <span>Priority support</span></li>
            </ul>
            <Link href="/auth/sign-up">
              <Button className="w-full rounded-xl bg-purple-600 hover:bg-purple-700">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 mb-10">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border border-neutral-800 bg-gradient-to-b from-purple-500/10 via-neutral-900 to-neutral-900 p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            Join thousands of teams using Venus to communicate faster with video.
          </p>
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-base rounded-xl gap-2 shadow-lg shadow-purple-500/25"
            >
              Start Recording for Free
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Venus. All rights reserved.
          </p>
          <div className="flex gap-6 text-neutral-500 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
