import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function LandingPageNavbar() {
  return (
    <nav className="sticky top-0 z-50 flex w-full justify-between items-center px-8 py-6 backdrop-blur-xl border-b border-white/5 bg-black/60">
      <div className="text-3xl font-bold flex items-center gap-x-3 group cursor-pointer">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-neutral-200 transition-colors">
          <Image
            alt="logo"
            src="/vintyl-logo.svg"
            width={24}
            height={24}
            className="invert"
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
        <Link href="/auth?mode=signin">
          <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 px-6 font-semibold">
            Login
          </Button>
        </Link>
        <Link href="/auth?mode=signup">
          <Button className="bg-white hover:bg-neutral-200 text-black rounded-xl px-8 font-bold shadow-xl shadow-white/5 transition-all active:scale-95">
            Start Free Trial
          </Button>
        </Link>
      </div>
    </nav>
  );
}
