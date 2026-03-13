"use client";

import React from "react";
import FolderList from "@/components/global/folders";
import VideoList from "@/components/global/videos";

type WorkspaceContentProps = {
  workspaceId: string;
};

export default function WorkspaceContent({
  workspaceId,
}: WorkspaceContentProps) {
  return (
    <div className="flex flex-col gap-8">
      <FolderList workspaceId={workspaceId} />
      <VideoList workspaceId={workspaceId} />
    </div>
  );
}
