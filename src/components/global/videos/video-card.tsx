"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/global/loader";
import { Share2, User } from "lucide-react";

type VideoCardProps = {
  id: string;
  title: string | null;
  createdAt: Date;
  source: string;
  processing: boolean;
  workspaceId: string;
  user?: {
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  } | null;
  folder?: {
    id: string;
    name: string;
  } | null;
};

export default function VideoCard({
  id,
  title,
  createdAt,
  source,
  processing,
  workspaceId,
  user,
  folder,
}: VideoCardProps) {
  const createdDate = new Date(createdAt);
  const daysDiff = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeAgo =
    daysDiff === 0
      ? "Today"
      : daysDiff === 1
      ? "Yesterday"
      : `${daysDiff} days ago`;

  return (
    <Loader
      state={processing}
      className="flex justify-center items-center w-full min-h-[200px] border border-neutral-700 rounded-xl"
    >
      <div className="group overflow-hidden cursor-pointer bg-[#1D1D1D] relative border border-neutral-700 flex flex-col rounded-xl">
        <div className="absolute top-2 right-2 z-10 gap-x-3 hidden group-hover:flex">
          <button
            className="rounded-full bg-neutral-900/80 p-2 hover:bg-neutral-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_HOST_URL}/preview/${id}`
              );
            }}
          >
            <Share2 size={16} className="text-neutral-200" />
          </button>
        </div>
        <Link href={`/preview/${id}`} className="flex flex-col">
          <div className="h-36 w-full bg-neutral-800 flex items-center justify-center">
            <video
              preload="metadata"
              className="w-full h-full object-cover"
              src={`${process.env.NEXT_PUBLIC_HOST_URL}/api/video/${id}#t=1`}
            />
          </div>
          <div className="px-4 py-3 flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-neutral-200 line-clamp-1">
              {title || "Untitled"}
            </h2>
            <div className="flex gap-x-2 items-center">
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.image as string} />
                <AvatarFallback>
                  <User size={14} />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="capitalize text-xs text-neutral-400">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-neutral-500 text-xs">{timeAgo}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </Loader>
  );
}
