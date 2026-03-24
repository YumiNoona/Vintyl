"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Monitor, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DesktopAuthPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        setStatus("ready");
      } else {
        // Not logged in
        window.location.href = "/auth";
      }
    };

    checkSession();
  }, []);

  const handleLink = () => {
    if (!token) return;
    
    // Deep link to Electron
    const deepLinkUrl = `vintyl://auth?token=${token}`;
    window.location.href = deepLinkUrl;
    
    // Show success state after a short delay (assuming link opened)
    setTimeout(() => {
        setStatus("loading");
        // We can't really know if they linked, so we just show a "Done" state
        // and tell them to go back to the app.
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-border shadow-2xl bg-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500 mb-2">
            <Monitor size={24} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Link Desktop App</CardTitle>
          <CardDescription>
            Securely connect your Vintyl account to the desktop recording software.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground animate-pulse">Initializing secure connection...</p>
            </div>
          )}

          {status === "ready" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold uppercase">
                  {user?.email?.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user?.email}</span>
                  <span className="text-xs text-muted-foreground">Logged in via Web</span>
                </div>
                <CheckCircle2 size={16} className="ml-auto text-green-500" />
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleLink}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20"
                >
                  Confirm & Link App
                </Button>
                <p className="text-[10px] text-center text-muted-foreground px-4 uppercase tracking-widest font-medium opacity-60">
                  This will automatically open the Vintyl Desktop app
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <div className="space-y-1">
                <p className="font-bold text-foreground">Authentication Failed</p>
                <p className="text-sm text-muted-foreground">Please try logging in again to link your account.</p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = "/auth"} className="mt-2">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
