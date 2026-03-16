"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";

import { transcribeVideo } from "@/actions/video";
import { toast } from "sonner";

type RecordingContextType = {
  isRecording: boolean;
  recordedVideo: string | null;
  isUploading: boolean;
  videoId: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  setRecordedVideo: (url: string | null) => void;
  uploadVideo: (workspaceId: string, clerkId: string) => Promise<void>;
};

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        setRecordedVideo(url);
        setIsRecording(false);

        streamRef.current?.getTracks().forEach((track) => track.stop());
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setVideoId(null);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const uploadVideo = async (workspaceId: string, clerkId: string) => {
    if (!recordedVideo) return;
    setIsUploading(true);

    try {
      const response = await fetch(recordedVideo);
      const videoBlob = await response.blob();
      const fileName = `web-record-${Date.now()}.webm`;
      
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          contentType: videoBlob.type,
          workspaceId,
          clerkId,
        })
      });

      const data = await res.json();
      
      if (data.uploadUrl) {
        await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": videoBlob.type },
          body: videoBlob,
        });

        if (data.videoId) {
           setVideoId(data.videoId);
           transcribeVideo(data.videoId).catch(console.error);
           toast.success("Video uploaded successfully!");
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <RecordingContext.Provider
      value={{
        isRecording,
        recordedVideo,
        isUploading,
        videoId,
        startRecording,
        stopRecording,
        setRecordedVideo,
        uploadVideo,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
}
