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

  // Combine own + member workspaces, deduplicate by id
  const allWorkspaces = Array.from(
    new Map(
      [
        ...(workspace?.workspace || []),
        ...(workspace?.members?.map((m: any) => m.workspace).filter(Boolean) || []),
      ].map((w: any) => [w.id, w])
    ).values()
  );

  const currentWorkspace = allWorkspaces.find(
    (w: any) => w.id === activeWorkspaceId
  );

  const { data: notifications } = useQueryData(
    ["user-notifications"],
    getNotifications
  );
  const notificationCount =
    (notifications as any)?.data?._count?.notifications || 0;

  return (
    <div className="bg-sidebar flex-none relative h-full w-[264px] flex flex-col gap-6 overflow-hidden border-r border-sidebar-border p-4 text-sidebar-foreground transition-colors duration-300">
      {/* Logo ... */}
      <div className="flex items-center gap-3 px-2 mt-2">
        <Image
          src="/vintyl-logo.png"
          alt="logo"
          width={40}
          height={40}
          className="rounded-lg shadow-lg"
        />
        <p className="text-lg font-semibold tracking-tight">Vintyl</p>
      </div>

      {mounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="w-full bg-card/80 backdrop-blur-xl border border-border hover:border-foreground/20 hover:bg-card transition-all h-auto px-3 py-2.5 !ring-0 !ring-offset-0 focus:ring-0 focus:ring-offset-0 rounded-xl outline-none shadow-sm group text-left">
                  <div className="flex items-center justify-between w-full h-12 gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center font-semibold text-sm shrink-0">
                        {currentWorkspace?.name ? currentWorkspace.name.charAt(0).toUpperCase() : ""}
                      </div>
                      <div className="flex items-center justify-start min-w-0 flex-1 h-9">
                        <p className="text-sm font-semibold text-foreground truncate leading-none mt-[3px]">
                          {currentWorkspace?.name}
                        </p>
                      </div>
                    </div>
                    <ChevronsUpDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
              </button>
            }
          />
          <DropdownMenuContent className="w-[250px] bg-popover border-border backdrop-blur-xl p-2 relative z-[100] ml-2 rounded-2xl shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-eyebrow px-3 py-2">Your Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border my-1" />
              <div className="space-y-1 mt-1">
                {allWorkspaces.map((w: any) => (
                  <DropdownMenuItem
                    key={w.id}
                    onClick={() => onChangeActiveWorkspace(w.id)}
                    className={`cursor-pointer rounded-lg p-3 text-sm transition-all flex items-center gap-3 border border-transparent ${
                      w.id === activeWorkspaceId
                        ? "bg-foreground text-background font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border"
                    }`}
                  >
                    <div className={`size-6 rounded-lg flex items-center justify-center font-semibold text-xs ${
                      w.id === activeWorkspaceId ? "bg-background text-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {w.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="tracking-tight font-medium">{w.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border my-2" />
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem 
                onClick={() => setIsCreateOpen(true)}
                className="cursor-pointer flex gap-3 items-center text-foreground hover:bg-secondary focus:bg-secondary p-3 rounded-lg font-medium text-sm transition-all"
              >
                <div className="p-1.5 rounded-lg bg-secondary">
                  <PlusCircle size={14} />
                </div>
                <span>Create Workspace</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setRenameValue(currentWorkspace?.name || "");
                  setIsRenameOpen(true);
                }}
                className="cursor-pointer flex gap-3 items-center text-muted-foreground hover:text-foreground hover:bg-secondary focus:bg-secondary p-3 rounded-lg font-medium text-sm transition-all"
              >
                <div className="p-1.5 rounded-lg bg-secondary">
                  <PlusCircle size={14} className="rotate-45" />
                </div>
                Rename Workspace
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleteOpen(true)}
                className="cursor-pointer flex gap-3 items-center text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-600 p-3 rounded-lg font-medium text-sm transition-all"
              >
                <div className="p-1.5 rounded-lg bg-red-500/10">
                  <AlertTriangle size={14} />
                </div>
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
                  className="bg-muted/60 border-border focus:ring-2 focus:ring-primary/20 h-12 rounded-xl text-base font-medium"
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
                  className="bg-muted/60 border-border focus:ring-2 focus:ring-primary/20 h-12 rounded-xl text-base font-medium"
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
            <DialogContent className="bg-neutral-900 border-white/10 text-white rounded-[2rem] shadow-3xl p-8">
              <DialogHeader className="pt-2">
                <div className="flex flex-col items-center justify-center text-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-semibold tracking-tight text-white">Critical Action</DialogTitle>
                    <p className="text-eyebrow text-red-400 mt-1">This operation is irreversible</p>
                  </div>
                </div>
                <DialogDescription className="text-neutral-400 text-sm font-medium leading-relaxed bg-white/[0.02] p-5 text-center rounded-2xl border border-white/5">
                  Warning: Deleting this workspace will permanently lose <span className="text-white font-semibold underline">all</span> data, videos, and folders within it. Please confirm your decision.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center w-full">
                <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-xl h-12 w-full sm:w-auto px-8 font-medium text-neutral-400 hover:text-white text-sm">Cancel</Button>
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white h-12 w-full sm:w-auto px-8 rounded-xl font-semibold shadow-xl shadow-red-500/20 text-sm transition-colors"
                  onClick={() => onDelete({})}
                >
                  Delete Permanently
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {currentWorkspace?.type === "PUBLIC" && (
            <Modal
              trigger={
                <button className="text-sm cursor-pointer flex items-center justify-center bg-foreground text-background w-full rounded-xl p-3 gap-2 border border-border transition-all shadow-xl shadow-foreground/10 group hover:bg-foreground/90">
                  <PlusCircle
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-semibold tracking-tight text-sm">
                    Invite Members
                  </span>
                </button>
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
          className="flex items-center gap-3 p-3 rounded-xl bg-card text-foreground border border-border hover:border-foreground/20 transition-all font-medium group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0">
             <Download size={16} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="text-eyebrow leading-none">Download</span>
            <span className="text-sm font-medium tracking-tight">Desktop app</span>
          </div>
        </a>
      </div>
    </div>
  );
}
