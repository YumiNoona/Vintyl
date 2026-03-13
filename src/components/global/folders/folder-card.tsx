"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";
import { useMutationData } from "@/hooks/useMutationData";
import { renameFolders } from "@/actions/workspace";
import { Input } from "@/components/ui/input";

type FolderCardProps = {
  id: string;
  name: string;
  workspaceId: string;
  count?: number;
  optimistic?: boolean;
};

export default function FolderCard({
  id,
  name,
  workspaceId,
  count,
  optimistic,
}: FolderCardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const folderCardRef = useRef<HTMLDivElement>(null);
  const [onRename, setOnRename] = useState(false);

  const { mutate, isPending } = useMutationData(
    ["rename-folders"],
    (data: { name: string }) => renameFolders(id, data.name),
    "workspace-folders"
  );

  const handleFolderClick = () => {
    if (onRename) return;
    router.push(`/dashboard/${workspaceId}/folder/${id}`);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOnRename(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRenameBlur = () => {
    if (inputRef.current?.value) {
      mutate({ name: inputRef.current.value });
    }
    setOnRename(false);
  };

  return (
    <div
      ref={folderCardRef}
      onClick={handleFolderClick}
      onDoubleClick={handleDoubleClick}
      className={`flex hover:bg-neutral-800 cursor-pointer transition duration-150 items-center gap-2 justify-between min-w-[250px] py-4 px-4 rounded-lg border-[1px] ${
        optimistic ? "opacity-60" : "border-neutral-700"
      }`}
    >
      <div className="flex flex-col gap-0">
        {onRename ? (
          <Input
            onBlur={handleRenameBlur}
            autoFocus
            ref={inputRef}
            defaultValue={name}
            className="border-none text-base w-full outline-none text-neutral-300 bg-transparent p-0 h-auto"
          />
        ) : (
          <p className="text-neutral-300">{name}</p>
        )}
        <span className="text-sm text-neutral-500">
          {count || 0} video{count !== 1 ? "s" : ""}
        </span>
      </div>
      <div>
        <Folder className="text-neutral-500" />
      </div>
    </div>
  );
}
