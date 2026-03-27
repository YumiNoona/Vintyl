"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function EmbedModal({
  videoId,
  trigger,
}: {
  videoId: string;
  trigger: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe 
  src="${process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:3000'}/preview/${videoId}?embed=true" 
  width="640" 
  height="360" 
  frameborder="0" 
  webkitallowfullscreen 
  mozallowfullscreen 
  allowfullscreen
></iframe>`;

  const onCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl rounded-3xl shadow-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Embed Video</DialogTitle>
          <DialogDescription className="text-body-sm">
            Copy this code to embed the video in your website or email.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 p-6 bg-background rounded-2xl border border-border relative group">
          <pre className="text-xs font-mono text-primary overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
            {embedCode}
          </pre>
          <Button
            size="sm"
            onClick={onCopy}
            className="absolute top-4 right-4 bg-foreground hover:bg-foreground/90 text-background p-2 rounded-lg transition-all active:scale-90"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
           <p className="text-eyebrow">Preview</p>
           <div 
             className="w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-neutral-800 flex items-center justify-center"
             dangerouslySetInnerHTML={{ __html: embedCode }}
           />
        </div>
      </DialogContent>
    </Dialog>
  );
}
