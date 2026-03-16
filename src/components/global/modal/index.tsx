"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ModalProps = {
  trigger: React.ReactElement;
  children: React.ReactNode | (({ setOpen }: { setOpen: (open: boolean) => void }) => React.ReactNode);
  title: string;
  description: string;
  className?: string;
};

export default function Modal({
  trigger,
  children,
  title,
  description,
  className,
}: ModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-xl bg-card border-border backdrop-blur-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        {typeof children === 'function' 
          ? (children as any)({ setOpen }) 
          : children}
      </DialogContent>
    </Dialog>
  );
}
