"use client";

import React from "react";
import { useZodForm } from "@/hooks/useZodForm";
import { useMutationData } from "@/hooks/useMutationData";
import { editVideoInfo } from "@/actions/workspace";
import { z } from "zod";
import Modal from "@/components/global/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const editVideoInfoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type Props = {
  videoId: string;
  title: string;
  description: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const EditVideo = ({
  videoId,
  title,
  description,
  trigger,
  open,
  onOpenChange,
}: Props) => {
  const { mutate, isPending } = useMutationData(
    ["edit-video"],
    (data: { title: string; description: string }) =>
      editVideoInfo(videoId, data.title, data.description),
    [["preview-video", videoId], ["user-videos"]]
  );

  const { register, onFormSubmit, errors } = useZodForm(
    editVideoInfoSchema,
    mutate,
    { title, description }
  );

  const content = (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <Label>Title</Label>
          <Input
            {...register("title")}
            placeholder="Video Title"
            className="bg-muted/60 border-border focus-visible:ring-foreground/20 h-11 rounded-xl font-medium text-foreground"
          />
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title.message as string}</p>
          )}
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Description</Label>
          <Textarea
            {...register("description")}
            placeholder="Video Description"
            rows={5}
            className="bg-muted/60 border-border focus-visible:ring-foreground/20 rounded-xl font-medium text-foreground resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description.message as string}</p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-foreground hover:bg-foreground/90 text-background font-semibold h-12 rounded-2xl shadow-xl shadow-foreground/10 text-sm mt-2 transition-all"
          disabled={isPending}
        >
          {isPending ? "Updating Video..." : "Save Changes"}
        </Button>
      </form>
  );

  if (typeof open === "boolean" && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl bg-card border-border backdrop-blur-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Rename & Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your video title and description for clarity.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Modal
      title="Rename & Details"
      description="Update your video title and description for clarity."
      trigger={
        trigger || (
          <Button variant="ghost" className="rounded-full shadow-xl bg-card border border-border p-2.5 hover:bg-secondary text-foreground transition-all transform active:scale-90">
            <Edit size={16} />
          </Button>
        )
      }
    >
      {content}
    </Modal>
  );
};

export default EditVideo;
