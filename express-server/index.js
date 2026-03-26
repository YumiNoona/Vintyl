require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");
const ffmpegPath = require("ffmpeg-static");
const { execSync } = require("child_process");
const { PLAN_LIMITS } = require("../src/shared/planLimits.js");

const app = express();
const server = http.createServer(app);

// Initialize Supabase & Gemini
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);

const BUCKET = "vintyl-videos";

const io = new Server(server, {
  cors: {
    origin: [
      process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) return next(new Error("Unauthorized: No token provided"));

    const pureToken = token.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(pureToken);

    if (error || !data.user) {
      console.error("❌ Socket Auth Fail:", error?.message || "Invalid user");
      return next(new Error("Unauthorized: Invalid token"));
    }

    socket.user = data.user;
    next();
  } catch (err) {
    console.error("❌ Socket Auth Error:", err.message);
    next(new Error("Authentication error"));
  }
});

const activeStreams = {}; // { [filename]: fs.WriteStream }

io.on("connection", (socket) => {
  const userId = socket.user.id;
  console.log("🔌 Connected verified user:", userId);

  socket.on("start-recording", async (data) => {
    console.log(`⏺️ User ${userId} started recording`);
    try {
      // GET /api/recording/:id/processing — plan-only preflight, does NOT create a video record
      const res = await axios.get(`${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/processing`);
      socket.emit("user-info", {
        plan: res.data.plan || "FREE",
        email: socket.user.email
      });
    } catch (err) {
      socket.emit("user-info", { plan: "FREE" });
    }
  });

  socket.on("chunk", (data) => {
    const { chunks, filename } = data; // Maintain compatibility

    if (!activeStreams[filename]) {
      const tempDir = path.join(__dirname, "temp_upload");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const filePath = path.join(tempDir, filename);
      activeStreams[filename] = fs.createWriteStream(filePath);
    }

    const stream = activeStreams[filename];
    // Handle backpressure
    if (!stream.write(Buffer.from(chunks))) {
      socket.pause();
      stream.once("drain", () => socket.resume());
    }
  });

  // Maintain backward compatibility with "video-chunks" event
  socket.on("video-chunks", (data) => {
    const { chunks, filename } = data;

    if (!activeStreams[filename]) {
      const tempDir = path.join(__dirname, "temp_upload");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const filePath = path.join(tempDir, filename);
      activeStreams[filename] = fs.createWriteStream(filePath);
    }

    const stream = activeStreams[filename];
    // Handle backpressure
    if (!stream.write(Buffer.from(chunks))) {
      socket.pause();
      stream.once("drain", () => socket.resume());
    }
    console.log(`📦 Chunk streamed to ${filename}`);
  });

  socket.on("process-video", async (data) => {
    const { filename } = data;
    console.log(`🔄 Processing ${filename} for user ${userId}`);

    const stream = activeStreams[filename];
    if (stream) {
      stream.end();
      delete activeStreams[filename];
    }

    try {
      // Security Check: Verify user exists/active via Next.js
      const verifyRes = await axios.get(`${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/processing`);
      if (verifyRes.status !== 200) {
        return socket.emit("error", { message: "Unauthorized or invalid user session" });
      }

      const filePath = path.join(__dirname, "temp_upload", filename);
      if (!fs.existsSync(filePath)) {
        return socket.emit("error", { message: "File stream not found on server" });
      }

      // 1. Initial Processing Call to Next.js
      const processingRes = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/processing`,
        { filename }
      );

      if (processingRes.status !== 200) {
        throw new Error("Failed to signal processing to Next.js");
      }

      // File Size Guard (Max 200MB)
      const stats = fs.statSync(filePath);
      if (stats.size > 200 * 1024 * 1024) {
        throw new Error("File too large for processing (Limit: 200MB)");
      }

      // 2. Upload to Supabase Storage
      const fileBuffer = fs.readFileSync(filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filename, fileBuffer, {
          contentType: "video/webm",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Supabase Upload Error: ${uploadError.message}`);
      }
      console.log("✅ Uploaded to Supabase");

      const userPlan = processingRes.data.plan || "FREE";
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      const publicUrl = publicUrlData.publicUrl;

      // Unblock the client immediately
      socket.emit("processing-complete", { filename });

      // Run AI and DB updates in the true background (non-blocking)
      setImmediate(async () => {
        let aiData = { transcript: "", title: "Untitled", summary: "" };
        const audioPath = `${filePath}.mp3`;

        try {
          const userPlan = processingRes.data.plan || "FREE";
          const aiBlocked = processingRes.data.aiBlocked;

          if (PLAN_LIMITS[userPlan] && PLAN_LIMITS[userPlan].ai && !aiBlocked) {
            try {
              console.log(`🤖 Processing AI for ${userPlan} tier...`);
              const fileBuffer = fs.readFileSync(filePath);
              const base64Data = fileBuffer.toString("base64");

              const geminiPromise = model.generateContent([
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: "video/webm",
                  },
                },
                "Transcribe this video accurately. Then provide a concise title and a 2-sentence summary. Respond ONLY in valid JSON format: { \"transcript\": \"...\", \"title\": \"...\", \"summary\": \"...\" }",
              ]);

              const result = await withTimeout(geminiPromise, 15000);
              const aiResponseText = result.response.text();
              const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
              aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : { transcript: "AI transcription failed", title: "Untitled", summary: "Failed to parse AI output." };
              console.log("✨ Gemini Enrichment Complete");
            } catch (err) {
              console.log("⚠️ Gemini failed or timed out. Falling back to Groq...", err.message);
              
              if (!fs.existsSync(filePath)) throw new Error("Video file not found for extraction");

              console.log("🎙️ Extracting audio for Groq...");
              execSync(`"${ffmpegPath}" -i "${filePath}" -vn -acodec libmp3lame -ar 16000 -ac 1 "${audioPath}"`);

              console.log("🧠 Groq Whisper Transcription...");
              const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(audioPath),
                model: "whisper-large-v3",
              });
              
              aiData.transcript = transcription.text;

              if (!aiData.transcript || aiData.transcript.trim().length < 10) {
                console.log("🔇 No usable audio detected.");
                aiData.title = "Screen recording (no audio)";
                aiData.summary = "This recording appears to contain only visual content. AI fallback cannot analyze visuals without audio.";
              } else {
                console.log("📝 Groq Llama Summarization...");
                const trimmedTranscript = aiData.transcript.slice(0, 12000);

                const completion = await groq.chat.completions.create({
                  model: "llama-3.3-70b-versatile",
                  messages: [
                    {
                      role: "system",
                      content: "You are a professional video analyzer. Based on the transcript provided, generate a compelling title and a concise 2-sentence summary of the video. Respond ONLY in valid JSON format: { \"title\": \"...\", \"summary\": \"...\" }"
                    },
                    {
                      role: "user",
                      content: trimmedTranscript
                    }
                  ],
                  response_format: { type: "json_object" }
                });

                const content = completion.choices[0].message.content;
                try {
                  const parsedGroq = JSON.parse(content);
                  aiData.title = parsedGroq.title || "Untitled";
                  aiData.summary = parsedGroq.summary || "No summary available.";
                } catch (jsonErr) {
                  console.warn("⚠️ Groq JSON parse failed, using raw content as summary.");
                  aiData.title = "Generated Summary";
                  aiData.summary = content.slice(0, 500);
                }
                console.log("✨ Groq Enrichment Complete");
              }
            }
          } else {
            const reason = aiBlocked ? "Daily AI Limit Reached" : `Plan: ${userPlan}`;
            console.log(`⏭️ Cost Protection: Skipping AI (${reason})`);
            aiData.title = "Screen Recording";
            aiData.summary = aiBlocked 
              ? "Daily AI analysis limit reached for your plan." 
              : "Upgrade to PRO for AI summaries and transcriptions.";
          }

          // Update Next.js with Transcription/Summary & Public URL
          await axios.post(
            `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/transcribe`,
            {
              filename,
              content: JSON.stringify({ title: aiData.title, summary: aiData.summary }),
              transcript: aiData.transcript,
              source: publicUrl,
            }
          );

          // Complete Processing Call
          await axios.post(
            `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/complete`,
            { filename }
          );

        } catch (error) {
          console.error("❌ AI processing error:", error.message);
        } finally {
          // Cleanup
          if (fs.existsSync(audioPath)) {
            try { fs.unlinkSync(audioPath); } catch (e) { console.error("Failed to delete temp audio:", e); }
          }
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error("Failed to delete temp file:", err);
            });
          }
          console.log("✨ Background Job Done!");
        }
      });

    } catch (error) {
      console.error("❌ Processing error:", error);
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    // Cleanup any orphaned streams
    for (const [filename, stream] of Object.entries(activeStreams)) {
      if (stream) {
        stream.destroy(); // Safely teardown without flushing buffer
        delete activeStreams[filename];

        const tempFile = path.join(__dirname, "temp_upload", filename);
        if (fs.existsSync(tempFile)) {
          fs.unlink(tempFile, (err) => {
            if (err) console.error("Failed to delete orphaned temp file:", err);
          });
        }
      }
    }
  });
});

const PORT = process.env.EXPRESS_PORT || 5050;
server.listen(PORT, () => console.log(`🚀 Express processing server on ${PORT}`));