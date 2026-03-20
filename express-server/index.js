require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { OpenAI } = require("openai");
const { Readable } = require("stream");

const app = express();
const server = http.createServer(app);

// Initialize S3 & OpenAI
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const recordedChunks = {}; // In-memory storage for chunks per filename

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("video-chunks", (data) => {
    const { chunks, filename } = data;
    if (!recordedChunks[filename]) recordedChunks[filename] = [];
    recordedChunks[filename].push(Buffer.from(chunks));
    console.log(`📦 Chunk added to ${filename}`);
  });

  socket.on("process-video", async (data) => {
    const { filename, clerkId } = data;
    console.log(`🔄 Processing ${filename} for user ${clerkId}`);

    try {
      const chunks = recordedChunks[filename];
      if (!chunks) {
        return socket.emit("error", { message: "No chunks found for this file" });
      }

      const buffer = Buffer.concat(chunks);
      const filePath = path.join(__dirname, "temp_upload", filename);
      fs.writeFileSync(filePath, buffer);

      // 1. Initial Processing Call to Next.js
      const processingRes = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${clerkId}/processing`,
        { filename }
      );

      if (processingRes.status !== 200) {
        throw new Error("Failed to signal processing to Next.js");
      }

      // 2. Upload to S3
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: fs.createReadStream(filePath),
        ContentType: "video/webm",
      };

      await s3.send(new PutObjectCommand(uploadParams));
      console.log("✅ Uploaded to S3");

      // 3. Transcription (Whisper)
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
      });
      console.log("📝 Transcribed");

      // 4. Summarization (GPT)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Generate a title and a concise summary for this video transcript. Return in JSON format: { \"title\": \"...\", \"summary\": \"...\" }",
          },
          { role: "user", content: transcription.text },
        ],
        response_format: { type: "json_object" },
      });
      console.log("💡 Summarized");

      // 5. Update Next.js with Transcription/Summary
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${clerkId}/transcribe`,
        {
          filename,
          content: completion.choices[0].message.content,
          transcript: transcription.text,
        }
      );

      // 6. Complete Processing Call
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${clerkId}/complete`,
        { filename }
      );

      // Cleanup
      delete recordedChunks[filename];
      fs.unlinkSync(filePath);
      console.log("✨ Done!");

      socket.emit("processing-complete", { filename });

    } catch (error) {
      console.error("❌ Processing error:", error);
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => delete recordedChunks[socket.id]);
});

const PORT = process.env.EXPRESS_PORT || 5050;
server.listen(PORT, () => console.log(`🚀 Express processing server on ${PORT}`));
