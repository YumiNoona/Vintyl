"use client";

import { login, signup } from "@/actions/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useActionState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

export function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const success = searchParams.get("success");
  const initialMode = searchParams.get("mode") || "signin";
  
  const [mode, setMode] = useState(initialMode);
  const [emailSent, setEmailSent] = useState(false);

  // Sync mode with URL if it changes externally
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode && (urlMode === "signin" || urlMode === "signup")) {
      setMode(urlMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) {
      toast.error(decodeURIComponent(error));
      // Clear error from URL to prevent re-toast on refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      router.replace(`/auth?${params.toString()}`);
    }
    if (success === "true") {
      setEmailSent(true);
    }
  }, [error, success, searchParams, router]);

  // Use useActionState for pending states
  const [loginState, loginAction, isLoginPending] = useActionState(login, null);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, null);

  useEffect(() => {
    if (loginState?.success) {
      console.log("🚀 Login successful, hard redirecting to /dashboard");
      toast.success("Successfully signed in!");
      // Use location.assign for a full refresh to ensure cookies are picked up
      window.location.assign("/dashboard");
    }
    if (loginState?.error) {
      console.error("❌ Login error state:", loginState.error);
      toast.error(loginState.error);
    }
  }, [loginState]);

  useEffect(() => {
    if (signupState?.success) {
      if (signupState.emailConfirmationRequired) {
        console.log("📧 Signup successful, email confirmation required");
        setEmailSent(true);
      } else {
        console.log("🚀 Signup successful, hard redirecting to /dashboard");
        toast.success("Account created!");
        window.location.assign("/dashboard");
      }
    }
    if (signupState?.error) {
      console.error("❌ Signup error state:", signupState.error);
      toast.error(signupState.error);
    }
  }, [signupState]);

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("⚡ Form submission triggered");
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md space-y-8 bg-secondary/10 p-10 rounded-3xl border border-border backdrop-blur-xl text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="text-purple-400" size={32} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter">Check your email</h1>
        <p className="text-muted-foreground leading-relaxed">
          We&apos;ve sent a confirmation link to your inbox. <br />
          Please confirm your email to continue.
        </p>
        <button 
          onClick={() => {
            setEmailSent(false);
            router.replace("/auth?mode=signin");
          }} 
          className="w-full bg-secondary/30 hover:bg-secondary/40 text-white font-bold py-3 rounded-xl transition-all mt-4"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-secondary/10 p-8 rounded-3xl border border-border backdrop-blur-xl transition-all duration-500">
        <div className="text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-black font-bold text-lg mb-4">
            V
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Vintyl Auth</h1>
          <p className="text-muted-foreground mt-1">Sign in or create an account to start recording</p>
        </div>

        <div className="w-full">
          {mode === "signin" ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <form action={loginAction} onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 ml-1 uppercase font-bold tracking-widest">Email Address</label>
                  <input name="email" type="email" required className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-neutral-600 text-white" placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 ml-1 uppercase font-bold tracking-widest">Password</label>
                  <input name="password" type="password" required className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-neutral-600 text-white" placeholder="••••••••" />
                </div>
                <button 
                  disabled={isLoginPending}
                  type="submit" 
                  className="w-full bg-white hover:bg-neutral-200 text-black font-black py-4 rounded-xl transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2 uppercase tracking-tight"
                >
                  {isLoginPending ? <><Loader2 className="animate-spin" size={20} /> Signing In...</> : "Sign In"}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <form action={signupAction} onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 ml-1 uppercase font-bold tracking-widest">Name</label>
                  <input
                    name="full_name"
                    type="text"
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-neutral-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 ml-1 uppercase font-bold tracking-widest">Email Address</label>
                  <input name="email" type="email" required className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-neutral-600 text-white" placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 ml-1 uppercase font-bold tracking-widest">Password</label>
                  <input name="password" type="password" required className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-white/20 transition-all font-bold placeholder:text-neutral-600 text-white" placeholder="••••••••" />
                </div>
                <button 
                  disabled={isSignupPending}
                  type="submit" 
                  className="w-full bg-white hover:bg-neutral-200 text-black font-black py-4 rounded-xl transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2 uppercase tracking-tight"
                >
                  {isSignupPending ? <><Loader2 className="animate-spin" size={20} /> Creating Account...</> : "Create Account"}
                </button>
              </form>
            </div>
          )}
        </div>
        
        {/* Bottom CTA UX */}
        <p className="text-xs text-neutral-500 text-center mt-4">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button 
                onClick={() => {
                  setMode("signup");
                  router.push("/auth?mode=signup");
                }}
                className="text-white font-medium hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button 
                onClick={() => {
                  setMode("signin");
                  router.push("/auth?mode=signin");
                }}
                className="text-white font-medium hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
    </div>
  );
}
