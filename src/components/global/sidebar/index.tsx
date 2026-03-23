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
import { PlusCircle, ChevronsUpDown } from "lucide-react";
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
    "user-workspaces",
    () => {
      setIsRenameOpen(false);
      toast.success("Workspace renamed");
    }
  );

  const { mutate: onDelete } = useMutationData(
    ["delete-workspace"],
    () => deleteWorkspace(activeWorkspaceId),
    "user-workspaces",
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

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="w-full bg-secondary/50 border border-border hover:bg-secondary transition-all h-auto p-3 !ring-0 !ring-offset-0 focus:ring-0 focus:ring-offset-0 rounded-xl outline-none shadow-sm group">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-7 h-7 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-purple-500/20">
                    {currentWorkspace?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <p className="text-sm font-bold text-foreground truncate">
                      {currentWorkspace?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter font-black">
                      {currentWorkspace?.type} Workspace
                    </p>
                  </div>
                </div>
                <ChevronsUpDown size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </button>
          }
        />
      {mounted && (
        <DropdownMenuContent className="w-[230px] bg-popover border-border backdrop-blur-2xl p-2 relative z-[100] ml-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground px-3 py-2 uppercase font-black tracking-widest opacity-70">Your Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50 my-1" />
            {workspace?.workspace?.map((w) => (
              <DropdownMenuItem
                key={w.id}
                onClick={() => onChangeActiveWorkspace(w.id)}
                className={`cursor-pointer rounded-lg p-2.5 text-sm transition-all ${w.id === activeWorkspaceId ? "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                {w.name}
              </DropdownMenuItem>
            ))}
            {workspace?.members &&
              workspace.members.length > 0 &&
              workspace.members.map((member) =>
                member.workspace ? (
                  <DropdownMenuItem
                    key={member.workspace.id}
                    onClick={() => onChangeActiveWorkspace(member.workspace.id)}
                    className={`cursor-pointer rounded-lg p-2.5 text-sm transition-all ${member.workspace.id === activeWorkspaceId ? "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                  >
                    {member.workspace.name}
                  </DropdownMenuItem>
                ) : null
              )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/50 my-2" />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => setIsCreateOpen(true)}
              className="cursor-pointer flex gap-2 items-center text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 focus:bg-purple-500/10 p-2.5 rounded-lg font-bold"
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
      )}
      </DropdownMenu>

      {/* Modals */}
      {/* Modals */}
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
        <DialogContent className="bg-card border-border text-card-foreground rounded-2xl shadow-3xl">
          <DialogHeader>
            <div className="flex items-center gap-4 text-red-500 mb-4 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              <AlertTriangle size={32} />
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">Critical Action</DialogTitle>
                <p className="text-xs text-red-500/70 font-bold uppercase mt-1">This operation is irreversible</p>
              </div>
            </div>
            <DialogDescription className="text-foreground text-sm font-medium leading-relaxed bg-secondary/50 p-4 rounded-xl border border-border">
              Warning: Deleting this workspace will permanently lose <span className="text-red-500 font-black underline">ALL</span> data, videos, and folders within it. Please confirm your decision.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-xl h-11 font-bold">Cancel</Button>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 h-11 px-8 rounded-xl font-black shadow-lg shadow-red-500/20 uppercase tracking-widest text-xs"
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
            <span className="text-sm cursor-pointer flex items-center justify-center bg-secondary/80 hover:bg-secondary w-full rounded-xl p-3 gap-2 border border-border transition-all shadow-sm group">
              <PlusCircle
                size={16}
                className="text-muted-foreground group-hover:text-foreground transition-colors"
              />
              <span className="text-muted-foreground group-hover:text-foreground font-bold transition-colors">
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
          className="flex items-center gap-3 p-3 rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all font-bold group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
             <Image src="/vintyl-logo.png" alt="icon" width={20} height={20} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs leading-none">Download</span>
            <span className="text-[10px] opacity-70">Vintyl Desktop</span>
          </div>
        </a>
      </div>
    </div>
  );
}
