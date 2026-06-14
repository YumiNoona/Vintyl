"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { XIcon, Copy, Check } from "lucide-react";
import React from "react";

export default function DonateModal() {
  const [copied, setCopied] = React.useState(false);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText("rushikeshingale2001@okicici");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button className="w-full py-3 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold active:scale-95 transition-all cursor-pointer">
            Donate
          </button>
        }
      />
      <DialogContent showCloseButton={false} className="sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
        <div className="relative p-8 text-center space-y-5">
          <DialogClose className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer">
            <XIcon size={18} />
          </DialogClose>

          <div className="text-4xl">💛</div>
          <h2 className="text-2xl font-bold tracking-tight">Support Vintyl</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If Vexo helps you study, please consider donating to keep it free forever.
          </p>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <img
              src="/Donate.jpeg"
              alt="Donate QR"
              className="w-full max-w-56 mx-auto rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Direct UPI Payment
            </p>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg border border-border pl-4 pr-2 py-2">
              <span className="text-sm font-mono text-foreground select-all flex-1 truncate">
                rushikeshingale2001@okicici
              </span>
              <button
                onClick={copyUpi}
                className="size-8 rounded-lg bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors shrink-0"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Every donation, no matter how small, helps cover
            hosting and AI API costs.
          </p>
          <p className="text-sm font-medium text-foreground">
            Thank you for your kindness!
          </p>
          <p className="text-xs text-muted-foreground/50">
            Built with 💙 Made by Veil
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
