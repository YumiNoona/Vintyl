"use client";

import React, { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Eye, Calendar, Share2, Code, ChevronLeft } from "lucide-react";
import { incrementVideoViews } from "@/actions/video";
import AISummaryButton from "./ai-summary-button";
import Comments from "./comments";
import ShareModal from "@/components/global/share-modal";
import EditVideo from "@/components/global/videos/edit-video";
import { useRouter } from "next/navigation";

type VideoPreviewContentProps = {
  video: {
    id: string;
    title: string | null;
    description: string | null;
    source: string;
    views: number;
    createdAt: Date;
    processing: boolean;
    summary: string | null;
    transcript: string | null;
    user: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      supabaseId: string;
      trial: { trial: boolean } | null;
      subscription: { plan: "FREE" | "PRO" | "TEAM" | "STANDARD" | "ENTERPRISE" } | null;
    } | null;
  };
  currentUser?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
};

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListRestart, StickyNote, Activity as ActivityIcon, Send, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import EmbedModal from "@/components/global/embed-modal";

export default function VideoPreviewContent({
  video,
  currentUser,
}: VideoPreviewContentProps) {
  const router = useRouter();
  const hasTrackedView = useRef(false);
 
   useEffect(() => {
     if (!hasTrackedView.current) {
       incrementVideoViews(video.id);
       hasTrackedView.current = true;
     }
   }, [video.id]);

  const handlePlay = () => {};

  const createdDate = new Date(video.createdAt);
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";

  if (isEmbed) {
    return (
      <div className="w-full h-full bg-black overflow-hidden flex items-center justify-center">
        <video
          preload="metadata"
          controls
          autoPlay
          onPlay={handlePlay}
          className="w-full h-full object-contain"
          src={video.source}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group mb-2"
        >
          <div className="p-1.5 rounded-lg bg-neutral-900 border border-white/5 group-hover:border-white/10 group-hover:bg-neutral-800 transition-all">
            <ChevronLeft size={18} />
          </div>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content: Video & Details */}
          <div className="lg:col-span-3 space-y-8">
            <div className="aspect-video bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group">
              <video
                preload="metadata"
                controls
                autoPlay
                onPlay={handlePlay}
                className="w-full h-full object-contain"
                src={video.source}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                  {video.title || "Untitled Video"}
                </h1>
                {currentUser?.id === video.user?.supabaseId && (
                  <div className="pt-1">
                    <EditVideo
                      videoId={video.id}
                      title={video.title || ""}
                      description={video.description || ""}
                    />
                  </div>
                )}
                <ShareModal
                  videoId={video.id}
                  trigger={
                    <button className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-xl shadow-white/5 active:scale-95">
                      <Share2 size={16} />
                      Share Video
                    </button>
                  }
                />
                <EmbedModal
                  videoId={video.id}
                  trigger={
                    <span className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all border border-white/5 cursor-pointer active:scale-95">
                      <Code size={16} />
                      Embed
                    </span>
                  }
                />
              </div>

              <div className="flex items-center gap-6 text-neutral-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={video.user?.image || ""} />
                    <AvatarFallback><User size={14} /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                     <span className="font-bold text-white leading-none text-sm">{video.user?.firstName} {video.user?.lastName}</span>
                     <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">{createdDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/5" />
                <div className="flex items-center gap-1.5">
                  <Eye size={16} className="text-neutral-500" />
                  <span>{video.views} views</span>
                </div>
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Comments Section Below Video */}
            <div className="pt-4">
              <Comments videoId={video.id} user={currentUser} />
            </div>
          </div>

          {/* Sidebar: AI Insights & Tabs */}
          <div className="lg:col-span-1 border-l border-white/5 pl-8 space-y-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid grid-cols-3 bg-neutral-900/50 border border-white/5 p-1 rounded-xl">
                <TabsTrigger value="summary" className="data-[state=active]:bg-neutral-800 rounded-lg py-1.5"><StickyNote size={14} /></TabsTrigger>
                <TabsTrigger value="transcript" className="data-[state=active]:bg-neutral-800 rounded-lg py-1.5"><ListRestart size={14} /></TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-neutral-800 rounded-lg py-1.5"><ActivityIcon size={14} /></TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-6 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  AI Summary
                </div>
                {video.summary ? (
                   <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl text-sm text-neutral-400 leading-relaxed font-bold">
                     "{video.summary}"
                   </div>
                ) : (
                   <AISummaryButton videoId={video.id} />
                )}
              </TabsContent>

              <TabsContent value="transcript" className="mt-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-neutral-400 font-semibold text-sm mb-4">
                  Transcript
                </div>
                {video.transcript ? (
                  <div className="text-sm text-neutral-400 leading-relaxed max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    <p>{video.transcript}</p>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl">
                     <p className="text-neutral-600 text-xs italic">No transcript available yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-neutral-400 font-semibold text-sm mb-4">
                  Recent Activity
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-900/40 rounded-xl border border-white/5 flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Eye size={14}/></div>
                     <div>
                        <p className="text-xs text-neutral-300">Global View</p>
                        <p className="text-[10px] text-neutral-500">Video viewed by a visitor</p>
                     </div>
                  </div>
                  <div className="p-3 bg-neutral-900/40 rounded-xl border border-white/5 flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400"><Send size={14}/></div>
                     <div>
                        <p className="text-xs text-neutral-300">New Comment</p>
                        <p className="text-[10px] text-neutral-500">Activity logged 2h ago</p>
                     </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {video.processing && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                 <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                 <p className="text-xs text-amber-500 leading-snug">
                   AI is currently processing this video to generate high-fidelity transcripts and summaries.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
