"use client";

import { useEffect } from "react";
import { loadVoiceflowAgent } from "@/lib/voiceflow";

export const VoiceflowAgent = () => {
  useEffect(() => {
    loadVoiceflowAgent();
  }, []);

  return null;
};
