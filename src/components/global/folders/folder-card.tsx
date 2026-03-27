"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";
import { useMutationData } from "@/hooks/useMutationData";
import { useQueryClient } from "@tanstack/react-query";
import { renameFolders, moveVideoLocation, deleteFolder } from "@/actions/workspace";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryData } from "@/hooks/useQueryData";
import { getWorkspaces, updateFolderLocation } from "@/actions/workspace";
import { WorkspaceProps } from "@/types";

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
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const folderCardRef = useRef<HTMLDivElement>(null);
  const [onRename, setOnRename] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: workspaces } = useQueryData(["user-workspaces"], getWorkspaces);
  const workspaceList = (workspaces as WorkspaceProps)?.data?.workspace || [];

  const { mutate: moveMutate, isPending: moving } = useMutationData(
    ["move-folder"],
    (data: { workspaceId: string }) => updateFolderLocation(id, data.workspaceId),
    "workspace-folders",
    () => {
      setIsMoveOpen(false);
      toast.success("Folder moved successfully");
      router.refresh();
    }
  );

  const { mutate: renameMutate } = useMutationData(
    ["rename-folders"],
    (data: { name: string }) => renameFolders(id, data.name),
    "workspace-folders"
  );

  const { mutate: deleteMutate } = useMutationData(
    ["delete-folder"],
    () => deleteFolder(id),
    "workspace-folders",
    () => toast.success("Folder deleted successfully")
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
    if (inputRef.current?.value && inputRef.current.value !== name) {
      renameMutate({ name: inputRef.current.value });
    }
    setOnRename(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameBlur();
    } else if (e.key === "Escape") {
      setOnRename(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const videoId = e.dataTransfer.getData("videoId");
    if (videoId) {
      toast.info("Moving video...");

      const res = await moveVideoLocation(videoId, workspaceId, id);
      if (res.status === 200) {
        toast.success("Video moved successfully");
        queryClient.invalidateQueries({ queryKey: ["user-videos", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["workspace-folders", workspaceId] });
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            typeof query.queryKey[0] === "string" &&
            query.queryKey[0].startsWith("folder-videos-"),
        });
      } else {
        toast.error("Failed to move video");
      }
    }
  };

  if (!mounted) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={folderCardRef}
          onClick={handleFolderClick}
          onDoubleClick={handleDoubleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex hover:bg-secondary/60 cursor-pointer transition-all duration-300 items-center gap-3 justify-between min-w-[250px] py-4 px-6 rounded-3xl border group ${
            optimistic ? "opacity-60" : "border-border bg-card/70"
          } hover:border-foreground/20 hover:shadow-xl backdrop-blur-xl`}
        >
          <div className="flex flex-col gap-0">
            {onRename ? (
              <Input
                onBlur={handleRenameBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                ref={inputRef}
                defaultValue={name}
                className="border-none text-base w-full outline-none text-foreground bg-transparent p-0 h-auto focus:ring-0 font-bold"
              />
            ) : (
            <p className="text-foreground font-semibold tracking-tight text-sm">{name}</p>
            )}
            <span className="text-eyebrow mt-0.5">
              {count || 0} video{count !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="size-11 rounded-2xl bg-secondary flex items-center justify-center border border-border group-hover:border-foreground/20 group-hover:bg-foreground group-hover:text-background transition-all shadow-inner">
            <Folder className="opacity-80 transition-transform group-hover:scale-110" size={20} fill="currentColor" />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-popover border-border backdrop-blur-2xl shadow-2xl rounded-2xl p-2 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
        <ContextMenuItem 
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-secondary text-sm text-foreground font-medium transition-colors focus:bg-secondary focus:outline-none" 
          onClick={handleFolderClick}
        >
          Open Folder
        </ContextMenuItem>
        <ContextMenuItem 
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-secondary text-sm text-foreground font-medium transition-colors focus:bg-secondary focus:outline-none" 
          onClick={(e) => {
            e.stopPropagation();
            setOnRename(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem 
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-secondary text-sm text-foreground font-medium transition-colors focus:bg-secondary focus:outline-none"
          onClick={() => setIsMoveOpen(true)}
        >
          Move to workspace
        </ContextMenuItem>
        <ContextMenuItem 
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-secondary text-sm text-foreground font-medium transition-colors focus:bg-secondary focus:outline-none"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/dashboard/${workspaceId}/folder/${id}`);
            toast.success("Folder link copied");
          }}
        >
          Copy folder link
        </ContextMenuItem>
        <div className="h-px bg-border/50 my-1.5 mx-1" />
        <ContextMenuItem 
          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 text-sm transition-colors focus:outline-none"
          onClick={() => deleteMutate({})}
        >
          Delete folder
        </ContextMenuItem>
      </ContextMenuContent>

      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent className="bg-card border-border text-foreground rounded-2xl shadow-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Move Folder</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a destination workspace for this folder and all its videos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
              <div className="grid gap-3">
                {workspaceList.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkspace(w.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                      selectedWorkspace === w.id 
                        ? "bg-foreground/10 border-foreground/30 text-foreground shadow-md" 
                        : "bg-card border-border text-muted-foreground hover:border-foreground/20 hover:bg-secondary"
                    }`}
                  >
                    <span className="font-semibold text-sm tracking-tight">{w.name}</span>
                    {selectedWorkspace === w.id && <div className="size-2.5 rounded-full bg-foreground" />}
                  </button>
                ))}
              </div>
          </div>
          <DialogFooter className="mt-8">
            <Button variant="ghost" onClick={() => setIsMoveOpen(false)} className="rounded-2xl h-12 font-medium text-sm text-muted-foreground hover:text-foreground">Cancel</Button>
            <Button 
              className="bg-foreground text-background hover:bg-foreground/90 font-semibold h-12 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-sm"
              onClick={() => moveMutate({ workspaceId: selectedWorkspace })}
              disabled={selectedWorkspace === workspaceId || moving}
            >
              {moving ? "Moving Content..." : "Confirm Move"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContextMenu>
  );
}
