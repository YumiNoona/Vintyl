import React from "react";
import { getNotifications } from "@/actions/user";
import { Bell, CheckCircle } from "lucide-react";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {notifications.status === 200 && notifications.data ? (
        <div className="flex flex-col gap-3">
          {(notifications.data as any).notifications?.map(
            (notification: any) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-4 bg-neutral-800/40 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-colors"
              >
                <Bell
                  size={18}
                  className="text-neutral-400 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-neutral-300 text-sm">
                    {notification.content}
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
          <CheckCircle size={48} className="mb-4 text-neutral-600" />
          <p className="text-lg">All caught up!</p>
          <p className="text-sm mt-1">No new notifications</p>
        </div>
      )}
    </div>
  );
}
