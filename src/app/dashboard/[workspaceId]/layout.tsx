import { onAuthenticatedUser } from "@/actions/user";
import { verifyAccessToWorkspace } from "@/actions/workspace";
import {
  getWorkspaceFolders,
  getAllUserVideos,
  getWorkspaces,
  getFirstWorkspaceForUser,
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
  // DO NOT call again in children

  if (auth.status !== 200 && auth.status !== 201) {
    console.log("⚠️ WorkspaceLayout: Auth failed, redirecting to /auth. Status:", auth.status);
    return redirect("/auth");
  }

  if (!auth.user?.workspace || auth.user.workspace.length === 0) {
    console.log("⚠️ WorkspaceLayout: No workspaces found, redirecting to /dashboard for auto-provisioning");
    return redirect("/dashboard");
  }

  const hasAccess = await verifyAccessToWorkspace(workspaceId);

  if (hasAccess.status !== 200) {
    console.log("🚫 WorkspaceLayout: Access denied for workspace:", workspaceId);

    // Attempt fallback to the first valid workspace
    const fallback = await getFirstWorkspaceForUser();

    if (fallback.status === 200 && fallback.workspaceId && fallback.workspaceId !== workspaceId) {
      console.log("➡️ WorkspaceLayout: Redirecting to primary workspace fallback:", fallback.workspaceId);
      return redirect(`/dashboard/${fallback.workspaceId}`);
    }

    // If no fallback found OR fallback is same as current (prevent loop), terminate to auth
    console.error("❌ WorkspaceLayout: Terminal authorization failure.");
    return redirect("/auth");
  }

  // Fetch full workspace data using system client to bypass evaluation lag if needed, 
  // though verifyAccessToWorkspace already confirmed membership.
  const systemSupabase = await (await import("@/lib/supabase/server")).createSystemClient();
  const { data: workspace } = await systemSupabase
    .from("Workspace")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    console.error("❌ WorkspaceLayout: Access verified but workspace data could not be fetched.");
    return redirect("/auth");
  }

  const query = new QueryClient();

  query.setQueryData(["user-profile", auth.user?.id], auth.user);
  query.setQueryData(["workspace-info", workspaceId], workspace);

  await query.prefetchQuery({
    queryKey: ["workspace-folders", workspaceId],
    queryFn: () => getWorkspaceFolders(workspaceId),
  });

  await query.prefetchQuery({
    queryKey: ["user-videos", workspaceId],
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