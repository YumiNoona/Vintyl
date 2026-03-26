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
  uploadVideo: (workspaceId: string, userId: string, folderId?: string) => Promise<void>;
};

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export function RecordingProvider({ children, plan = "FREE" }: { children: ReactNode; plan?: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const constraints = {
        video: plan === "FREE" ? { width: { max: 1280 }, height: { max: 720 } } : true,
        audio: true,
      } as DisplayMediaStreamOptions;

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

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

  const uploadVideo = async (workspaceId: string, userId: string, folderId?: string) => {
    if (!recordedVideo) return;
    setIsUploading(true);

    try {
      const response = await fetch(recordedVideo);
      const videoBlob = await response.blob();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileName = `vintyl-${userId}-${Date.now()}-${randomSuffix}.webm`;
      
      console.log("🚀 Starting upload to /api/upload...");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          contentType: videoBlob.type,
          workspaceId,
          userId,
          folderId,
        })
      });

      if (!res.ok) {
        console.error(`❌ Upload API failed: ${res.status} ${res.statusText}`);
        const errorData = await res.json().catch(() => ({}));
        console.error("Error data:", errorData);
        throw new Error(errorData.error || "Upload API failed");
      }

      const data = await res.json();
      console.log("✅ Upload URL received:", data.uploadUrl ? "Yes" : "No");
      
      if (data.uploadUrl) {
        console.log("📤 Putting blob to S3...");
        const putRes = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": videoBlob.type },
          body: videoBlob,
        });

        if (!putRes.ok) {
          console.error(`❌ S3 PUT failed: ${putRes.status} ${putRes.statusText}`);
          throw new Error("Failed to upload binary to storage");
        }

        if (data.videoId) {
            setVideoId(data.videoId);
            transcribeVideo(data.videoId).catch(console.error);
            toast.success("Video uploaded successfully!");
        }
      }
    } catch (error: any) {
      console.error("🚨 UPLOAD CRITICAL ERROR:", error);
      toast.error(`Export failed: ${error.message || "Network Error"}`);
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
