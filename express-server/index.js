require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// CORS config — allow Next.js and Electron app
const io = new Server(server, {
  cors: {
    origin: [
      process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000",
      "http://localhost:5173", // Electron dev
    ],
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: [
      process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000",
      "http://localhost:5173",
    ],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", server: "Venus Express Server" });
});

// ============ Socket.IO Events ============

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // ---- Studio events (from Electron desktop app) ----

  // User starts recording
  socket.on("start-recording", (data) => {
    console.log("🎬 Recording started:", data.clerkId);
    // Broadcast to web app that recording is in progress
    socket.broadcast.emit("recording-started", {
      clerkId: data.clerkId,
    });
  });

  // Receive video chunks from desktop app
  socket.on("video-chunks", async (data) => {
    const { chunks, clerkId, filename } = data;
    console.log(`📦 Received chunk for: ${filename}`);

    // In production: stream chunks to S3 or temp storage
    // For now, broadcast to web app
    socket.broadcast.emit("video-chunk-received", {
      clerkId,
      filename,
      chunkSize: chunks?.length || 0,
    });
  });

  // Recording completed — process the video
  socket.on("stop-recording", async (data) => {
    const { clerkId, filename } = data;
    console.log("⏹️ Recording stopped:", filename);

    socket.broadcast.emit("recording-stopped", {
      clerkId,
      filename,
    });
  });

  // ---- Processing events ----

  // Request to process a video (transcription, AI summary)
  socket.on("process-video", async (data) => {
    const { videoId, clerkId } = data;
    console.log("🔄 Processing video:", videoId);

    // Emit processing status updates
    socket.emit("processing-status", {
      videoId,
      status: "processing",
      step: "Generating transcription...",
    });

    // In production: call Whisper API, then OpenAI for summary
    // For now, simulate processing
    setTimeout(() => {
      socket.emit("processing-status", {
        videoId,
        status: "completed",
        step: "Processing complete",
      });
    }, 3000);
  });

  // ---- Workspace events ----

  // Join workspace room for real-time updates
  socket.on("join-workspace", (workspaceId) => {
    socket.join(workspaceId);
    console.log(`👤 Socket ${socket.id} joined workspace: ${workspaceId}`);
  });

  // Leave workspace room
  socket.on("leave-workspace", (workspaceId) => {
    socket.leave(workspaceId);
    console.log(`👤 Socket ${socket.id} left workspace: ${workspaceId}`);
  });

  // New video uploaded — notify workspace
  socket.on("new-video", (data) => {
    const { workspaceId, video } = data;
    io.to(workspaceId).emit("video-added", video);
  });

  // Comment added — notify workspace
  socket.on("new-comment", (data) => {
    const { workspaceId, comment } = data;
    io.to(workspaceId).emit("comment-added", comment);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// ============ REST API Routes ============

// Video streaming endpoint
app.get("/api/video/:videoId", async (req, res) => {
  const { videoId } = req.params;

  // In production: stream video from S3/CloudFront
  // For now, return a placeholder response
  res.json({
    message: "Video streaming endpoint",
    videoId,
    note: "Connect S3/CloudFront for actual streaming",
  });
});

// ============ Start Server ============

const PORT = process.env.EXPRESS_PORT || 5050;

server.listen(PORT, () => {
  console.log(`\n🚀 Venus Express Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}`);
  console.log(`   Socket.IO: ws://localhost:${PORT}`);
  console.log("");
});
