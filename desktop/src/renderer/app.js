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

// Account UI
const linkBtn = document.getElementById("link-btn");
const linkContainer = document.getElementById("link-input-container");
const userIdInput = document.getElementById("user-id-input");
const saveUserIdBtn = document.getElementById("save-user-id");
const userDisplay = document.getElementById("user-display");
const planBadge = document.getElementById("plan-badge");

// ===== State =====
let mediaRecorder = null;
let stream = null;
let timerInterval = null;
let seconds = 0;
let socket = null;
let currentFilename = "";
let userPlan = "FREE";
let currentUserId = localStorage.getItem("vintyl_user_id") || "";

// ===== Initialize =====
if (currentUserId) {
  userDisplay.textContent = "Linked Account";
  userIdInput.value = currentUserId;
}

// ===== Socket.IO Connection =====
function connectSocket() {
  socket = io(SOCKET_URL);

  socket.on("connect", () => {
    statusDot.className = "status-dot connected";
    statusText.textContent = "Connected to server";
    
    // Fetch plan on connect if linked
    if (currentUserId) {
      socket.emit("start-recording", { userId: currentUserId });
    }
  });

  socket.on("disconnect", () => {
    statusDot.className = "status-dot disconnected";
    statusText.textContent = "Disconnected";
  });

  socket.on("user-info", (data) => {
    userPlan = data.plan;
    console.log("Plan updated:", userPlan);
    planBadge.textContent = userPlan;
    planBadge.className = `badge ${userPlan.toLowerCase()}`;
    
    if (userPlan === "FREE") {
      statusText.textContent = "Free Plan: 5m / 720p limit";
    } else {
      statusText.textContent = "Premium: 1080p enabled";
    }
  });

  socket.on("processing-status", (data) => {
    statusText.textContent = data.step;
  });
}

connectSocket();

// ===== Account Linking Logic =====
linkBtn.addEventListener("click", () => {
  linkContainer.style.display = linkContainer.style.display === "none" ? "block" : "none";
});

saveUserIdBtn.addEventListener("click", () => {
  const newId = userIdInput.value.trim();
  if (newId) {
    currentUserId = newId;
    localStorage.setItem("vintyl_user_id", newId);
    userDisplay.textContent = "Linked Account";
    linkContainer.style.display = "none";
    
    // Refetch plan
    if (socket?.connected) {
      socket.emit("start-recording", { userId: currentUserId });
    }
  }
});

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
    // Set parameters based on plan
    const maxWidth = (userPlan === "FREE" || userPlan === "STANDARD") ? 1280 : 1920;
    const maxHeight = (userPlan === "FREE" || userPlan === "STANDARD") ? 720 : 1080;

    // Get screen stream
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          maxWidth: maxWidth, 
          maxHeight: maxHeight,
        },
      },
    });

    preview.srcObject = stream;
    preview.style.display = "block";
    previewPlaceholder.style.display = "none";
    startBtn.disabled = false;
  } catch (err) {
    console.error("Error getting source:", err);
    statusText.textContent = "Error: Capturing source failed";
  }
});

// ===== Recording =====
async function startRecording() {
  if (!stream) return;
  if (!currentUserId) {
    statusText.textContent = "⚠️ Please link account first";
    return;
  }

  currentFilename = `recording-${Date.now()}.webm`;

  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
  } catch {
    console.log("Mic access denied or unavailable");
  }

  mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0 && socket?.connected) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("video-chunks", {
          chunks: reader.result,
          filename: currentFilename,
          userId: currentUserId,
        });
      };
      reader.readAsArrayBuffer(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    statusText.textContent = "Processing...";
    startBtn.disabled = true;

    if (socket?.connected) {
      socket.emit("process-video", {
        filename: currentFilename,
        userId: currentUserId,
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

  mediaRecorder.start(1000);

  // Notify server to verify state
  if (socket?.connected) {
    socket.emit("start-recording", { userId: currentUserId });
  }

  startBtn.style.display = "none";
  stopBtn.style.display = "flex";
  stopBtn.disabled = false;
  sourceSelect.disabled = true;
  refreshBtn.disabled = true;

  statusDot.className = "status-dot recording";
  statusText.textContent = "Recording...";

  seconds = 0;
  timerEl.style.display = "block";
  updateTimer();
  timerInterval = setInterval(() => {
    seconds++;
    updateTimer();
    
    // Usage limits
    const timeLimit = userPlan === "FREE" ? 300 : (userPlan === "STANDARD" ? 900 : Infinity);
    if (seconds >= timeLimit) {
      stopRecording();
      statusText.textContent = "Plan limit reached";
    }
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
  statusText.textContent = socket?.connected ? "Ready" : "Disconnected";
}

function updateTimer() {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  timerText.textContent = `${mins}:${secs}`;
}

startBtn.addEventListener("click", startRecording);
stopBtn.addEventListener("click", stopRecording);
