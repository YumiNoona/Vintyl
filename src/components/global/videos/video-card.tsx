"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/global/loader";
import { Share2, User, Play } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import ShareModal from "../share-modal";
import EditVideo from "./edit-video";
import { useMutationData } from "@/hooks/useMutationData";
import { deleteVideo, getWorkspaceFolders, moveVideoLocation } from "@/actions/workspace";
import { toast } from "sonner";
import { useQueryData } from "@/hooks/useQueryData";
import { FolderProps } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type VideoCardProps = {
  id: string;
  title: string | null;
  createdAt: Date;
  source: string;
  processing: boolean;
  description: string | null;
  workspaceId: string;
  user?: {
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  } | null;
  folder?: {
    id: string;
    name: string;
  } | null;
  views?: number;
};

export default function VideoCard({
  id,
  title,
  createdAt,
  source,
  processing,
  description,
  workspaceId,
  user,
  folder,
  views = 0,
}: VideoCardProps) {
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [timeAgo, setTimeAgo] = React.useState("Recently");
  const [selectedFolderId, setSelectedFolderId] = React.useState<string>(folder?.id || "");
  const createdDate = new Date(createdAt);

  React.useEffect(() => {
    setSelectedFolderId(folder?.id || "");
  }, [folder?.id]);

  React.useEffect(() => {
    const daysDiff = Math.floor(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const nextTimeAgo =
      daysDiff === 0
        ? "Today"
        : daysDiff === 1
        ? "Yesterday"
        : `${daysDiff} days ago`;
    setTimeAgo(nextTimeAgo);
  }, [createdAt]);

  const { data: foldersData } = useQueryData(
    ["workspace-folders", workspaceId],
    () => getWorkspaceFolders(workspaceId)
  );
  const folders = ((foldersData as FolderProps)?.data || []).filter(
    (folderItem) => folderItem.id !== folder?.id
  );

  const { mutate: onDelete, isPending } = useMutationData(
    ["delete-video"],
    () => deleteVideo(id),
    [["user-videos", workspaceId], ["workspace-folders", workspaceId]],
    () => toast.success("Video deleted permanently")
  );

  const handleMoveVideo = async () => {
    const res = await moveVideoLocation(id, workspaceId, selectedFolderId);
    if (res.status === 200) {
      toast.success("Video moved successfully");
      setIsMoveOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user-videos", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-folders", workspaceId] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("folder-videos-"),
      });
      return;
    }

    toast.error("Failed to move video");
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("videoId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          draggable
          onDragStart={handleDragStart}
          className="group overflow-hidden cursor-pointer bg-card/70 relative border border-border flex flex-col rounded-3xl hover:scale-[1.02] hover:border-foreground/20 hover:shadow-xl transition-all duration-500 ease-out"
        >
          {processing && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full border-t-2 border-white animate-spin" />
              <p className="text-eyebrow text-foreground">Processing...</p>
            </div>
          )}
          <div className="absolute top-2 right-2 z-30 gap-x-3 hidden group-hover:flex">
            <EditVideo videoId={id} title={title || ""} description={description || ""} />
            <ShareModal
              videoId={id}
              trigger={
                <button className="rounded-full bg-background/80 backdrop-blur-md p-2 hover:bg-secondary border border-border transition-all shadow-lg active:scale-90">
                  <Share2 size={16} className="text-foreground" />
                </button>
              }
            />
          </div>
        <Link href={`/preview/${id}`} className="flex flex-col">
          <div className="h-44 w-full overflow-hidden relative group-hover:opacity-95 transition-opacity">
            {/* Thumbnail Placeholder */}
            <div className="absolute inset-0 bg-secondary/60" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-background/80 backdrop-blur-xl p-4 rounded-full border border-border shadow-2xl group-hover:scale-110 group-hover:bg-background transition-all duration-500">
                 <Play className="text-foreground fill-foreground ml-1" size={24} />
               </div>
            </div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3 bg-gradient-to-b from-transparent to-secondary/10">
            <h2 className="text-base md:text-lg font-semibold leading-tight text-foreground line-clamp-1 group-hover:translate-x-1 transition-transform">
              {title || "Untitled Video"}
            </h2>
          <div className="flex gap-x-2 items-center">
            <Avatar className="w-7 h-7">
              <AvatarImage src={user?.image as string} />
              <AvatarFallback>
                <User size={14} />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="capitalize text-xs font-medium text-foreground/80">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-caption flex items-center gap-1.5 mt-0.5">
                <span className="bg-secondary px-1.5 py-0.5 rounded">{timeAgo}</span>
                <span className="opacity-30">•</span>
                <span className="bg-secondary px-1.5 py-0.5 rounded font-semibold">{views} views</span>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-popover border-border text-popover-foreground backdrop-blur-3xl shadow-3xl rounded-2xl p-2 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
        <ContextMenuItem className="cursor-pointer hover:bg-secondary p-2.5 text-xs font-semibold rounded-xl transition-colors">
          <Link href={`/preview/${id}`} className="w-full">
            Open video
          </Link>
        </ContextMenuItem>
        <ContextMenuItem className="cursor-pointer hover:bg-secondary p-2.5 text-sm font-medium text-foreground rounded-xl transition-colors">
          <button
            className="w-full text-left"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditOpen(true);
            }}
          >
            Rename
          </button>
        </ContextMenuItem>
        <ContextMenuItem className="cursor-pointer hover:bg-secondary p-2.5 text-sm font-medium text-foreground rounded-xl transition-colors">
          <button
            className="w-full text-left"
            onClick={(e) => {
              e.stopPropagation();
              setIsMoveOpen(true);
            }}
          >
            Move
          </button>
        </ContextMenuItem>
        <ContextMenuItem 
          className="cursor-pointer hover:bg-secondary p-2.5 text-sm font-medium text-foreground rounded-xl transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_HOST_URL}/preview/${id}`);
          }}
        >
          Copy share link
        </ContextMenuItem>
        <ContextMenuItem className="cursor-pointer hover:bg-secondary p-2.5 text-sm font-medium text-foreground rounded-xl transition-colors">
          Download
        </ContextMenuItem>
        <div className="h-px bg-border/50 my-1.5 mx-1" />
        <ContextMenuItem 
          className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 p-2.5 text-sm font-bold rounded-xl transition-colors"
          onClick={() => onDelete({})}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
        </ContextMenuItem>
      </ContextMenuContent>
      <EditVideo
        videoId={id}
        title={title || ""}
        description={description || ""}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent className="bg-card border-border text-foreground rounded-2xl shadow-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Move Video</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select where this video should live.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <button
              onClick={() => setSelectedFolderId("")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                selectedFolderId === ""
                  ? "bg-foreground/10 border-foreground/30 text-foreground shadow-md"
                  : "bg-card border-border text-muted-foreground hover:border-foreground/20 hover:bg-secondary"
              }`}
            >
              <span className="font-semibold text-sm tracking-tight">Workspace root (no folder)</span>
              {selectedFolderId === "" && <div className="size-2.5 rounded-full bg-foreground" />}
            </button>
            {folders.map((folderItem) => (
              <button
                key={folderItem.id}
                onClick={() => setSelectedFolderId(folderItem.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                  selectedFolderId === folderItem.id
                    ? "bg-foreground/10 border-foreground/30 text-foreground shadow-md"
                    : "bg-card border-border text-muted-foreground hover:border-foreground/20 hover:bg-secondary"
                }`}
              >
                <span className="font-semibold text-sm tracking-tight">{folderItem.name}</span>
                {selectedFolderId === folderItem.id && <div className="size-2.5 rounded-full bg-foreground" />}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsMoveOpen(false)} className="rounded-xl h-11">
              Cancel
            </Button>
            <Button
              className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 rounded-xl font-bold"
              onClick={handleMoveVideo}
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContextMenu>
  );
}
