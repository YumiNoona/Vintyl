"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useQueryData } from "@/hooks/useQueryData";
import { getWorkspaces } from "@/actions/workspace";
import { getNotifications } from "@/actions/user";
import { WorkspaceProps } from "@/types";
import Modal from "@/components/global/modal";
import { PlusCircle, ChevronsUpDown, Download } from "lucide-react";
import Search from "@/components/global/search";
import { MENU_ITEMS } from "@/constants";
import SidebarItem from "./sidebar-item";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useMutationData } from "@/hooks/useMutationData";
import { 
  createWorkspace, 
  renameWorkspace, 
  deleteWorkspace 
} from "@/actions/workspace";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type SidebarProps = {
  activeWorkspaceId: string;
};

export default function Sidebar({ activeWorkspaceId }: SidebarProps) {
  const router = useRouter();
  useGlobalShortcuts(activeWorkspaceId);

  const { data } = useQueryData(
    ["user-workspaces"],
    getWorkspaces
  );

  const [mounted, setMounted] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState("");
  const [renameValue, setRenameValue] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: workspace } = data as WorkspaceProps;

  const { mutate: onCreate } = useMutationData(
    ["create-workspace"],
    (data: { name: string }) => createWorkspace(data.name),
    "user-workspaces",
    () => {
      setIsCreateOpen(false);
      setNewWorkspaceName("");
    }
  );

  const { mutate: onRename } = useMutationData(
    ["rename-workspace"],
    (data: { name: string }) => renameWorkspace(activeWorkspaceId, data.name),
    ["user-workspaces"]
  );

  const { mutate: onDelete } = useMutationData(
    ["delete-workspace"],
    () => deleteWorkspace(activeWorkspaceId),
    ["user-workspaces"],
    () => {
      setIsDeleteOpen(false);
      toast.success("Workspace deleted");
      // Redirect to first available workspace or auth if none
      if (workspace?.workspace && workspace.workspace.length > 1) {
        const remaining = workspace.workspace.filter(w => w.id !== activeWorkspaceId);
        router.push(`/dashboard/${remaining[0].id}`);
      } else {
        router.push("/dashboard");
      }
    }
  );

  const onChangeActiveWorkspace = (value: string | null) => {
    if (value) router.push(`/dashboard/${value}`);
  };

  const currentWorkspace = workspace?.workspace?.find(
    (w) => w.id === activeWorkspaceId
  );

  // Combine own + member workspaces, deduplicate by id
  const allWorkspaces = Array.from(
    new Map(
      [
        ...(workspace?.workspace || []),
        ...(workspace?.members?.map((m: any) => m.workspace).filter(Boolean) || []),
      ].map((w: any) => [w.id, w])
    ).values()
  );

  const { data: notifications } = useQueryData(
    ["user-notifications"],
    getNotifications
  );
  const notificationCount =
    (notifications as any)?.data?._count?.notifications || 0;

  return (
    <div className="bg-sidebar flex-none relative h-full w-[260px] flex flex-col gap-6 overflow-hidden border-r border-sidebar-border p-4 text-sidebar-foreground transition-colors duration-300">
      {/* Logo ... */}
      <div className="flex items-center gap-3 px-2 mt-2">
        <Image
          src="/vintyl-logo.png"
          alt="logo"
          width={40}
          height={40}
          className="rounded-lg shadow-lg"
        />
        <p className="text-2xl font-black tracking-tighter">Vintyl</p>
      </div>

      {mounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="w-full bg-neutral-900 border border-white/5 hover:border-white/20 transition-all h-auto p-3 !ring-0 !ring-offset-0 focus:ring-0 focus:ring-offset-0 rounded-xl outline-none shadow-sm group">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-[10px] shrink-0">
                        {currentWorkspace?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start truncate text-left">
                        <p className="text-xs font-black text-white truncate uppercase tracking-tight">
                          {currentWorkspace?.name}
                        </p>
                        <p className="text-[9px] text-neutral-500 truncate uppercase tracking-widest font-black">
                          {currentWorkspace?.type} Workspace
                        </p>
                      </div>
                    </div>
                    <ChevronsUpDown size={14} className="text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
              </button>
            }
          />
          <DropdownMenuContent className="w-[230px] bg-popover border-border backdrop-blur-2xl p-2 relative z-[100] ml-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] text-muted-foreground px-3 py-2 uppercase font-black tracking-widest opacity-70">Your Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50 my-1" />
              {allWorkspaces.map((w: any) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => onChangeActiveWorkspace(w.id)}
                  className={`cursor-pointer rounded-lg p-2.5 text-xs transition-all ${
                    w.id === activeWorkspaceId
                      ? "bg-white text-black font-black"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="uppercase tracking-tight font-black">{w.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/50 my-2" />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => setIsCreateOpen(true)}
                className="cursor-pointer flex gap-2 items-center text-white hover:bg-white/5 focus:bg-white/5 p-2.5 rounded-lg font-black uppercase tracking-widest text-[10px]"
              >
                <PlusCircle size={14} />
                <span>Create Workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setRenameValue(currentWorkspace?.name || "");
                  setIsRenameOpen(true);
                }}
                className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-secondary p-2.5 rounded-lg font-medium"
              >
                Rename Workspace
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleteOpen(true)}
                className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-600 p-2.5 rounded-lg font-medium"
              >
                Delete Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-full h-14 bg-secondary/20 rounded-xl animate-pulse" />
      )}

      {/* Modals and Dialogs - Only interactive on Client */}
      {mounted && (
        <>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="bg-card border-border text-card-foreground rounded-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create Workspace</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Personal workspaces are free. Public (Team) workspaces require a PRO plan.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <Input
                  placeholder="Workspace Name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="bg-secondary/50 border-border focus:ring-2 focus:ring-purple-500/20 h-12 rounded-xl text-lg font-medium"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-11 font-bold">Cancel</Button>
                <Button 
                  className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 rounded-xl font-bold shadow-lg shadow-foreground/10"
                  onClick={() => onCreate({ name: newWorkspaceName })}
                  disabled={!newWorkspaceName}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
            <DialogContent className="bg-card border-border text-card-foreground rounded-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Rename Workspace</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Change the name of your current workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <Input
                  placeholder="New Workspace Name"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="bg-secondary/50 border-border focus:ring-2 focus:ring-purple-500/20 h-12 rounded-xl text-lg font-medium"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsRenameOpen(false)} className="rounded-xl h-11 font-bold">Cancel</Button>
                <Button 
                  className="bg-foreground text-background hover:bg-foreground/90 h-11 px-8 rounded-xl font-bold shadow-lg shadow-foreground/10"
                  onClick={() => onRename({ name: renameValue })}
                  disabled={!renameValue || renameValue === currentWorkspace?.name}
                >
                  Rename
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="bg-neutral-900 border-white/10 text-white rounded-3xl shadow-3xl">
              <DialogHeader>
                <div className="flex items-center gap-4 text-white mb-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <AlertTriangle size={32} />
                  <div>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Critical Action</DialogTitle>
                    <p className="text-[10px] text-neutral-500 font-black uppercase mt-1">This operation is irreversible</p>
                  </div>
                </div>
                <DialogDescription className="text-neutral-400 text-sm font-medium leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  Warning: Deleting this workspace will permanently lose <span className="text-white font-black underline">ALL</span> data, videos, and folders within it. Please confirm your decision.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-xl h-11 font-bold text-neutral-500 hover:text-white">Cancel</Button>
                <Button 
                  variant="destructive"
                  className="bg-white hover:bg-neutral-200 text-black h-11 px-8 rounded-xl font-black shadow-xl shadow-white/5 uppercase tracking-widest text-[10px]"
                  onClick={() => onDelete({})}
                >
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {currentWorkspace?.type === "PUBLIC" && (
            <Modal
              trigger={
                <span className="text-sm cursor-pointer flex items-center justify-center bg-white text-black w-full rounded-xl p-3 gap-2 border border-white/10 transition-all shadow-xl shadow-white/5 group hover:bg-neutral-200">
                  <PlusCircle
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-black uppercase tracking-widest text-[10px]">
                    Invite Members
                  </span>
                </span>
              }
              title="Invite to workspace"
              description="Invite other users to your workspace"
            >
              <Search workspaceId={activeWorkspaceId} />
            </Modal>
          )}
        </>
      )}

      <nav className="w-full flex-1">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <SidebarItem
              key={item.title}
              icon={item.icon}
              title={
                item.title === "Activity" && notificationCount > 0
                  ? `Activity (${notificationCount})`
                  : item.title
              }
              href={`/dashboard/${activeWorkspaceId}${item.href}`}
            />
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-2 pb-4">
        <a 
          href="/download/vintyl-desktop.exe" 
          download
          className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 text-white border border-white/5 hover:border-white/20 transition-all font-black group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0">
             <Download size={16} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] leading-none uppercase tracking-widest text-neutral-500">Download</span>
            <span className="text-xs uppercase tracking-tight">Desktop App</span>
          </div>
        </a>
      </div>
    </div>
  );
}
