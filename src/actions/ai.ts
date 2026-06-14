import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "@/lib/db";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" }) || null;

export const transcribeVideo = async (videoId: string) => {
  try {
    const db = getDb();
    const video = db.prepare('SELECT source, transcript FROM "Video" WHERE id = ?').get(videoId) as any;

    if (!video) return { status: 404, data: "Video not found" };
    if (video.transcript) return { status: 200, data: video.transcript };

    if (!model || !process.env.GEMINI_API_KEY) {
      const fallback = "AI transcription unavailable. Set GEMINI_API_KEY for automatic transcription.";
      db.prepare(`UPDATE "Video" SET transcript = ? WHERE id = ?`).run(fallback, videoId);
      return { status: 200, data: fallback };
    }

    const response = await fetch(video.source);
    const audioArrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioArrayBuffer).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: "audio/webm",
        },
      },
      "Transcribe the audio in this file accurately and completely. Return only the transcript text, no extra commentary.",
    ]);

    const transcription = result.response.text();
    if (!transcription) return { status: 500, data: "Transcription generated no text" };

    db.prepare(`UPDATE "Video" SET transcript = ? WHERE id = ?`).run(transcription, videoId);

    return { status: 200, data: transcription };
  } catch (error) {
    return { status: 500, data: "Transcription failed" };
  }
};

export const generateVideoSummary = async (videoId: string) => {
  try {
    const db = getDb();
    const video = db.prepare('SELECT transcript, summary, title FROM "Video" WHERE id = ?').get(videoId) as any;

    if (!video) return { status: 404, data: null };
    if (!video.transcript) return { status: 400, data: "No transcript available. Transcribe first." };

    if (!model || !process.env.GEMINI_API_KEY) {
      const result = { title: video.title || "Untitled", summary: "AI summary unavailable. Set GEMINI_API_KEY for automatic summaries." };
      db.prepare(`UPDATE "Video" SET summary = ?, title = ? WHERE id = ?`).run(result.summary, result.title, videoId);
      return { status: 200, data: result };
    }

    const prompt = `You are a video content assistant. Given a video transcript, provide:
1. A concise, engaging title (max 10 words)
2. A 2-3 sentence summary of the key points

Transcript:
${video.transcript}

Respond in JSON format: { "title": "...", "summary": "..." }`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : "{}";
    const resultJson = JSON.parse(cleanedJson);

    db.prepare(`UPDATE "Video" SET summary = ?, title = ? WHERE id = ?`).run(
      resultJson.summary || null,
      resultJson.title || video.title,
      videoId
    );

    return { status: 200, data: resultJson };
  } catch (error) {
    return { status: 500, data: null };
  }
};

export const processVideoWithAI = async (videoId: string) => {
  try {
    const db = getDb();
    const video = db.prepare(`
      SELECT v.*, u.id as u_id, u.email as u_email,
             s.plan as sub_plan
      FROM "Video" v
      LEFT JOIN "User" u ON u.id = v.userId
      LEFT JOIN "Subscription" s ON s.userId = u.id
      WHERE v.id = ?
    `).get(videoId) as any;

    if (!video || !video.u_id) return { status: 404, data: "User or Video not found" };

    const transcriptResult = await transcribeVideo(videoId);
    if (transcriptResult.status !== 200) {
      return { status: transcriptResult.status, data: transcriptResult.data };
    }

    const summaryResult = await generateVideoSummary(videoId);
    if (summaryResult.status !== 200) {
      return { status: summaryResult.status, data: "Summary failed" };
    }

    db.prepare(`UPDATE "Video" SET processing = 0 WHERE id = ?`).run(videoId);

    return {
      status: 200,
      data: {
        transcript: transcriptResult.data,
        ...(summaryResult.data as object),
      },
    };
  } catch (error) {
    return { status: 500, data: "Processing failed" };
  }
};
