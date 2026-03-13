import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function LandingPageNavbar() {
  return (
    <div className="flex w-full justify-between items-center">
      <div className="text-3xl font-semibold flex items-center gap-x-3">
        <Image
          alt="logo"
          src="/venus-logo.svg"
          width={40}
          height={40}
        />
        <p>Venus</p>
      </div>
      <div className="hidden gap-x-10 items-center lg:flex">
        <Link href="/">Home</Link>
        <Link href="/">Pricing</Link>
        <Link href="/">Contact</Link>
      </div>
      <Link href="/auth/sign-in">
        <Button>
          <User fill="#000" />
          Login
        </Button>
      </Link>
    </div>
  );
}
