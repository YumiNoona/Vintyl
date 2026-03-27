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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    const res = await getVideoComments(videoId);
    if (res.status === 200) {
      setComments(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handlePostComment = async (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    setIsPosting(true);
    try {
      const res = await createComment(videoId, text, parentId, user?.id);
      if (res.status === 200) {
        toast.success(parentId ? "Reply posted" : "Comment posted");
        if (parentId) {
          setReplyText("");
          setReplyingTo(null);
        } else {
          setNewComment("");
        }
        await fetchComments();
      } else {
        toast.error("Failed to post");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsPosting(false);
    }
  };

  // Group comments into threads
  const threads = comments.filter((c) => !c.commentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.commentId === parentId);

  return (
    <div className="p-4 bg-card/60 rounded-xl border border-border">
      <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
        Comments <span className="text-caption bg-secondary px-2 py-0.5 rounded-full">{comments.length}</span>
      </h3>

      {/* Main Input area */}
      <div className="flex gap-3 mb-8">
        <Avatar className="w-8 h-8 border border-white/10">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback><User size={14} /></AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-background border-border min-h-[80px] text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg p-3"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={() => handlePostComment()}
              disabled={isPosting || !newComment.trim()}
              size="sm"
              className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-4 h-8 font-medium"
            >
              {isPosting && !replyingTo ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Send className="w-3 h-3 mr-2" />}
              Post
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
           <p className="text-body-sm">No discussions yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {threads.map((comment) => (
            <div key={comment.id} className="group/comment flex flex-col gap-4">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 border border-white/5">
                  <AvatarImage src={comment.user?.image || ""} />
                  <AvatarFallback><User size={14} /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {comment.user?.firstName} {comment.user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{comment.comment}</p>
                  
                  <button 
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground mt-2 transition-colors"
                  >
                    Reply
                  </button>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 flex gap-3 animate-in slide-in-from-top-1 duration-200">
                      <div className="flex-1">
                        <Textarea
                          value={replyText}
                          autoFocus
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full bg-background border-border min-h-[60px] text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg p-3"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                           <Button variant="ghost" size="xs" onClick={() => setReplyingTo(null)} className="h-7 text-xs">Cancel</Button>
                           <Button
                             onClick={() => handlePostComment(comment.id)}
                             disabled={isPosting || !replyText.trim()}
                             size="sm"
                             className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-4 h-7 text-xs"
                           >
                             Post Reply
                           </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nested Replies */}
              <div className="ml-11 space-y-4 border-l border-white/5 pl-4">
                {getReplies(comment.id).map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="w-6 h-6 border border-white/5">
                      <AvatarImage src={reply.user?.image || ""} />
                      <AvatarFallback><User size={12} /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">
                          {reply.user?.firstName} {reply.user?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{reply.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
