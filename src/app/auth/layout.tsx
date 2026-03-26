import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      {/* Target UX Navbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-black font-bold text-sm">
            V
          </div>
          <span className="text-sm font-semibold text-white">Vintyl</span>
        </div>

        {/* EMPTY RIGHT SIDE */}
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
