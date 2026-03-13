"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { useQueryData } from "@/hooks/useQueryData";
import { getNotifications } from "@/actions/user";
import { Bell, Search, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DashboardNavbarProps = {
  workspaceId: string;
};

export default function DashboardNavbar({
  workspaceId,
}: DashboardNavbarProps) {
  const router = useRouter();

  const { data } = useQueryData(
    ["user-notifications"],
    getNotifications
  );

  const notificationCount =
    (data as any)?.data?._count?.notifications || 0;

  return (
    <div className="fixed z-50 left-[250px] right-0 top-0 flex items-center justify-between px-6 py-4 bg-[#171717]/80 backdrop-blur-lg border-b border-neutral-800">
      {/* Search */}
      <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg px-3 flex-1 max-w-md">
        <Search size={18} className="text-neutral-500" />
        <Input
          placeholder="Search for videos..."
          className="border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-500"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30 hover:text-purple-300 gap-2"
        >
          <Video size={16} />
          <span className="hidden md:inline">Record</span>
        </Button>

        <button
          onClick={() =>
            router.push(`/dashboard/${workspaceId}/notifications`)
          }
          className="relative p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Bell size={20} className="text-neutral-400" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        <UserButton />
      </div>
    </div>
  );
}
