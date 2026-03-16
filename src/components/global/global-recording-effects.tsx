"use client";

import React from "react";
import { useRecording } from "@/context/RecordingContext";
import RecordingOverlay from "./recording-overlay";
import RecordPreview from "@/components/recording/record-preview";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function GlobalRecordingEffects() {
  const { 
    isRecording, 
    recordedVideo, 
    isUploading, 
    videoId, 
    uploadVideo, 
    setRecordedVideo 
  } = useRecording();
  const { user } = useUser();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <>
      <RecordingOverlay />
      
      {recordedVideo && (
        <RecordPreview 
          video={recordedVideo}
          onUpload={(folderId) => user && uploadVideo(workspaceId, user.id, folderId)}
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
