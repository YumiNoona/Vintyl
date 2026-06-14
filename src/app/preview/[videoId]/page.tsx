import React from "react";
import { getVideoDetails } from "@/actions/video";
import { redirect, notFound } from "next/navigation";
import VideoPreviewContent from "./_components/video-preview-content";
import { createClient } from "@/lib/supabase/server";

export default async function VideoPreviewPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth");
  }

  const video = await getVideoDetails(videoId);

  if (video.status !== 200 || !video.data) {
    return notFound();
  }

  const videoData = video.data as any;
  const mappedData = {
    ...videoData,
    user: videoData.User || videoData.user || null,
  };

  return <VideoPreviewContent video={mappedData} currentUser={user} />;
}
