import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function LandingPageNavbar() {
  return (
    <nav className="sticky top-0 z-50 flex w-full justify-between items-center px-8 py-6 backdrop-blur-xl border-b border-white/5 bg-black/60">
      <div className="text-3xl font-bold flex items-center gap-x-3 group cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
          <Image
            alt="logo"
            src="/vintyl-logo.svg"
            width={24}
            height={24}
          />
        </div>
        <p className="tracking-tighter">Vintyl</p>
      </div>
      
      <div className="hidden gap-x-10 items-center lg:flex text-sm font-medium text-neutral-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="#features" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors">Features</Link>
        <Link href="#workflow" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors">How it Works</Link>
        <Link href="#ai" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors">AI</Link>
        <Link href="#pricing" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors">Pricing</Link>
        <Link href="#faq" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors">FAQ</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>

      <div className="flex gap-4">
        <Link href="/auth/sign-in">
          <Button variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/5 px-6">
            Login
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 shadow-lg shadow-purple-500/20 transition-all active:scale-95">
            Start Free Trial
          </Button>
        </Link>
      </div>
    </nav>
  );
}
