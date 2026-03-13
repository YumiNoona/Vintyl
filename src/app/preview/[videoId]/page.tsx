import React from "react";
import { getVideoDetails } from "@/actions/video";
import { redirect } from "next/navigation";
import VideoPreviewContent from "./_components/video-preview-content";

export default async function VideoPreviewPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await getVideoDetails(videoId);

  if (video.status !== 200 || !video.data) {
    return redirect("/");
  }

  return <VideoPreviewContent video={video.data} />;
}
