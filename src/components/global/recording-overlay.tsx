"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Square, Pause, Play, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecording } from "@/context/RecordingContext";

export default function RecordingOverlay() {
  const { isRecording, stopRecording } = useRecording();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
           initial={{ y: 20, opacity: 0, scale: 0.95 }}
           animate={{ y: 0, opacity: 1, scale: 1 }}
           exit={{ y: 20, opacity: 0, scale: 0.95 }}
           transition={{ type: "spring", damping: 20, stiffness: 300 }}
           className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-2.5 flex items-center gap-6 shadow-2xl border-t-white/10 ring-1 ring-white/5">
            <div className="flex items-center gap-3 pl-4 border-r border-white/10 pr-6">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-50" />
              </div>
              <span className="text-xl font-bold font-mono tracking-tighter text-white tabular-nums w-16 text-center">
                {formatTime(seconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={stopRecording}
                className="h-11 px-5 rounded-[1.25rem] bg-red-600 hover:bg-red-700 text-white font-bold gap-3 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                <Square size={16} fill="currentColor" />
                Stop Recording
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
