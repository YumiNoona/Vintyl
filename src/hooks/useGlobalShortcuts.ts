import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutationData } from "@/hooks/useMutationData";
import { createFolder } from "@/actions/workspace";
import { toast } from "sonner";

export const useGlobalShortcuts = (workspaceId: string) => {
  const router = useRouter();
  const { mutate } = useMutationData(
    ["create-folder"],
    () => createFolder(workspaceId),
    "workspace-folders"
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // R to Record
      if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        // Since we decoupled the "Record" button into a Modal, programmatically opening it globally is complex.
        // We will default the 'R' shortcut to open the Web Recorder directly for frictionless fast interaction.
        router.push(`/dashboard/${workspaceId}/record`);
      }

      // F to Create Folder
      if (e.key.toLowerCase() === "f" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        mutate({});
        toast.success("New folder created");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [workspaceId, router, mutate]);
};
