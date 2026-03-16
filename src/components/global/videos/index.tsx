"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQueryData } from "@/hooks/useQueryData";
import { getAllUserVideos } from "@/actions/workspace";
import { VideosProps } from "@/types";
import VideoCard from "./video-card";
import { VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type VideoListProps = {
  workspaceId: string;
  folderId?: string;
  videosKey?: string;
};

export default function VideoList({
  workspaceId,
  folderId,
  videosKey = "user-videos",
}: VideoListProps) {
  const router = useRouter();
  const { data: videoData, isFetched } = useQueryData(
    [videosKey],
    () => getAllUserVideos(folderId || workspaceId)
  );

  const { status, data: videos } = (videoData as VideosProps) || { status: 404, data: [] };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-xl font-bold tracking-tight">Videos</h2>
      </div>

      {!isFetched ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-full h-[240px] bg-secondary/50 rounded-xl border border-border overflow-hidden flex flex-col"
            >
              <div className="h-40 bg-muted animate-pulse" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : status === 200 && videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              createdAt={video.createdAt}
              source={video.source}
              processing={video.processing}
              workspaceId={workspaceId}
              user={video.User}
              folder={video.Folder}
            />
          ))}
        </div>
      ) : (
        <div className="w-full flex justify-center items-center flex-col gap-6 py-24 bg-secondary/20 border-2 border-border border-dashed rounded-[2rem] transition-colors duration-300">
          <div className="bg-secondary p-6 rounded-full text-muted-foreground shadow-inner ring-1 ring-border">
            <VideoOff size={36} strokeWidth={1.5} />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-xl font-bold text-foreground">
              No videos yet
            </h3>
            <p className="text-sm text-muted-foreground mt-2 mb-8 leading-relaxed">
              Capture your first masterpiece or invite your team to start collaborating in this space.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => {
                  router.push(`/dashboard/${workspaceId}/record`);
                }}
                className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 h-11 px-6 rounded-xl font-bold shadow-lg transition-all active:scale-95"
              >
                Record Video
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-border bg-background hover:bg-secondary h-11 px-6 rounded-xl font-bold shadow-sm transition-all"
                onClick={() => {
                  router.push(`/dashboard/${workspaceId}/members`);
                }}
              >
                Invite Members
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
