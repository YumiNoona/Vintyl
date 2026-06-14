"use client";

import React, { useState, useEffect } from "react";
import { Monitor, PlusCircle, Settings as SettingsIcon, Users, User, Mail, Camera, Loader2, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import Modal from "@/components/global/modal";
import Search from "@/components/global/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateUserProfile } from "@/actions/user";

export default function SettingsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/debug");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setName(data.user.email?.split('@')[0] || "");
          setEmail(data.user.email || "");
        }
      } catch {}
    }
    getUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanName = name.trim();
    const [firstName, ...rest] = cleanName.split(/\s+/);
    const lastName = rest.join(" ");
    const result = await updateUserProfile(firstName || "", lastName || "");

    if (result.status !== 200) toast.error(result.data);
    else toast.success("Profile updated!");
    setLoading(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Email change is handled locally. Contact admin for changes.");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Password management is handled locally.");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        const cleanName = name.trim();
        const [firstName, ...rest] = cleanName.split(/\s+/);
        const lastName = rest.join(" ");
        await updateUserProfile(firstName || "", lastName || "", data.url);
        toast.success("Avatar updated!");
      }
    } catch {
      toast.error("Failed to upload avatar");
    }
    setLoading(false);
  };

  return (
    <div className="pb-20 space-y-8">
      <div className="flex items-start gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border shadow-md">
           <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-page-title">Settings</h1>
          <p className="text-eyebrow opacity-80">Workspace and account control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-card border border-border rounded-3xl p-8 backdrop-blur-xl shadow-xl">
            <h2 className="text-eyebrow mb-8 flex items-center gap-3">
              <User size={16} className="text-muted-foreground" />
              General Profile
            </h2>
            
            <div className="flex items-center gap-8 mb-10">
               <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/5 border border-white/10 group-hover:opacity-50 transition-all shadow-inner">
                     {user?.image ? (
                        <img src={user.image} alt="avatar" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-foreground text-background font-semibold text-3xl">
                           {name?.charAt(0)}
                        </div>
                     )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                     <Camera size={24} className="text-foreground" />
                     <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                  </label>
               </div>
               <div className="space-y-1">
                  <p className="font-semibold text-xl text-foreground tracking-tight leading-none">{name || "Your name"}</p>
                  <p className="text-body-sm">{email}</p>
               </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-eyebrow ml-1">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-muted/60 h-12 border-border rounded-2xl focus:border-foreground/20 transition-all font-medium" />
              </div>
              <Button type="submit" disabled={loading || !name.trim()} className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-12 rounded-2xl shadow-lg text-sm">
                 {loading ? <Loader2 className="animate-spin" /> : "Save Profile Details"}
              </Button>
            </form>
          </section>

          <section className="bg-card border border-border rounded-3xl p-8 backdrop-blur-xl shadow-xl">
            <h2 className="text-eyebrow mb-8 flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground" />
              Email Address
            </h2>
            <form onSubmit={handleUpdateEmail} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-eyebrow ml-1">Current Email</label>
                  <Input value={email} disabled className="bg-muted/60 h-12 border-border rounded-2xl font-medium" />
               </div>
               <Button type="submit" variant="secondary" disabled className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-semibold h-12 rounded-2xl border border-border text-sm">
                 Email is managed locally
               </Button>
            </form>
          </section>
        </div>

        <div className="space-y-8">
           <section className="bg-card border border-border rounded-3xl p-8 backdrop-blur-xl shadow-xl">
            <h2 className="text-eyebrow mb-8 flex items-center gap-3">
              <Monitor size={16} className="text-muted-foreground" />
              Desktop App
            </h2>
            <div className="space-y-6">
               <p className="text-body-sm">
                Copy your User ID and paste it into the Vintyl Desktop app to link your account and enable high-performance recording.
              </p>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={user?.id || ""} 
                  className="bg-muted/60 h-12 border-border rounded-2xl font-mono text-xs text-muted-foreground"
                />
                <Button 
                  variant="secondary" 
                  className="h-12 w-12 rounded-2xl bg-muted/70 border border-border hover:bg-muted text-foreground transition-all shadow-xl shadow-foreground/5 shrink-0"
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

          <section className="bg-card border border-border rounded-3xl p-8 backdrop-blur-xl shadow-xl">
            <h2 className="text-eyebrow mb-6 flex items-center gap-3">
              <Users size={16} className="text-muted-foreground" />
              Workspace Members
            </h2>
            <div className="space-y-6">
               <p className="text-body-sm">
                Invite team members and manage collaborators for this workspace. Use email addresses to send secure invitations.
              </p>
              <Modal
                trigger={
                   <Button className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-12 rounded-2xl shadow-lg gap-2 text-sm">
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
