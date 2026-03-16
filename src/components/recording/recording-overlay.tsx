"use client";

import React, { useState, useEffect } from "react";

type RecordingOverlayProps = {
  onStop: () => void;
};

export default function RecordingOverlay({ onStop }: RecordingOverlayProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center gap-6 shadow-2xl border border-white/10 z-[100] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        <span className="text-xl font-mono font-bold text-white tracking-widest">{formatTime(seconds)}</span>
      </div>

      <button
        onClick={onStop}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
      >
        Stop Recording
      </button>
    </div>
  );
}
