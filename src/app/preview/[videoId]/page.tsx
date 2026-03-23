import React from "react";
import { getVideoDetails } from "@/actions/video";
import { redirect } from "next/navigation";
import VideoPreviewContent from "./_components/video-preview-content";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let dbUser = null;
  
  if (user) {
    const { data: userData } = await supabase
      .from("User")
      .select("id, firstName, lastName, image")
      .eq("supabaseId", user.id)
      .single();
    dbUser = userData;
  }

  return <VideoPreviewContent video={video.data} currentUser={dbUser || undefined} />;
}
