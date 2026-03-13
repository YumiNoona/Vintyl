import React from "react";
import { getWorkspaceFolders } from "@/actions/workspace";
import FolderContent from "@/components/global/folder-content";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ workspaceId: string; folderId: string }>;
}) {
  const { workspaceId, folderId } = await params;

  const folders = await getWorkspaceFolders(workspaceId);
  const currentFolder = folders.data?.find?.(
    (f: any) => f.id === folderId
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {currentFolder?.name || "Folder"}
      </h1>
      <FolderContent workspaceId={workspaceId} folderId={folderId} />
    </div>
  );
}
