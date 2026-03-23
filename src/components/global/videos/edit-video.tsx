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

export const editVideoInfoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type Props = {
  videoId: string;
  title: string;
  description: string;
};

const EditVideo = ({ videoId, title, description }: Props) => {
  const { mutate, isPending } = useMutationData(
    ["edit-video"],
    (data: { title: string; description: string }) =>
      editVideoInfo(videoId, data.title, data.description),
    "preview-video"
  );

  const { register, onFormSubmit, errors } = useZodForm(
    editVideoInfoSchema,
    mutate,
    { title, description }
  );

  return (
    <Modal
      title="Edit Video Details"
      description="Update your video title and description."
      trigger={
        <Button variant="ghost" className="rounded-full shadow-lg border-2 border-border p-2">
          <Edit size={16} className="text-foreground" />
        </Button>
      }
    >
      <form onSubmit={onFormSubmit} className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <Label>Title</Label>
          <Input
            {...register("title")}
            placeholder="Video Title"
            className="bg-secondary/50 border-none focus-visible:ring-purple-500"
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
            className="bg-secondary/50 border-none focus-visible:ring-purple-500 resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description.message as string}</p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all font-bold"
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Save Changes"}
        </Button>
      </form>
    </Modal>
  );
};

export default EditVideo;
