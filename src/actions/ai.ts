import { GoogleGenerativeAI } from "@google/generative-ai";
import { client } from "@/lib/prisma";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Transcribe video audio using Google Gemini 1.5 Flash
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { status: 400, data: "Gemini API Key is missing. Please add your key to the .env file." };
    }

    // Fetch the video file
    const response = await fetch(video.source);
    const audioArrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioArrayBuffer).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: "audio/webm", // Gemini supports webm audio/video
        },
      },
      "Transcribe the audio in this file accurately and completely. Return only the transcript text, no extra commentary.",
    ]);

    const transcription = result.response.text();

    if (!transcription) return { status: 500, data: "Transcription generated no text" };

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
 * Generate AI summary and title for a video using Gemini
 */
export const generateVideoSummary = async (videoId: string) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { status: 400, data: "Gemini API Key is missing. Please add your key to the .env file." };
    }

    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { transcript: true, summary: true, title: true },
    });

    if (!video) return { status: 404, data: null };
    if (!video.transcript)
      return { status: 400, data: "No transcript available. Transcribe first." };

    const prompt = `You are a video content assistant. Given a video transcript, provide:
1. A concise, engaging title (max 10 words)
2. A 2-3 sentence summary of the key points

Transcript:
${video.transcript}

Respond in JSON format: { "title": "...", "summary": "..." }`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Extract JSON from potential markdown blocks
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : "{}";
    const resultJson = JSON.parse(cleanedJson);

    // Save to DB
    await client.video.update({
      where: { id: videoId },
      data: {
        summary: resultJson.summary || null,
        title: resultJson.title || video.title,
      },
    });

    return { status: 200, data: resultJson };
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
    // Step 0: Check User Subscription & Trial Status
    const video = await client.video.findUnique({
      where: { id: videoId },
      include: {
        user: {
          include: {
            subscription: true,
            trial: true,
          },
        },
      },
    });

    if (!video || !video.user) return { status: 404, data: "User or Video not found" };

    const isPro = video.user.subscription?.plan === "PRO";
    const hasUsedTrial = video.user.trial?.trial === true;

    if (!isPro && hasUsedTrial) {
      return { 
        status: 403, 
        data: "You have used your one-time AI trial. Upgrade to PRO for unlimited AI features." 
      };
    }

    // Step 1: Transcribe
    const transcriptResult = await transcribeVideo(videoId);
    if (transcriptResult.status !== 200) {
      return { status: transcriptResult.status, data: transcriptResult.data };
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

    // Step 3: Update Trial status for FREE users
    if (!isPro) {
      await client.trial.upsert({
        where: { userId: video.user.id },
        update: { trial: true },
        create: { userId: video.user.id, trial: true },
      });
    }

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
