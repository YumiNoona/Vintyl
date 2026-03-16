"use client";

import React from "react";
import { useQueryData } from "@/hooks/useQueryData";
import { getWorkspaceFolders, createFolder } from "@/actions/workspace";
import { FolderProps } from "@/types";
import FolderCard from "./folder-card";
import { useMutationData } from "@/hooks/useMutationData";
import { Plus } from "lucide-react";

type FolderListProps = {
  workspaceId: string;
};

export default function FolderList({ workspaceId }: FolderListProps) {
  const { data, isFetched } = useQueryData(
    ["workspace-folders"],
    () => getWorkspaceFolders(workspaceId)
  );

  const { mutate, isPending } = useMutationData(
    ["create-folder"],
    () => createFolder(workspaceId),
    "workspace-folders"
  );

  const { status, data: folders } = data as FolderProps;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-xl font-bold tracking-tight">Folders</h2>
        <button
          onClick={() => mutate({})}
          disabled={isPending}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-all text-sm font-semibold group"
        >
          <div className="bg-secondary p-1 rounded-md group-hover:bg-secondary-foreground group-hover:text-background transition-colors">
            <Plus size={14} />
          </div>
          <span>New Folder</span>
        </button>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto w-full pb-2 scrollbar-hide">
        {isFetched && status === 200 ? (
          folders.map((folder) => (
            <FolderCard
              key={folder.id}
              id={folder.id}
              name={folder.name}
              workspaceId={workspaceId}
              count={folder._count?.videos || 0}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-sm font-medium italic">
            {isFetched ? "No folders in this workspace" : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
}
