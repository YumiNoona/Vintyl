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
        <h2 className="text-[#BdBdBd] text-xl">Folders</h2>
        <button
          onClick={() => mutate({})}
          disabled={isPending}
          className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors text-sm"
        >
          <Plus size={16} />
          <span>New Folder</span>
        </button>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto w-full">
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
          <p className="text-neutral-500 text-sm">
            {isFetched ? "No folders in this workspace" : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
}
