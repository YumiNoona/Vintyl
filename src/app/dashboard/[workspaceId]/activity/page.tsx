import React from "react";
import { getNotifications } from "@/actions/user";
import { inviteMembers, acceptInvite } from "@/actions/workspace";
import { Activity, CheckCircle, UserPlus } from "lucide-react";
import InviteAcceptButton from "./_components/invite-accept-button";

export default async function ActivityPage() {
  const activities = await getNotifications();

  return (
    <div>
      <h1 className="text-3xl font-black text-foreground mb-8 tracking-tight">Activity</h1>
      {activities.status === 200 && activities.data ? (
        <div className="flex flex-col gap-4">
          {(activities.data as any).notifications?.map(
            (activity: any) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-5 bg-secondary/30 backdrop-blur-sm rounded-2xl border border-border hover:border-purple-500/50 hover:bg-secondary/50 transition-all duration-300 group shadow-sm"
              >
                <div className="bg-secondary p-2.5 rounded-xl text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors shadow-inner ring-1 ring-border">
                  <Activity
                    size={20}
                    className="flex-shrink-0"
                  />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-foreground text-sm font-bold leading-relaxed">
                    {activity.content}
                  </p>
                  {activity.content.includes("invited") && (
                    <InviteAcceptButton inviteId={activity.id} />
                  )}
                  <p className="text-muted-foreground text-[10px] mt-2 font-black uppercase tracking-widest bg-secondary w-fit px-2 py-0.5 rounded">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-secondary/10 border-2 border-dashed border-border rounded-[3rem]">
          <div className="bg-secondary p-6 rounded-full mb-6 ring-1 ring-border shadow-inner">
            <CheckCircle size={48} className="text-muted-foreground opacity-20" />
          </div>
          <p className="text-xl font-black text-foreground">All caught up!</p>
          <p className="text-sm mt-2 font-medium">No new activity to show right now</p>
        </div>
      )}
    </div>
  );
}
