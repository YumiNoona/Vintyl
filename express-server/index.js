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

const app = express();
const server = http.createServer(app);

// Initialize Supabase & Gemini
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

const recordedChunks = {}; // In-memory storage for chunks per filename

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("start-recording", async (data) => {
    const { userId } = data;
    console.log(`⏺️ User ${userId} started recording`);
    
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/processing`);
      socket.emit("user-info", { plan: res.data.plan || "FREE" });
    } catch (err) {
      socket.emit("user-info", { plan: "FREE" });
    }
  });

  socket.on("video-chunks", (data) => {
    const { chunks, filename } = data;
    if (!recordedChunks[filename]) recordedChunks[filename] = [];
    recordedChunks[filename].push(Buffer.from(chunks));
    console.log(`📦 Chunk added to ${filename}`);
  });

  socket.on("process-video", async (data) => {
    const { filename, userId } = data;
    console.log(`🔄 Processing ${filename} for user ${userId}`);

    try {
      const chunks = recordedChunks[filename];
      if (!chunks) {
        return socket.emit("error", { message: "No chunks found for this file" });
      }

      // Security Check: Verify user exists/active via Next.js
      const verifyRes = await axios.get(`${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/processing`);
      if (verifyRes.status !== 200) {
        return socket.emit("error", { message: "Unauthorized or invalid user session" });
      }

      const buffer = Buffer.concat(chunks);
      const filePath = path.join(__dirname, "temp_upload", filename);
      
      // Ensure directory exists
      if (!fs.existsSync(path.join(__dirname, "temp_upload"))) {
        fs.mkdirSync(path.join(__dirname, "temp_upload"));
      }
      
      fs.writeFileSync(filePath, buffer);

      // 1. Initial Processing Call to Next.js
      const processingRes = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/processing`,
        { filename }
      );

      if (processingRes.status !== 200) {
        throw new Error("Failed to signal processing to Next.js");
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

      // 3. Get Plan & AI Processing (Gemini 2.5 Flash)
      const userPlan = processingRes.data.plan || "FREE";
      console.log(`👤 User Plan: ${userPlan}`);
      
      let aiData = { transcript: "", title: "Untitled", summary: "" };

      // Gate AI features: STANDARD and above get AI
      if (userPlan !== "FREE") {
        console.log("🤖 Running Gemini AI...");
        const base64Data = fileBuffer.toString("base64");
        
        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: "video/webm",
            },
          },
          "Transcribe this video accurately. Then provide a concise title and a 2-sentence summary. Respond ONLY in valid JSON format: { \"transcript\": \"...\", \"title\": \"...\", \"summary\": \"...\" }",
        ]);

        const aiResponseText = result.response.text();
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : { transcript: "AI transcription not available for this plan", title: "Untitled", summary: "Please upgrade to Standard or Pro for AI summaries." };
        console.log("📝 AI Enrichment Complete");
      } else {
        console.log("⏭️ Skipping AI (Free Tier)");
      }

      // 4. Update Next.js with Transcription/Summary & Public URL
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      const publicUrl = publicUrlData.publicUrl;

      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/transcribe`,
        {
          filename,
          content: JSON.stringify({ title: aiData.title, summary: aiData.summary }),
          transcript: aiData.transcript,
          source: publicUrl, // Pass the new Supabase URL
        }
      );

      // 5. Complete Processing Call
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/recording/${userId}/complete`,
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
