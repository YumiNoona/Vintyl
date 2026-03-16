"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MonitorUp } from "lucide-react";
import { useRecording } from "@/context/RecordingContext";

export default function RecordPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const {
    isRecording,
    recordedVideo,
    startRecording,
  } = useRecording();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 mt-10">
      {!isRecording && !recordedVideo && (
        <div className="flex flex-col items-center text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="w-20 h-20 bg-purple-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 ring-1 ring-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
            <MonitorUp size={32} className="text-purple-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Async Video Recording</h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Record your screen and camera directly from your browser. Perfect for quick updates and team feedback.
          </p>
          
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 text-left my-8 flex gap-4 ring-1 ring-amber-500/5">
            <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-500/90 mb-1">Before you start</h4>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Ensure you've granted microphone and screen permissions. Browser recording works best on desktop versions of Chrome and Edge.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full">
             <Button 
               variant="outline" 
               className="flex-1 border-border bg-secondary/50 hover:bg-secondary h-14 rounded-2xl font-bold transition-all"
               onClick={() => router.push(`/dashboard/${workspaceId}`)}
             >
               Cancel
             </Button>
             <Button 
               onClick={startRecording} 
               className="flex-[2] bg-foreground text-background hover:bg-foreground/90 h-14 rounded-2xl font-bold gap-3 shadow-xl active:scale-95 transition-all"
             >
               <MonitorUp size={18} /> Start Recording
             </Button>
          </div>
        </div>
      )}

      {(isRecording || recordedVideo) && (
        <div className="flex flex-col items-center text-center max-w-sm animate-in zoom-in duration-500">
           <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
           <h2 className="text-xl font-bold">Active Recording Bridge</h2>
           <p className="text-muted-foreground text-sm mt-2">
             {isRecording ? "Recording in progress... Use the control panel at the bottom to stop." : "Preparing your preview..."}
           </p>
           <Button 
              variant="link" 
              className="mt-6 text-primary font-bold"
              onClick={() => router.push(`/dashboard/${workspaceId}`)}
           >
             Return to Dashboard
           </Button>
        </div>
      )}
    </div>
  );
}
