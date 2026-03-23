"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/global/loader";
import { Share2, User, Play, Video } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import ShareModal from "../share-modal";
import EditVideo from "./edit-video";
import { useMutationData } from "@/hooks/useMutationData";
import { deleteVideo } from "@/actions/workspace";
import { toast } from "sonner";

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
  const createdDate = new Date(createdAt);
  const daysDiff = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeAgo =
    daysDiff === 0
      ? "Today"
      : daysDiff === 1
      ? "Yesterday"
      : `${daysDiff} days ago`;

  const { mutate: onDelete, isPending } = useMutationData(
    ["delete-video"],
    () => deleteVideo(id),
    "user-videos",
    () => toast.success("Video deleted permanently")
  );

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
          className="group overflow-hidden cursor-pointer bg-card/40 relative border-2 border-border flex flex-col rounded-2xl hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 ease-out"
        >
          {processing && (
            <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full border-t-2 border-purple-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Processing...</p>
            </div>
          )}
          <div className="absolute top-2 right-2 z-30 gap-x-3 hidden group-hover:flex">
            <EditVideo
              videoId={id}
              title={title || ""}
              description={description || ""}
            />
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
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted mix-blend-overlay" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-300">
                 <Play className="text-white fill-white ml-1" size={20} />
               </div>
            </div>
            <div className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-card/70 backdrop-blur-sm rounded-md text-[10px] font-medium text-foreground">
                00:00
            </div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3 bg-gradient-to-b from-transparent to-secondary/10">
            <h2 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
              <p className="capitalize text-xs font-bold text-foreground/80">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-muted-foreground text-[10px] font-medium flex items-center gap-1.5 mt-0.5">
                <span className="bg-secondary px-1.5 py-0.5 rounded">{timeAgo}</span>
                <span className="opacity-30">•</span>
                <span className="bg-secondary px-1.5 py-0.5 rounded font-black">{views} VIEWS</span>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-popover border-border backdrop-blur-2xl shadow-2xl rounded-2xl p-2 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
        <ContextMenuItem className="cursor-pointer hover:bg-secondary p-2.5 text-sm font-medium text-foreground rounded-xl transition-colors">
          <Link href={`/preview/${id}`} className="w-full">
            Open video
          </Link>
        </ContextMenuItem>
        <ContextMenuItem className="cursor-pointer hover:bg-secondary p-2.5 text-sm font-medium text-foreground rounded-xl transition-colors">
          Rename
        </ContextMenuItem>
        <ContextMenuItem className="cursor-pointer hover:bg-secondary p-2.5 text-sm font-medium text-foreground rounded-xl transition-colors">
          Move
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
    </ContextMenu>
  );
}
