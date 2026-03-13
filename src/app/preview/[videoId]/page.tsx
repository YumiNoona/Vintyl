import React from "react";
import { getVideoDetails } from "@/actions/video";
import { redirect } from "next/navigation";
import VideoPreviewContent from "./_components/video-preview-content";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";

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

  // Get current user for commenting
  const clerkUser = await currentUser();
  let dbUser = null;
  
  if (clerkUser) {
    dbUser = await client.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        image: true,
      }
    });
  }

  return <VideoPreviewContent video={video.data} currentUser={dbUser || undefined} />;
}
