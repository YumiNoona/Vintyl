"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Send, Loader2 } from "lucide-react";
import { getVideoComments, createComment } from "@/actions/video";
import { toast } from "sonner";

interface CommentsProps {
  videoId: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
  };
}

export default function Comments({ videoId, user }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      const res = await getVideoComments(videoId);
      if (res.status === 200) {
        setComments(res.data);
      }
      setIsLoading(false);
    };
    fetchComments();
  }, [videoId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsPosting(true);
    try {
      const res = await createComment(videoId, newComment, undefined, user?.id);
      if (res.status === 200) {
        toast.success("Comment posted");
        setNewComment("");
        // Optimistically add to list or refetch
        const fetchRes = await getVideoComments(videoId);
        if (fetchRes.status === 200) setComments(fetchRes.data);
      } else {
        toast.error("Failed to post comment");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-4 bg-neutral-800/40 rounded-xl">
      <h3 className="font-semibold mb-4 text-neutral-200">Comments</h3>

      {/* Input area */}
      <div className="flex gap-3 mb-6">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback>
            <User size={14} />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-neutral-900 border-neutral-700 min-h-[80px] text-sm resize-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-lg p-3"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handlePostComment}
              disabled={isPosting || !newComment.trim()}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Post
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-neutral-500 text-sm text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user?.image || ""} />
                <AvatarFallback>
                  <User size={14} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-neutral-200 capitalize">
                    {comment.user?.firstName || "Unknown"} {comment.user?.lastName || "User"}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 whitespace-pre-wrap">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
