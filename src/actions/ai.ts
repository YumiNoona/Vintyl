"use server";

import { openai } from "@/lib/openai";
import { client } from "@/lib/prisma";

/**
 * Transcribe video audio using OpenAI Whisper
 * Accepts a video URL (S3/CloudFront) and returns transcript
 */
export const transcribeVideo = async (videoId: string) => {
  try {
    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { source: true, transcript: true },
    });

    if (!video) return { status: 404, data: "Video not found" };
    if (video.transcript) return { status: 200, data: video.transcript };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "sk-your_key_here") {
      return { status: 400, data: "OpenAI API Key is missing or invalid. Please add your key to the .env file." };
    }

    // Fetch the video/audio file
    const response = await fetch(video.source);
    const audioBlob = await response.blob();
    const audioFile = new File([audioBlob], "audio.webm", {
      type: "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      response_format: "text",
    });

    // Save transcript to DB
    await client.video.update({
      where: { id: videoId },
      data: { transcript: transcription },
    });

    return { status: 200, data: transcription };
  } catch (error) {
    console.error("Transcription error:", error);
    return { status: 500, data: "Transcription failed" };
  }
};

/**
 * Generate AI summary and title for a video using GPT
 */
export const generateVideoSummary = async (videoId: string) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "sk-your_key_here") {
      return { status: 400, data: "OpenAI API Key is missing or invalid. Please add your key to the .env file." };
    }

    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { transcript: true, summary: true, title: true },
    });

    if (!video) return { status: 404, data: null };
    if (!video.transcript)
      return { status: 400, data: "No transcript available. Transcribe first." };
    if (video.summary)
      return {
        status: 200,
        data: { summary: video.summary, title: video.title },
      };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a video content assistant. Given a video transcript, provide:
1. A concise, engaging title (max 10 words)
2. A 2-3 sentence summary of the key points

Respond in JSON format: { "title": "...", "summary": "..." }`,
        },
        {
          role: "user",
          content: `Transcript:\n${video.transcript.substring(0, 4000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );

    // Save to DB
    await client.video.update({
      where: { id: videoId },
      data: {
        summary: result.summary || null,
        title: result.title || video.title,
      },
    });

    return { status: 200, data: result };
  } catch (error) {
    console.error("Summary error:", error);
    return { status: 500, data: null };
  }
};

/**
 * Process a video — transcribe then summarize in one call
 */
export const processVideoWithAI = async (videoId: string) => {
  try {
    // Step 1: Transcribe
    const transcriptResult = await transcribeVideo(videoId);
    if (transcriptResult.status !== 200) {
      return { status: transcriptResult.status, data: "Transcription failed" };
    }

    // Step 2: Summarize
    const summaryResult = await generateVideoSummary(videoId);
    if (summaryResult.status !== 200) {
      return { status: summaryResult.status, data: "Summary failed" };
    }

    // Mark video as processed
    await client.video.update({
      where: { id: videoId },
      data: { processing: false },
    });

    return {
      status: 200,
      data: {
        transcript: transcriptResult.data,
        ...(summaryResult.data as object),
      },
    };
  } catch (error) {
    console.error("AI processing error:", error);
    return { status: 500, data: "Processing failed" };
  }
};
