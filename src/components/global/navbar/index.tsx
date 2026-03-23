"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQueryData } from "@/hooks/useQueryData";
import { getNotifications } from "@/actions/user";
import { Bell, MonitorUp, Download, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/global/modal";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardNavbarProps = {
  workspaceId: string;
};

function SupabaseUserButton() {
  const router = useRouter();
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email || "";
      setInitial(email.charAt(0).toUpperCase() || "U");
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="relative group">
      <button
        onClick={handleSignOut}
        className="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center hover:bg-purple-700 transition-colors"
        title="Sign out"
      >
        {initial}
      </button>
      <div className="absolute right-0 top-10 hidden group-hover:flex items-center gap-1.5 bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground whitespace-nowrap shadow-lg z-50">
        <LogOut size={12} />
        Sign out
      </div>
    </div>
  );
}

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

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenDesktopApp = () => {
    window.location.href = "vintyl://record";
  };

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-lg border-b border-border bg-background/80 w-full transition-colors duration-300">
      {/* Search space occupied in Sidebar, left empty for balance */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Modal
          trigger={
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 gap-2 transition-transform hover:scale-105 shadow-md"
            >
              <MonitorUp size={16} />
              <span className="hidden md:inline">Record</span>
            </Button>
          }
          title="Record a Video"
          description="Choose how you would like to record your video."
        >
          {({ setOpen }: { setOpen: (open: boolean) => void }) => (
            <div className="flex flex-col gap-5 mt-6">
              <div className="group border border-purple-500/20 rounded-2xl p-6 flex flex-col gap-4 bg-purple-500/5 transition-all hover:bg-purple-500/10 hover:border-purple-500/40 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground text-lg tracking-tight">Desktop Recorder</h4>
                    <p className="text-xs text-muted-foreground font-medium italic uppercase tracking-widest opacity-70">Recommended</p>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                    <MonitorUp size={20} />
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground/80 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-purple-500" />
                    Full screen & camera recording
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-purple-500" />
                    System audio capture
                  </li>
                </ul>
                <Button
                  onClick={() => {
                    setOpen(false);
                    handleOpenDesktopApp();
                  }}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl font-bold mt-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <Download size={18} />
                  Get Desktop App
                </Button>
              </div>

              <div className="group border border-border rounded-2xl p-6 flex flex-col gap-4 bg-secondary/20 transition-all hover:bg-secondary/40 hover:border-foreground/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground text-lg tracking-tight">Browser Recorder</h4>
                    <p className="text-xs text-muted-foreground font-medium italic uppercase tracking-widest opacity-70">Direct & Fast</p>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary text-muted-foreground">
                    <MonitorUp size={20} />
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground/80 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-muted-foreground/40" />
                    No software required
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-muted-foreground/40" />
                    Limited to active tab/window
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-border bg-background hover:bg-secondary text-foreground h-12 rounded-xl font-bold mt-2 shadow-sm active:scale-95 transition-all"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/dashboard/${workspaceId}/record`);
                  }}
                >
                  <Plus size={18} className="rotate-45" />
                  Record in Browser
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Theme Toggle */}
        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        )}

        <SupabaseUserButton />
      </div>
    </div>
  );
}
