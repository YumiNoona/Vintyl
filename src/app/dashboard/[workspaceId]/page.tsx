import React from "react";
import WorkspaceContent from "@/components/global/workspace-content";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Library</h1>
      <WorkspaceContent workspaceId={workspaceId} />
    </div>
  );
}
