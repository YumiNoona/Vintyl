require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");
const ffmpegPath = require("ffmpeg-static");
const { execSync } = require("child_process");
const Database = require("better-sqlite3");

const app = express();
const server = http.createServer(app);

// Local JWT verification
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "vintyl-local-dev-secret-do-not-use-in-production";

function verifyToken(token) {
  try {
    const pureToken = token.replace("Bearer ", "");
    return jwt.verify(pureToken, JWT_SECRET);
  } catch {
    return null;
  }
}

// Local SQLite database
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "vintyl.db");
const db = new Database(DB_PATH);

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

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads", "videos");
const TEMP_DIR = path.join(__dirname, "temp_upload");

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

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error("Unauthorized: Invalid token"));
    }

    socket.user = { id: payload.userId, email: payload.email };
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

const activeStreams = {};

io.on("connection", (socket) => {
  const userId = socket.user.id;

  socket.on("start-recording", async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/api/recording/${userId}/processing`);
      socket.emit("user-info", {
        plan: "ENTERPRISE",
        email: socket.user.email
      });
    } catch (err) {
      socket.emit("user-info", { plan: "ENTERPRISE" });
    }
  });

  socket.on("chunk", (data) => {
    const { chunks, filename } = data;

    if (!activeStreams[filename]) {
      if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
      const filePath = path.join(TEMP_DIR, filename);
      activeStreams[filename] = fs.createWriteStream(filePath);
    }

    const stream = activeStreams[filename];
    if (!stream.write(Buffer.from(chunks))) {
      socket.pause();
      stream.once("drain", () => socket.resume());
    }
  });

  socket.on("video-chunks", (data) => {
    const { chunks, filename } = data;

    if (!activeStreams[filename]) {
      if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
      const filePath = path.join(TEMP_DIR, filename);
      activeStreams[filename] = fs.createWriteStream(filePath);
    }

    const stream = activeStreams[filename];
    if (!stream.write(Buffer.from(chunks))) {
      socket.pause();
      stream.once("drain", () => socket.resume());
    }
  });

  socket.on("process-video", async (data) => {
    const { filename } = data;

    const stream = activeStreams[filename];
    if (stream) {
      stream.end();
      delete activeStreams[filename];
    }

    try {
      const verifyRes = await axios.get(`${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/api/recording/${userId}/processing`);
      if (verifyRes.status !== 200) {
        return socket.emit("error", { message: "Unauthorized or invalid user session" });
      }

      const filePath = path.join(TEMP_DIR, filename);
      if (!fs.existsSync(filePath)) {
        return socket.emit("error", { message: "File stream not found on server" });
      }

      const processingRes = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/api/recording/${userId}/processing`,
        { filename }
      );

      if (processingRes.status !== 200) {
        throw new Error("Failed to signal processing to Next.js");
      }

      const stats = fs.statSync(filePath);
      if (stats.size > 200 * 1024 * 1024) {
        throw new Error("File too large for processing (Limit: 200MB)");
      }

      // Copy to local uploads directory
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const destPath = path.join(UPLOAD_DIR, filename);
      fs.copyFileSync(filePath, destPath);

      const publicUrl = `/api/video/${encodeURIComponent(filename)}`;

      socket.emit("processing-complete", { filename });

      setImmediate(async () => {
        let aiData = { transcript: "", title: "Untitled", summary: "" };
        const audioPath = `${filePath}.mp3`;

        try {
          if (process.env.GEMINI_API_KEY) {
            try {
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
            } catch (err) {
              if (fs.existsSync(filePath) && process.env.GROQ_API_KEY) {
                execSync(`"${ffmpegPath}" -i "${filePath}" -vn -acodec libmp3lame -ar 16000 -ac 1 "${audioPath}"`);

                const transcription = await groq.audio.transcriptions.create({
                  file: fs.createReadStream(audioPath),
                  model: "whisper-large-v3",
                });

                aiData.transcript = transcription.text;

                if (!aiData.transcript || aiData.transcript.trim().length < 10) {
                  aiData.title = "Screen recording (no audio)";
                  aiData.summary = "This recording appears to contain only visual content.";
                } else {
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
                  } catch {
                    aiData.title = "Generated Summary";
                    aiData.summary = content.slice(0, 500);
                  }
                }
              }
            }
          }

          await axios.post(
            `${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/api/recording/${userId}/transcribe`,
            {
              filename,
              content: JSON.stringify({ title: aiData.title, summary: aiData.summary }),
              transcript: aiData.transcript,
              source: publicUrl,
            }
          );

          await axios.post(
            `${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/api/recording/${userId}/complete`,
            { filename }
          );
        } catch (error) {
          console.error("AI processing error:", error.message);
        } finally {
          if (fs.existsSync(audioPath)) {
            try { fs.unlinkSync(audioPath); } catch {}
          }
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error("Failed to delete temp file:", err);
            });
          }
        }
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    for (const [filename, stream] of Object.entries(activeStreams)) {
      if (stream) {
        stream.destroy();
        delete activeStreams[filename];
        const tempFile = path.join(TEMP_DIR, filename);
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
server.listen(PORT, () => console.log(`Socket.IO processing server on ${PORT}`));
