import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function LandingPageNavbar() {
  return (
    <nav id="navbar-clean" className="sticky top-0 z-50 flex w-full justify-between items-center px-8 py-5 backdrop-blur-xl border-b border-white/5 bg-black/60">
      <div id="logo-fix" className="flex items-center gap-3 group cursor-pointer">
        <img
          alt="logo"
          src="/vintyl-logo.svg"
          className="h-7 w-auto"
        />
        <span className="text-sm font-semibold text-white">Vintyl</span>
      </div>
      
      <div id="nav-links" className="hidden md:flex items-center gap-8 text-sm text-neutral-400 font-medium">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        <Link href="#workflow" className="hover:text-white transition-colors">How it Works</Link>
        <Link href="#ai" className="hover:text-white transition-colors">AI</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>

      <div className="flex gap-4">
        <Link href="/auth?mode=signin">
          <button className="text-neutral-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
            Login
          </button>
        </Link>
        <Link href="/auth?mode=signup">
          <button id="cta-fix" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-all active:scale-95">
            Start Free Trial
          </button>
        </Link>
      </div>
    </nav>
  );
}
