const { app, BrowserWindow, desktopCapturer, ipcMain, shell } = require("electron");
const path = require("path");
const keytar = require("keytar");

let mainWindow;

const SERVICE_NAME = "vintyl";
const ACCOUNT_NAME = "auth_token";
const USER_ID_ACCOUNT = "user_id";

// Deep linking protocol registration
app.setAsDefaultProtocolClient("vintyl");

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      // Protocol handler for Windows/Linux
      const url = commandLine.find((arg) => arg.startsWith("vintyl://"));
      if (url) {
        handleDeepLink(url);
      }
    }
  });

  app.whenReady().then(createWindow);
}

function handleDeepLink(url) {
  try {
    const rawUrl = new URL(url);
    if (rawUrl.hostname === "auth") {
      const token = rawUrl.searchParams.get("token");
      const userId = rawUrl.searchParams.get("userId");
      
      if (token && userId) {
        mainWindow?.webContents.send("auth-success", {
          token,
          userId,
        });
      }
    }
  } catch (e) {
    console.error("Failed to parse deep link URL:", url);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    frame: false,
    transparent: false,
    resizable: true,
    alwaysOnTop: true,
    title: "Vintyl Desktop",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  // Open DevTools in dev mode
  if (process.argv.includes("--dev")) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

// macOS deep link handler
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Get available screen sources for recording
ipcMain.handle("get-sources", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 150, height: 100 },
  });

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
  }));
});

// Secure Storage Handlers
ipcMain.handle("set-token", async (_, token) => {
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token);
});

ipcMain.handle("get-token", async () => {
  return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
});

ipcMain.handle("set-user-id", async (_, userId) => {
  await keytar.setPassword(SERVICE_NAME, USER_ID_ACCOUNT, userId);
});

ipcMain.handle("get-user-id", async () => {
  return await keytar.getPassword(SERVICE_NAME, USER_ID_ACCOUNT);
});

ipcMain.handle("delete-auth", async () => {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  await keytar.deletePassword(SERVICE_NAME, USER_ID_ACCOUNT);
});

// Window controls
ipcMain.on("minimize-window", () => {
  mainWindow?.minimize();
});

ipcMain.on("close-window", () => {
  mainWindow?.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
