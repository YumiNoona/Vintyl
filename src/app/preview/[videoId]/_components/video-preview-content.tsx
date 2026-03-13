"use client";

import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Eye, Calendar } from "lucide-react";
import { incrementVideoViews } from "@/actions/video";

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
    user: {
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      clerkId: string;
      trial: { trial: boolean } | null;
      subscription: { plan: "FREE" | "PRO" } | null;
    } | null;
  };
};

export default function VideoPreviewContent({
  video,
}: VideoPreviewContentProps) {
  useEffect(() => {
    incrementVideoViews(video.id);
  }, [video.id]);

  const createdDate = new Date(video.createdAt);

  return (
    <div className="min-h-screen bg-[#171717] text-white p-6 lg:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-neutral-900 rounded-xl overflow-hidden mb-6">
            <video
              preload="metadata"
              controls
              autoPlay
              className="w-full h-full"
              src={video.source}
            />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {video.title || "Untitled Video"}
          </h1>

          <div className="flex items-center gap-4 text-neutral-400 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{video.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{createdDate.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-xl mb-6">
            <Avatar className="w-10 h-10">
              <AvatarImage src={video.user?.image || ""} />
              <AvatarFallback>
                <User size={18} />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold capitalize">
                {video.user?.firstName} {video.user?.lastName}
              </p>
              <p className="text-xs text-neutral-400">
                {video.user?.subscription?.plan || "FREE"} Plan
              </p>
            </div>
          </div>

          {video.description && (
            <div className="p-4 bg-neutral-800/30 rounded-xl">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-neutral-400 text-sm whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {video.summary && (
            <div className="p-4 bg-neutral-800/40 rounded-xl">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                ✨ AI Summary
              </h3>
              <p className="text-neutral-400 text-sm">{video.summary}</p>
            </div>
          )}

          {video.processing && (
            <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-xl">
              <p className="text-amber-400 text-sm">
                ⏳ This video is still processing...
              </p>
            </div>
          )}

          <div className="p-4 bg-neutral-800/40 rounded-xl">
            <h3 className="font-semibold mb-3">Activity</h3>
            <p className="text-neutral-500 text-sm">
              Comments coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
