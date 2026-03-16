import { onAuthenticatedUser } from "@/actions/user";
import { verifyAccessToWorkspace } from "@/actions/workspace";
import {
  getWorkspaceFolders,
  getAllUserVideos,
  getWorkspaces,
} from "@/actions/workspace";
import { getNotifications } from "@/actions/user";
import { redirect } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";
import Sidebar from "@/components/global/sidebar";
import DashboardNavbar from "@/components/global/navbar";
import { RecordingProvider } from "@/context/RecordingContext";
import GlobalRecordingEffects from "@/components/global/global-recording-effects";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const auth = await onAuthenticatedUser();

  if (!auth.user?.workspace) return redirect("/auth/sign-in");
  if (!auth.user.workspace.length) return redirect("/auth/sign-in");

  const hasAccess = await verifyAccessToWorkspace(workspaceId);

  if (hasAccess.status !== 200) {
    return redirect(`/dashboard/${auth.user.workspace[0].id}`);
  }

  if (!hasAccess.data?.workspace) return null;

  const query = new QueryClient();

  await query.prefetchQuery({
    queryKey: ["workspace-folders"],
    queryFn: () => getWorkspaceFolders(workspaceId),
  });

  await query.prefetchQuery({
    queryKey: ["user-videos"],
    queryFn: () => getAllUserVideos(workspaceId),
  });

  await query.prefetchQuery({
    queryKey: ["user-workspaces"],
    queryFn: getWorkspaces,
  });

  await query.prefetchQuery({
    queryKey: ["user-notifications"],
    queryFn: getNotifications,
  });

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <RecordingProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
          <Sidebar activeWorkspaceId={workspaceId} />
          <div className="flex flex-col flex-1 relative overflow-hidden">
            <DashboardNavbar workspaceId={workspaceId} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {children}
            </main>
          </div>
        </div>
        <GlobalRecordingEffects />
      </RecordingProvider>
    </HydrationBoundary>
  );
}
