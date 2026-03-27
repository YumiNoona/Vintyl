import React, { useState } from "react";
import Modal from "../modal";
import { Button } from "@/components/ui/button";
import { Copy, Code, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ShareModalProps = {
  videoId: string;
  trigger: React.ReactNode;
};

export default function ShareModal({ videoId, trigger }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const link = `${process.env.NEXT_PUBLIC_HOST_URL}/preview/${videoId}`;
  const embedCode = `<iframe width="560" height="315" src="${link}" title="Vintyl Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;

  const onCopyLink = () => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const onCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <Modal trigger={trigger} title="Share Video" description="Share this video via link or embed it anywhere.">
      <div onClick={(e) => e.stopPropagation()}>
        <Tabs defaultValue="link" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-secondary border border-border">
            <TabsTrigger value="link" className="data-[state=active]:bg-background rounded-md py-1.5 text-sm font-medium">Copy Link</TabsTrigger>
            <TabsTrigger value="embed" className="data-[state=active]:bg-background rounded-md py-1.5 text-sm font-medium">Embed Code</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="flex bg-card border border-border rounded-lg p-3 items-center justify-between">
              <span className="text-body-sm truncate max-w-[280px]">{link}</span>
              <Button size="sm" onClick={onCopyLink} className="bg-foreground hover:bg-foreground/90 text-background font-semibold h-8 gap-2 flex-shrink-0 ml-4 rounded-lg transform active:scale-95 transition-all text-xs">
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="embed" className="space-y-4 mt-4">
            <div className="flex flex-col bg-card border border-border rounded-lg p-3 gap-3">
              <code className="text-xs text-muted-foreground break-all bg-background p-2 rounded-md font-mono">
                {embedCode}
              </code>
              <div className="flex justify-end">
                <Button size="sm" onClick={onCopyEmbed} variant="outline" className="border-neutral-700 hover:bg-neutral-800 h-8 gap-2">
                  {copiedEmbed ? <Check size={14} /> : <Code size={14} />}
                  {copiedEmbed ? "Copied" : "Copy HTML"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
}
