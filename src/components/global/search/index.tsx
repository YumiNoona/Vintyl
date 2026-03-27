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
      <div className="bg-muted/50 border border-border p-4 rounded-3xl flex items-center gap-x-4 shadow-xl focus-within:border-foreground/20 transition-all group mb-2">
        <Input
          onChange={onSearchQuery}
          value={query}
          className="bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 h-8 font-semibold text-sm tracking-wide"
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
              className="flex gap-x-4 items-center border border-border bg-card/60 rounded-3xl p-5 transition-all hover:bg-card hover:border-foreground/20 group/item shadow-sm"
            >
              <Avatar className="w-12 h-12 border border-border shadow-xl group-hover/item:scale-105 transition-transform">
                <AvatarImage src={user.image as string} />
                <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-foreground font-semibold text-sm tracking-tight">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
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
                  className="bg-foreground hover:bg-foreground/90 text-background font-semibold text-xs h-9 px-6 rounded-xl shadow-lg uppercase tracking-wide transition-all active:scale-95"
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
