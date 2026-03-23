// Vintyl Desktop — Renderer Script
// socket.io-client is loaded via CDN in index.html

// ===== Config =====
const SOCKET_URL = "http://localhost:5050";

// ===== DOM Elements =====
const sourceSelect = document.getElementById("source-select");
const refreshBtn = document.getElementById("refresh-sources");
const preview = document.getElementById("preview");
const previewPlaceholder = document.getElementById("preview-placeholder");
const webcamToggle = document.getElementById("webcam-toggle");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const timerEl = document.getElementById("timer");
const timerText = document.getElementById("timer-text");
const minimizeBtn = document.getElementById("minimize-btn");
const closeBtn = document.getElementById("close-btn");

// ===== State =====
let mediaRecorder = null;
let stream = null;
let timerInterval = null;
let seconds = 0;
let socket = null;
let currentFilename = "";

// ===== Socket.IO Connection =====
function connectSocket() {
  socket = io(SOCKET_URL);

  socket.on("connect", () => {
    statusDot.className = "status-dot connected";
    statusText.textContent = "Connected to server";
  });

  socket.on("disconnect", () => {
    statusDot.className = "status-dot disconnected";
    statusText.textContent = "Disconnected";
  });

  socket.on("connect_error", () => {
    statusDot.className = "status-dot disconnected";
    statusText.textContent = "Server offline";
  });

  socket.on("processing-status", (data) => {
    statusText.textContent = data.step;
  });
}

connectSocket();

// ===== Window Controls =====
minimizeBtn.addEventListener("click", () => {
  window.electronAPI.minimizeWindow();
});

closeBtn.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    stopRecording();
  }
  window.electronAPI.closeWindow();
});

// ===== Screen Sources =====
async function loadSources() {
  const sources = await window.electronAPI.getSources();
  sourceSelect.innerHTML = '<option value="">Select a source...</option>';

  sources.forEach((source) => {
    const option = document.createElement("option");
    option.value = source.id;
    option.textContent = source.name;
    sourceSelect.appendChild(option);
  });
}

loadSources();
refreshBtn.addEventListener("click", loadSources);

// ===== Source Selection =====
sourceSelect.addEventListener("change", async () => {
  const sourceId = sourceSelect.value;
  if (!sourceId) {
    preview.style.display = "none";
    previewPlaceholder.style.display = "flex";
    startBtn.disabled = true;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    return;
  }

  try {
    // Get screen stream
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          maxWidth: 1920,
          maxHeight: 1080,
        },
      },
    });

    preview.srcObject = stream;
    preview.style.display = "block";
    previewPlaceholder.style.display = "none";
    startBtn.disabled = false;
  } catch (err) {
    console.error("Error getting source:", err);
    statusText.textContent = "Error: Could not capture source";
  }
});

// ===== Recording =====
async function startRecording() {
  if (!stream) return;

  currentFilename = `recording-${Date.now()}.webm`;

  // Add audio from system if available
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
  } catch {
    console.log("No audio available");
  }

  // Create recorder
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0 && socket?.connected) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("video-chunks", {
          chunks: reader.result,
          filename: currentFilename,
          clerkId: "user_3AsUYxoNXjNqqxQ8RYa01E8LfXh", // Hardcoded for now
        });
      };
      reader.readAsArrayBuffer(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    statusText.textContent = "Processing video...";
    startBtn.disabled = true;

    if (socket?.connected) {
      socket.emit("process-video", {
        filename: currentFilename,
        clerkId: "user_3AsUYxoNXjNqqxQ8RYa01E8LfXh",
      });
    }

    socket.on("processing-complete", () => {
      statusText.textContent = "Done! Video saved.";
      setTimeout(resetUI, 3000);
    });

    socket.on("error", (err) => {
      statusText.textContent = `Error: ${err.message}`;
      setTimeout(resetUI, 5000);
    });
  };

  // Start recording (chunk every 1 second)
  mediaRecorder.start(1000);

  // Notify server
  if (socket?.connected) {
    socket.emit("start-recording", {
      clerkId: "desktop-user",
    });
  }

  // UI updates
  startBtn.style.display = "none";
  stopBtn.style.display = "flex";
  stopBtn.disabled = false;
  sourceSelect.disabled = true;
  refreshBtn.disabled = true;

  statusDot.className = "status-dot recording";
  statusText.textContent = "Recording...";

  // Start timer
  seconds = 0;
  timerEl.style.display = "block";
  updateTimer();
  timerInterval = setInterval(() => {
    seconds++;
    updateTimer();
  }, 1000);
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }

  clearInterval(timerInterval);
}

function resetUI() {
  startBtn.style.display = "flex";
  stopBtn.style.display = "none";
  sourceSelect.disabled = false;
  refreshBtn.disabled = false;
  timerEl.style.display = "none";

  statusDot.className = socket?.connected
    ? "status-dot connected"
    : "status-dot disconnected";
  statusText.textContent = socket?.connected
    ? "Recording saved!"
    : "Disconnected";
}

function updateTimer() {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  timerText.textContent = `${mins}:${secs}`;
}

// ===== Button Events =====
startBtn.addEventListener("click", startRecording);
stopBtn.addEventListener("click", stopRecording);
