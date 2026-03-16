"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { useQueryData } from "@/hooks/useQueryData";
import { getNotifications } from "@/actions/user";
import { Bell, MonitorUp, Download } from "lucide-react";
import { useRouter } from "next/navigation";
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
            <div className="flex flex-col gap-4 mt-4">
              <div className="border border-purple-500/20 rounded-xl p-4 flex flex-col gap-3 bg-purple-500/5 transition-colors hover:bg-purple-500/10">
                <div>
                  <h4 className="font-bold text-foreground">Desktop Recorder (Recommended)</h4>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Full screen & camera recording</li>
                    <li>System audio capture</li>
                    <li>Best overall performance</li>
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    setOpen(false);
                    handleOpenDesktopApp();
                  }}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700 mt-2 shadow-lg shadow-purple-500/20"
                >
                  <MonitorUp size={16} />
                  Open Desktop App
                </Button>
              </div>

              <div className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-secondary/30 transition-colors hover:bg-secondary/50">
                <div>
                  <h4 className="font-bold text-foreground">Browser Recorder (Limited)</h4>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Screen capture only</li>
                    <li>No system audio support</li>
                    <li>May have browser restrictions</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-border hover:bg-secondary mt-2 shadow-sm"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/dashboard/${workspaceId}/record`);
                  }}
                >
                  <MonitorUp size={16} />
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

        <UserButton />
      </div>
    </div>
  );
}
