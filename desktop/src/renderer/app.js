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
const unlinkBtn = document.getElementById("unlink-btn");
const accountStatus = document.getElementById("account-status");
const accountInfo = document.getElementById("account-info");
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
let authToken = null;
let userId = null;
let pendingChunks = 0; // track in-flight async reads

// ===== Initialize =====
async function initAuth() {
  authToken = await window.electronAPI.getToken();
  userId = await window.electronAPI.getUserId();
  
  updateAuthUI();
  if (authToken) {
    connectSocket();
  }
}

function updateAuthUI() {
  if (authToken) {
    userDisplay.textContent = "Linked Account";
    linkBtn.style.display = "none";
    accountInfo.style.display = "flex";
  } else {
    userDisplay.textContent = "Not Linked";
    linkBtn.style.display = "block";
    accountInfo.style.display = "none";
    planBadge.style.display = "none";
  }
}

initAuth();

// ===== Socket.IO Connection =====
function connectSocket() {
  if (!authToken) return;

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token: `Bearer ${authToken}` }, // Standardized Bearer format
  });

  socket.on("connect", () => {
    statusDot.className = "status-dot connected";
    statusText.textContent = "Connected to server";
    updateAuthUI();
  });

  socket.on("connect_error", (err) => {
    statusDot.className = "status-dot disconnected";
    statusText.textContent = `Auth error: ${err.message}`;
    if (err.message.includes("auth") || err.message.includes("token")) {
      // Token might be expired
      unlinkAccount();
    }
  });

  socket.on("disconnect", () => {
    statusDot.className = "status-dot disconnected";
    statusText.textContent = "Disconnected";
  });

  socket.on("user-info", (data) => {
    userPlan = data.plan;
    const email = data.email || "Linked";
    document.querySelector(".user-email").textContent = email;
    planBadge.textContent = userPlan;
    planBadge.className = `badge ${userPlan.toLowerCase()}`;
    planBadge.style.display = "inline-block";
    statusText.textContent = userPlan === "FREE" ? "Free Plan: 5m / 720p limit" : "Premium: 1080p enabled";
  });

  socket.on("processing-status", (data) => {
    statusText.textContent = data.step;
  });
}

if (currentToken) {
  connectSocket();
}

// ===== Account Linking Logic =====
linkBtn.addEventListener("click", () => {
  // Open browser for auth
  const authUrl = "http://localhost:3000/desktop-auth"; 
  window.open(authUrl, "_blank");
});

async function unlinkAccount() {
  authToken = null;
  userId = null;
  await window.electronAPI.deleteAuth();
  if (socket) socket.disconnect();
  updateAuthUI();
  statusText.textContent = "Account unlinked";
}

unlinkBtn.addEventListener("click", unlinkAccount);

// Listen for token from deep link (via main -> preload -> here)
window.electronAPI.onAuthSuccess(async (data) => {
  console.log("Received auth success via deep link");
  const { token, userId: id } = data;
  
  authToken = token;
  userId = id;
  
  await window.electronAPI.setToken(token);
  await window.electronAPI.setUserId(id);
  
  connectSocket();
  updateAuthUI();
  statusText.textContent = "Account linked successfully";
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
  if (!authToken) {
    statusText.textContent = "⚠️ Please link account first";
    return;
  }

  currentFilename = `recording-${Date.now()}.webm`;
  pendingChunks = 0;

  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
  } catch {
    console.log("Mic access denied or unavailable");
  }

  // Low bitrate to prevent frame drops and memory pressure
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp8",
    videoBitsPerSecond: 1_000_000, // 1 Mbps
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0 && socket?.connected) {
      pendingChunks++;
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("video-chunks", {
          chunks: reader.result,
          filename: currentFilename,
        });
        pendingChunks--;
        // If recorder stopped and this was last chunk, signal server
        if (mediaRecorder.state === "inactive" && pendingChunks === 0) {
          socket.emit("process-video", { filename: currentFilename });
        }
      };
      reader.readAsArrayBuffer(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    statusText.textContent = "Processing...";
    startBtn.disabled = true;

    // Wait for any in-flight FileReader callbacks to finish
    const waitAndSend = () => {
      if (pendingChunks > 0) {
        setTimeout(waitAndSend, 100);
        return;
      }
      if (socket?.connected) {
        socket.emit("process-video", { filename: currentFilename });
      }
    };
    waitAndSend();

    socket.once("processing-complete", () => {
      statusText.textContent = "Done! Video saved.";
      setTimeout(resetUI, 3000);
    });

    socket.once("error", (err) => {
      statusText.textContent = `Error: ${err.message}`;
      setTimeout(resetUI, 5000);
    });
  };

  // 1s chunks ~ balanced between latency and throughput
  mediaRecorder.start(1000);

  if (socket?.connected) {
    socket.emit("start-recording");
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
