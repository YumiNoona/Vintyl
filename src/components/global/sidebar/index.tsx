"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQueryData } from "@/hooks/useQueryData";
import { getWorkspaces } from "@/actions/workspace";
import { WorkspaceProps } from "@/types";
import Modal from "@/components/global/modal";
import { PlusCircle } from "lucide-react";
import Search from "@/components/global/search";
import {
  MENU_ITEMS,
} from "@/constants";
import SidebarItem from "./sidebar-item";

type SidebarProps = {
  activeWorkspaceId: string;
};

export default function Sidebar({ activeWorkspaceId }: SidebarProps) {
  const router = useRouter();

  const { data } = useQueryData(
    ["user-workspaces"],
    getWorkspaces
  );

  const { data: workspace } = data as WorkspaceProps;

  const onChangeActiveWorkspace = (value: string | null) => {
    if (value) router.push(`/dashboard/${value}`);
  };

  const currentWorkspace = workspace?.workspace?.find(
    (w) => w.id === activeWorkspaceId
  );

  return (
    <div
      className="bg-[#111111] flex-none relative p-4 h-full w-[250px] flex flex-col gap-4 items-center overflow-hidden"
    >
      <div className="bg-[#111111] p-4 gap-2 justify-center items-center mb-4 absolute top-0 left-0 right-0 flex">
        <Image
          src="/venus-logo.svg"
          alt="logo"
          width={40}
          height={40}
        />
        <p className="text-2xl">Venus</p>
      </div>

      <Select
        defaultValue={activeWorkspaceId}
        onValueChange={onChangeActiveWorkspace}
      >
        <SelectTrigger className="mt-16 text-neutral-400 bg-transparent">
          <SelectValue placeholder="Select a workspace" />
        </SelectTrigger>
        <SelectContent className="bg-[#111111] backdrop-blur-xl">
          <SelectGroup>
            <SelectLabel>Workspaces</SelectLabel>
            <Separator />
            {workspace?.workspace?.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
            {workspace?.members &&
              workspace.members.length > 0 &&
              workspace.members.map((member) =>
                member.workspace ? (
                  <SelectItem
                    key={member.workspace.id}
                    value={member.workspace.id}
                  >
                    {member.workspace.name}
                  </SelectItem>
                ) : null
              )}
          </SelectGroup>
        </SelectContent>
      </Select>

      {currentWorkspace?.type === "PUBLIC" && (
        <Modal
          trigger={
            <span className="text-sm cursor-pointer flex items-center justify-center bg-neutral-800/90 hover:bg-neutral-800/60 w-full rounded-sm p-[5px] gap-2">
              <PlusCircle
                size={15}
                className="text-neutral-800/90"
                fill="currentColor"
              />
              <span className="text-neutral-400 font-semibold text-xs">
                Invite to workspace
              </span>
            </span>
          }
          title="Invite to workspace"
          description="Invite other users to your workspace"
        >
          <Search workspaceId={activeWorkspaceId} />
        </Modal>
      )}

      <nav className="w-full">
        <ul>
          {MENU_ITEMS.map((item) => (
            <SidebarItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              href={`/dashboard/${activeWorkspaceId}${item.href}`}
              selected={item.title === "My Library"}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}
