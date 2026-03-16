import React from "react";
import { getWorkspaceMembers } from "@/actions/workspace";
import { Users, PlusCircle, ShieldCheck } from "lucide-react";
import Modal from "@/components/global/modal";
import Search from "@/components/global/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const membersData = await getWorkspaceMembers(workspaceId);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Workspace Members</h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage team access and permissions for this space.</p>
        </div>
        <Modal
          trigger={
            <button className="flex items-center gap-2 px-8 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-bold transition-all shadow-xl shadow-foreground/10 active:scale-95 whitespace-nowrap">
              <PlusCircle size={20} />
              Invite Member
            </button>
          }
          title="Invite to workspace"
          description="Enter an email to send an invitation."
        >
          <Search workspaceId={workspaceId} />
        </Modal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membersData.status === 200 && membersData.data && (
          <>
            {/* Owner */}
            <div className="p-8 rounded-[2.5rem] border-2 border-purple-500/30 bg-purple-500/5 backdrop-blur-sm relative group shadow-lg shadow-purple-500/5">
              <div className="absolute top-6 right-6 bg-purple-600 dark:bg-purple-500 text-white dark:text-background text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                <ShieldCheck size={12} strokeWidth={3} />
                Owner
              </div>
              <div className="flex items-center gap-5">
                <Avatar className="size-16 border-2 border-purple-500/30 shadow-inner">
                  <AvatarImage src={membersData.data.user?.image || ""} />
                  <AvatarFallback className="bg-secondary text-foreground font-bold">
                    {membersData.data.user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">
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
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-secondary/10 border-2 border-dashed border-border rounded-[4rem]">
          <div className="bg-secondary p-8 rounded-full mb-8 ring-1 ring-border shadow-inner">
            <Users size={64} className="opacity-20 text-foreground" strokeWidth={1} />
          </div>
          <p className="text-2xl font-black text-foreground">Build your team</p>
          <p className="text-sm mt-3 font-medium max-w-xs text-center opacity-80">
            Invite your team members to start collaborating asynchronously with video.
          </p>
        </div>
      )}
    </div>
  );
}
