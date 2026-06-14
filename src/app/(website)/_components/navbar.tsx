"use client";

import Link from "next/link";
import React from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "How it Works" },
  { href: "#donate", label: "Donate" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingPageNavbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 backdrop-blur-xl bg-background/70 border-b border-border">
      <Link href="/" className="flex items-center gap-2.5 group">
        <img src="/logo.png" alt="Vintyl" className="size-8 rounded-lg object-cover" />
        <span className="font-semibold text-sm tracking-tight">Vintyl</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/auth?mode=signin"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
        >
          Sign In
        </Link>
        <Link
          href="/auth?mode=signup"
          className="text-sm font-semibold px-5 py-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95"
        >
          Get Started
        </Link>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 text-foreground"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-border" />
          <Link
            href="/auth?mode=signin"
            className="text-sm font-medium text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/auth?mode=signup"
            className="text-sm font-semibold text-center px-5 py-2.5 rounded-xl bg-foreground text-background"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
