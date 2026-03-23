"use client";

import React, { useEffect, useState } from "react";
import { useRecording } from "@/context/RecordingContext";
import RecordingOverlay from "./recording-overlay";
import RecordPreview from "@/components/recording/record-preview";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

export default function GlobalRecordingEffects() {
  const { 
    recordedVideo, 
    isUploading, 
    videoId, 
    uploadVideo, 
    setRecordedVideo 
  } = useRecording();
  const [userId, setUserId] = useState<string | null>(null);
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  return (
    <>
      <RecordingOverlay />
      
      {recordedVideo && (
        <RecordPreview 
          video={recordedVideo}
          onUpload={(folderId) => userId && uploadVideo(workspaceId, userId, folderId)}
          onDiscard={() => {
            setRecordedVideo(null);
          }}
          isUploading={isUploading}
          videoId={videoId || undefined}
          workspaceId={workspaceId}
        />
      )}
    </>
  );
}
