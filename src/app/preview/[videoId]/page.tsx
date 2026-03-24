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

  // Verify session FIRST — data failure must not masquerade as auth failure
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth");
  }

  const video = await getVideoDetails(videoId);

  // Show 404 — not a redirect to auth — when video is missing
  if (video.status !== 200 || !video.data) {
    return notFound();
  }

  let dbUser = null;
  const { data: userData } = await supabase
    .from("User")
    .select("id, firstName, lastName, image")
    .eq("supabaseId", user.id)
    .single();
  dbUser = userData;

  return <VideoPreviewContent video={video.data} currentUser={dbUser || undefined} />;
}
