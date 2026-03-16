"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, PlusCircle, Settings as SettingsIcon, Users } from "lucide-react";
import { useParams } from "next/navigation";
import Modal from "@/components/global/modal";
import Search from "@/components/global/search";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-2xl space-y-8">
        {/* Member Management */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-300 flex items-center gap-2">
            <Users size={18} />
            Members
          </h2>
          <div className="p-4 bg-neutral-800/20 rounded-xl border border-white/5 flex items-center justify-between">
            <p className="text-neutral-400 text-sm">
              Invite and manage team members in this workspace.
            </p>
            <Modal
              trigger={
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors shadow-lg shadow-purple-500/20">
                  <PlusCircle size={16} />
                  Invite Member
                </button>
              }
              title="Invite to workspace"
              description="Invite other users to your workspace"
            >
              <Search workspaceId={workspaceId} />
            </Modal>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-300 font-bold">
            Account
          </h2>
          <div className="p-4 bg-neutral-800/20 rounded-xl border border-white/5">
            <p className="text-neutral-400 text-sm">
              Account settings are managed through Clerk. Click your
              profile icon in the top right to manage your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
