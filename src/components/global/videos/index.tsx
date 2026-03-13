"use client";

import React from "react";
import { useQueryData } from "@/hooks/useQueryData";
import { getAllUserVideos } from "@/actions/workspace";
import { VideosProps } from "@/types";
import VideoCard from "./video-card";

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
  const { data: videoData, isFetched } = useQueryData(
    [videosKey],
    () => getAllUserVideos(folderId || workspaceId)
  );

  const { status, data: videos } = videoData as VideosProps;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[#BdBdBd] text-xl">Videos</h2>
      {isFetched && status === 200 ? (
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
        <p className="text-neutral-500 text-sm">
          {isFetched ? "No videos in this workspace" : "Loading..."}
        </p>
      )}
    </div>
  );
}
