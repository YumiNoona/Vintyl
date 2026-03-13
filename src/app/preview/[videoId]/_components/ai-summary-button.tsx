"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AISummaryButtonProps {
  videoId: string;
}

export default function AISummaryButton({ videoId }: AISummaryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: "process" }),
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        toast.success("AI summary generated successfully!");
        router.refresh(); // Refresh the page to show the new summary
      } else {
        toast.error(data.data || data.error || "Failed to generate summary");
      }
    } catch (error) {
      toast.error("An error occurred while generating the summary");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateSummary}
      disabled={isLoading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {isLoading ? "Generating..." : "Generate AI Summary & Transcript"}
    </Button>
  );
}
