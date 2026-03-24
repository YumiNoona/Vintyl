"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

type SidebarItemProps = {
  icon: LucideIcon;
  title: string;
  href: string;
  selected?: boolean;
};

export default function SidebarItem({
  icon: Icon,
  title,
  href,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
          isActive
            ? "bg-white/5 border-l-2 border-white text-white font-bold"
            : "text-neutral-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
        )}
      >
        <Icon size={18} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-neutral-500 group-hover:text-white")} />
        <span className="text-xs uppercase tracking-widest font-bold">{title}</span>
      </Link>
    </li>
  );
}
