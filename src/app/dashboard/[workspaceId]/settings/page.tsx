"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, PlusCircle, Settings as SettingsIcon, Users, User, Mail, Lock, Camera, Loader2, Check, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import Modal from "@/components/global/modal";
import Search from "@/components/global/search";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFirstName(user.user_metadata?.first_name || "");
        setLastName(user.user_metadata?.last_name || "");
        setEmail(user.email || "");
      }
    }
    getUser();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: lastName }
    });

    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
    setLoading(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email });
    if (error) toast.error(error.message);
    else toast.success("Confirmation email sent to " + email);
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
      setNewPassword("");
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileName = `${user.id}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from("vintyl-videos") // Reusing the same bucket for simplicity or create a new one
      .upload(`avatars/${fileName}`, file);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("vintyl-videos")
      .getPublicUrl(`avatars/${fileName}`);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) toast.error(updateError.message);
    else toast.success("Avatar updated!");
    setLoading(false);
  };

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
           <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm uppercase font-black tracking-widest opacity-60">Workspace & Account Control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Profile */}
        <div className="space-y-8">
          {/* Profile Form */}
          <section className="bg-secondary/10 border border-border rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              <User size={18} className="text-purple-600" />
              Your Profile
            </h2>
            
            <div className="flex items-center gap-6 mb-8">
               <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary border border-border group-hover:opacity-50 transition-all">
                     {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-black text-3xl">
                           {firstName.charAt(0)}
                        </div>
                     )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                     <Camera size={24} className="text-white" />
                     <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                  </label>
               </div>
               <div className="space-y-1">
                  <p className="font-bold text-lg">{firstName} {lastName}</p>
                  <p className="text-muted-foreground text-sm">{email}</p>
               </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">First Name</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-secondary/20 h-11 border-border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary/20 h-11 border-border rounded-xl" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-foreground text-background font-bold h-11 rounded-xl">
                 {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </section>

          {/* Email Form */}
          <section className="bg-secondary/10 border border-border rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              <Mail size={18} className="text-purple-600" />
              Email Address
            </h2>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Update Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/20 h-11 border-border rounded-xl" />
               </div>
               <Button type="submit" variant="secondary" disabled={loading} className="w-full font-bold h-11 rounded-xl border border-border">
                 Update Email
               </Button>
            </form>
          </section>
        </div>

        {/* Right Column: Security & Workspace */}
        <div className="space-y-8">
           {/* Password Form */}
           <section className="bg-secondary/10 border border-border rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              <Lock size={18} className="text-purple-600" />
              Security
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">New Password</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-secondary/20 h-11 border-border rounded-xl" placeholder="••••••••" />
               </div>
               <Button type="submit" variant="secondary" disabled={loading || !newPassword} className="w-full font-bold h-11 rounded-xl border border-border">
                 Change Password
               </Button>
            </form>
          </section>

          {/* Desktop App Linking */}
          <section className="bg-secondary/10 border border-border rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              <Monitor size={18} className="text-purple-600" />
              Desktop App Linking
            </h2>
            <div className="space-y-4">
               <p className="text-muted-foreground text-sm">
                Copy your User ID and paste it into the Vintyl Desktop app to link your account and enable recording.
              </p>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={user?.id || ""} 
                  className="bg-secondary/20 h-11 border-border rounded-xl font-mono text-xs" 
                />
                <Button 
                  variant="secondary" 
                  className="h-11 rounded-xl px-4 border border-border"
                  onClick={() => {
                    if (user?.id) {
                      navigator.clipboard.writeText(user.id);
                      toast.success("User ID copied to clipboard!");
                    }
                  }}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          </section>

          {/* Members (Moved here) */}
          <section className="bg-secondary/10 border border-border rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              <Users size={18} className="text-purple-600" />
              Workspace Members
            </h2>
            <div className="space-y-4">
               <p className="text-muted-foreground text-sm">
                Invite team members and manage collaborators for this workspace.
              </p>
              <Modal
                trigger={
                   <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-purple-500/20 gap-2">
                      <PlusCircle size={16} />
                      Invite Member
                   </Button>
                }
                title="Invite to workspace"
                description="Invite other users to your workspace"
              >
                <Search workspaceId={workspaceId} />
              </Modal>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
