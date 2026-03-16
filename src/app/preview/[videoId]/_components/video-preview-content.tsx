"use client";

import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Eye, Calendar, Share2 } from "lucide-react";
import { incrementVideoViews } from "@/actions/video";
import AISummaryButton from "./ai-summary-button";
import Comments from "./comments";
import ShareModal from "@/components/global/share-modal";

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
      clerkId: string;
      trial: { trial: boolean } | null;
      subscription: { plan: "FREE" | "PRO" } | null;
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

export default function VideoPreviewContent({
  video,
  currentUser,
}: VideoPreviewContentProps) {
  const hasTrackedView = useRef(false);

  const handlePlay = () => {
    if (!hasTrackedView.current) {
      incrementVideoViews(video.id);
      hasTrackedView.current = true;
    }
  };

  const createdDate = new Date(video.createdAt);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
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
              <h1 className="text-3xl font-bold text-neutral-100">
                {video.title || "Untitled Video"}
              </h1>
              <ShareModal
                videoId={video.id}
                trigger={
                  <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/20 active:scale-95">
                    <Share2 size={16} />
                    Share Recording
                  </button>
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
                   <span className="font-medium text-neutral-200 leading-none">{video.user?.firstName} {video.user?.lastName}</span>
                   <span className="text-[10px] text-neutral-500">{createdDate.toLocaleDateString()}</span>
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
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                AI Summary
              </div>
              {video.summary ? (
                 <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-sm text-neutral-300 leading-relaxed italic">
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
                {/* Simulated activity log */}
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
  );
}
