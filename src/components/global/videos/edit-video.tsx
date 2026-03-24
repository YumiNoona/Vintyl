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
    [["preview-video", videoId], ["user-videos"]]
  );

  const { register, onFormSubmit, errors } = useZodForm(
    editVideoInfoSchema,
    mutate,
    { title, description }
  );

  return (
    <Modal
      title="Rename & Details"
      description="Update your video title and description for clarity."
      trigger={
        <Button variant="ghost" className="rounded-full shadow-2xl bg-neutral-900 border border-white/10 p-2.5 hover:bg-neutral-800 text-white transition-all transform active:scale-90">
          <Edit size={16} />
        </Button>
      }
    >
      <form onSubmit={onFormSubmit} className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <Label>Title</Label>
          <Input
            {...register("title")}
            placeholder="Video Title"
            className="bg-white/5 border-white/5 focus-visible:ring-white/20 h-11 rounded-xl font-bold text-white"
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
            className="bg-white/5 border-white/5 focus-visible:ring-white/20 rounded-xl font-medium text-white/80 resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description.message as string}</p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-white hover:bg-neutral-200 text-black font-black h-12 rounded-2xl shadow-xl shadow-white/5 uppercase tracking-widest text-[10px] mt-2 transition-all"
          disabled={isPending}
        >
          {isPending ? "Updating Video..." : "Save Changes"}
        </Button>
      </form>
    </Modal>
  );
};

export default EditVideo;
