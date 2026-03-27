import React, { useMemo, useState } from "react";
import Modal from "../modal";
import { Button } from "@/components/ui/button";
import { Copy, Code, Check, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ShareModalProps = {
  videoId: string;
  trigger: React.ReactNode;
};

export default function ShareModal({ videoId, trigger }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const origin = useMemo(() => {
    if (!mounted) return process.env.NEXT_PUBLIC_HOST_URL || "";
    return window.location.origin;
  }, [mounted]);

  const link = `${origin}/preview/${videoId}`;
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
    <Modal
      trigger={trigger}
      title="Share Video"
      description="Share via direct link or paste the embed code into any site."
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-full overflow-hidden">
        <Tabs defaultValue="link" className="w-full mt-3">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/70 border border-border rounded-xl p-1 h-11">
            <TabsTrigger
              value="link"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg text-sm font-semibold"
            >
              Copy Link
            </TabsTrigger>
            <TabsTrigger
              value="embed"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-lg text-sm font-semibold"
            >
              Embed Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="mt-4">
            <div className="rounded-2xl border border-border bg-card/80 p-4 space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                Anyone with this link can view the video.
              </p>
              <div className="rounded-xl border border-border bg-background px-3 py-2.5 flex items-center gap-2 w-full overflow-hidden">
                <Link2 size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground truncate min-w-0 flex-1">{link}</span>
              </div>
              <Button
                size="sm"
                onClick={onCopyLink}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-9 gap-2 rounded-xl transition-all active:scale-[0.99]"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="embed" className="mt-4">
            <div className="rounded-2xl border border-border bg-card/80 p-4 space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                Paste this HTML into your website to embed the player.
              </p>
              <code className="block text-xs text-muted-foreground break-all bg-background border border-border p-3 rounded-xl font-mono max-h-32 overflow-auto w-full">
                {embedCode}
              </code>
              <div>
                <Button
                  size="sm"
                  onClick={onCopyEmbed}
                  variant="outline"
                  className="w-full border-border bg-background hover:bg-secondary text-foreground h-9 gap-2 rounded-xl"
                >
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
