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
      <Input
        onChange={onSearchQuery}
        value={query}
        className="bg-transparent border-2 outline-none"
        placeholder="Search for a user..."
        type="text"
      />

      {isFetching ? (
        <div className="flex flex-col gap-y-2">
          <Skeleton className="w-full h-8 rounded-xl" />
          <Skeleton className="w-full h-8 rounded-xl" />
          <Skeleton className="w-full h-8 rounded-xl" />
        </div>
      ) : !onUsers ? (
        <p className="text-center text-sm text-[#a4a4a4]">
          No users found
        </p>
      ) : (
        <div className="flex flex-col gap-y-2">
          {onUsers.map((user) => (
            <div
              key={user.id}
              className="flex gap-x-3 items-center border-2 rounded-xl p-3"
            >
              <Avatar>
                <AvatarImage src={user.image as string} />
                <AvatarFallback>
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <h3 className="text-bold text-lg capitalize">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="lowercase text-xs bg-white px-2 rounded-lg text-[#1e1e1e]">
                  {user.subscription?.plan}
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
                  variant="default"
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
