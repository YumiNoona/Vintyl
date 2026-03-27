import Link from "next/link";
import React from "react";

export default function LandingPageNavbar() {
  return (
    <nav id="navbar-clean" className="sticky top-0 z-50 flex w-full justify-between items-center px-8 py-5 backdrop-blur-xl border-b border-border bg-background/80">
      <div id="logo-fix" className="flex items-center gap-3 group cursor-pointer">
        <img
          alt="logo"
          src="/vintyl-logo.svg"
          className="h-7 w-auto"
        />
        <span className="text-sm font-semibold text-foreground">Vintyl</span>
      </div>
      
      <div id="nav-links" className="hidden md:flex items-center gap-8 text-body-sm font-medium">
        <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
        <Link href="#workflow" className="hover:text-foreground transition-colors">How it Works</Link>
        <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
      </div>

      <div className="flex gap-4">
        <Link href="/auth?mode=signin">
          <button className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium transition-colors">
            Login
          </button>
        </Link>
        <Link href="/auth?mode=signup">
          <button id="cta-fix" className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-all active:scale-95">
            Start Free Trial
          </button>
        </Link>
      </div>
    </nav>
  );
}
