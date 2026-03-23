import AnalyticsChart from "@/components/global/analytics";
import WorkspaceContent from "@/components/global/workspace-content";
import React from "react";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="flex flex-col gap-y-6">
      <AnalyticsChart />
      <WorkspaceContent workspaceId={workspaceId} />
    </div>
  );
}
