"use client";

import React from "react";
import FolderList from "@/components/global/folders";
import VideoList from "@/components/global/videos";

type FolderContentProps = {
  workspaceId: string;
  folderId: string;
};

export default function FolderContent({
  workspaceId,
  folderId,
}: FolderContentProps) {
  return (
    <div className="flex flex-col gap-8">
      <VideoList
        workspaceId={workspaceId}
        folderId={folderId}
        videosKey={`folder-videos-${folderId}`}
      />
    </div>
  );
}
