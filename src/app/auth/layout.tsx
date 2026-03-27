import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Target UX Navbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center text-background font-semibold text-sm">
            V
          </div>
          <span className="text-sm font-semibold text-foreground">Vintyl</span>
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
