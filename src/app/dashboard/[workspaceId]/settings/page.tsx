"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-2xl space-y-8">
        {/* Theme */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-300">
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  theme === value
                    ? "border-purple-500 bg-purple-500/5"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-300">
            Account
          </h2>
          <div className="p-4 bg-neutral-800/40 rounded-xl border border-neutral-700">
            <p className="text-neutral-400 text-sm">
              Account settings are managed through Clerk. Click the
              profile icon to manage your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
