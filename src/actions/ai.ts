import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Transcribe video audio using Google Gemini 1.5 Flash
 * Accepts a video URL (S3/CloudFront) and returns transcript
 */
export const transcribeVideo = async (videoId: string) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: video, error: fetchError } = await supabaseAdmin
      .from("Video")
      .select("source, transcript")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) return { status: 404, data: "Video not found" };
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
    const { error: updateError } = await supabaseAdmin
      .from("Video")
      .update({ transcript: transcription })
      .eq("id", videoId);

    if (updateError) throw updateError;

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
    const supabaseAdmin = getSupabaseAdmin();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { status: 400, data: "Gemini API Key is missing. Please add your key to the .env file." };
    }

    const { data: video, error: fetchError } = await supabaseAdmin
      .from("Video")
      .select("transcript, summary, title")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) return { status: 404, data: null };
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
    const { error: updateError } = await supabaseAdmin
      .from("Video")
      .update({
        summary: resultJson.summary || null,
        title: resultJson.title || video.title,
      })
      .eq("id", videoId);

    if (updateError) throw updateError;

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
    const supabaseAdmin = getSupabaseAdmin();
    // Step 0: Check User Subscription & Trial Status
    const { data: video, error: fetchError } = await supabaseAdmin
      .from("Video")
      .select("*, User(*, Subscription(plan), Trial(trial))")
      .eq("id", videoId)
      .single();

    if (fetchError || !video || !video.User) return { status: 404, data: "User or Video not found" };

    const isPro = (video.User as any).Subscription?.plan === "PRO";
    const hasUsedTrial = (video.User as any).Trial?.[0]?.trial === true; // Assuming join returns array or nested obj

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
    await supabaseAdmin
      .from("Video")
      .update({ processing: false })
      .eq("id", videoId);

    // Step 3: Update Trial status for FREE users
    if (!isPro) {
      await supabaseAdmin
        .from("Trial")
        .upsert({ userId: video.userId, trial: true }, { onConflict: "userId" });
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
