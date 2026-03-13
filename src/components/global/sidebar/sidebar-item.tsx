"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
  selected,
}: SidebarItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800/50 transition-colors",
          selected && "bg-neutral-800/50 text-white"
        )}
      >
        <Icon size={20} />
        <span>{title}</span>
      </Link>
    </li>
  );
}
