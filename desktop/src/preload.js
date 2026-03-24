const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getSources: () => ipcRenderer.invoke("get-sources"),
  onAuthToken: (callback) => ipcRenderer.on("auth-token", (event, token) => callback(token)),
  onAuthSuccess: (callback) => ipcRenderer.on("auth-success", (event, data) => callback(data)),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
  // Secure Storage
  setToken: (token) => ipcRenderer.invoke("set-token", token),
  getToken: () => ipcRenderer.invoke("get-token"),
  setUserId: (userId) => ipcRenderer.invoke("set-user-id", userId),
  getUserId: () => ipcRenderer.invoke("get-user-id"),
  deleteAuth: () => ipcRenderer.invoke("delete-auth"),
});
