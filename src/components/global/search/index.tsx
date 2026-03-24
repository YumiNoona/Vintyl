"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/useSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { useMutationData } from "@/hooks/useMutationData";
import { inviteMembers } from "@/actions/workspace";

type SearchProps = {
  workspaceId: string;
};

export default function Search({ workspaceId }: SearchProps) {
  const { query, onSearchQuery, isFetching, onUsers } = useSearch(
    "get-users",
    "USERS"
  );

  const { mutate, isPending } = useMutationData(
    ["invite-member"],
    (data: { receiverId: string; email: string }) =>
      inviteMembers(workspaceId, data.receiverId, data.email),
    "user-workspaces"
  );

  return (
    <div className="flex flex-col gap-y-5">
      <div className="bg-neutral-900 border border-white/5 p-4 rounded-3xl flex items-center gap-x-4 shadow-2xl shadow-black focus-within:border-white/20 transition-all group mb-2">
        <Input
          onChange={onSearchQuery}
          value={query}
          className="bg-transparent border-none text-white placeholder:text-neutral-600 focus-visible:ring-0 h-8 font-black text-sm uppercase tracking-widest"
          placeholder="Type name or email..."
          type="text"
        />
      </div>

      {isFetching ? (
        <div className="flex flex-col gap-y-2">
          <Skeleton className="w-full h-10 rounded-xl" />
          <Skeleton className="w-full h-10 rounded-xl" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      ) : !onUsers ? (
        <p className="text-center text-sm text-muted-foreground italic font-medium">
          No users found
        </p>
      ) : (
        <div className="flex flex-col gap-y-3">
          {onUsers.map((user) => (
            <div
              key={user.id}
              className="flex gap-x-4 items-center border border-white/5 bg-white/[0.02] rounded-3xl p-5 transition-all hover:bg-white/[0.04] hover:border-white/10 group/item shadow-sm"
            >
              <Avatar className="w-12 h-12 border border-white/10 shadow-xl group-hover/item:scale-105 transition-transform">
                <AvatarImage src={user.image as string} />
                <AvatarFallback className="bg-neutral-900 text-white text-xs font-black">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-white font-black text-sm uppercase tracking-tight">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="lowercase text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                  {user.subscription?.plan} PLAN
                </p>
              </div>
              <div className="flex-1 flex justify-end items-center">
                <Button
                  onClick={() =>
                    mutate({
                      receiverId: user.id,
                      email: user.email!,
                    })
                  }
                  variant="secondary"
                  className="bg-white hover:bg-neutral-200 text-black font-black text-[10px] h-9 px-6 rounded-xl shadow-xl shadow-white/5 uppercase tracking-widest transition-all active:scale-95"
                >
                  <Loader state={isPending}>Invite</Loader>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
