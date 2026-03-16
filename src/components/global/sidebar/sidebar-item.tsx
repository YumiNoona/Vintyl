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
          "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200",
          isActive
            ? "bg-purple-600/10 dark:bg-purple-500/20 border-l-2 border-purple-500 text-purple-700 dark:text-white"
            : "hover:bg-sidebar-accent text-muted-foreground hover:text-foreground hover:translate-x-1"
        )}
      >
        <Icon size={20} />
        <span className="font-medium">{title}</span>
      </Link>
    </li>
  );
}
