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
            ? "bg-secondary border-l-2 border-foreground text-foreground font-semibold"
            : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-1"
        )}
      >
        <Icon size={18} className={cn("transition-transform group-hover:scale-110", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        <span className="text-body-sm tracking-tight font-medium">{title}</span>
      </Link>
    </li>
  );
}
