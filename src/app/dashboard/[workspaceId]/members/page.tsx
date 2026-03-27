import React from "react";
import { getWorkspaceMembers } from "@/actions/workspace";
import { Users, PlusCircle, ShieldCheck } from "lucide-react";
import Modal from "@/components/global/modal";
import Search from "@/components/global/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PLAN_LIMITS } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const membersData = await getWorkspaceMembers(workspaceId);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userPlanData } = await supabase
    .from("User")
    .select("Subscription(plan)")
    .eq("supabaseId", user.id)
    .single();
  
  const plan = (userPlanData?.Subscription as any)?.plan || "FREE";
  const limit = (PLAN_LIMITS as any)[plan]?.members || 1;
  const currentMembers = (membersData.data?.members?.length || 0) + 1; // +1 for owner
  const canInvite = currentMembers < limit;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-page-title">Workspace Members</h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage team access and permissions for this space.</p>
        </div>
        {canInvite ? (
          <Modal
            trigger={
              <button className="flex items-center gap-2 px-8 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-semibold transition-all shadow-xl shadow-foreground/10 active:scale-95 whitespace-nowrap">
                <PlusCircle size={20} />
                Invite Member
              </button>
            }
            title="Invite to workspace"
            description="Enter an email to send an invitation."
          >
            <Search workspaceId={workspaceId} />
          </Modal>
        ) : (
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2 px-8 py-3 bg-card text-muted-foreground hover:text-foreground border border-border rounded-2xl font-medium transition-all active:scale-95 whitespace-nowrap group"
          >
            <PlusCircle size={20} className="group-hover:text-purple-500" />
            Upgrade to Invite
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membersData.status === 200 && membersData.data && (
          <>
            {/* Owner */}
            <div className="p-8 rounded-[2.5rem] border-2 border-border bg-card backdrop-blur-sm relative group shadow-xl">
              <div className="absolute top-6 right-6 bg-foreground text-background text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={12} strokeWidth={3} />
                Owner
              </div>
              <div className="flex items-center gap-5">
                <Avatar className="size-16 border-2 border-border shadow-inner">
                  <AvatarImage src={membersData.data.user?.image || ""} />
                  <AvatarFallback className="bg-secondary text-foreground font-semibold">
                    {membersData.data.user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {membersData.data.user?.firstName} {membersData.data.user?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium truncate max-w-[150px]">
                    {membersData.data.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Members */}
            {membersData.data.members?.map((member: any) => (
              <div 
                key={member.user.id}
                className="p-8 rounded-[2.5rem] border-2 border-border bg-card/50 hover:border-purple-500/30 hover:bg-card transition-all duration-300 group shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <Avatar className="size-16 border-2 border-border group-hover:border-purple-500/20 transition-colors shadow-inner">
                    <AvatarImage src={member.user.image || ""} />
                    <AvatarFallback className="bg-secondary text-foreground font-bold">
                      {member.user.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {member.user.firstName} {member.user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium truncate max-w-[150px]">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {membersData.status === 200 && !membersData.data?.members?.length && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-card/40 border-2 border-dashed border-border rounded-[4rem]">
          <div className="bg-secondary p-8 rounded-full mb-8 ring-1 ring-border shadow-inner">
            <Users size={64} className="opacity-30 text-foreground" strokeWidth={1} />
          </div>
          <p className="text-2xl font-semibold text-foreground">Build your team</p>
          <p className="text-sm mt-3 font-medium max-w-xs text-center opacity-60">
            Invite your team members to start collaborating asynchronously with video.
          </p>
        </div>
      )}
    </div>
  );
}
