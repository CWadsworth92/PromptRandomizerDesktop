const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktopAPI", {
  loadState: () => ipcRenderer.invoke("state:load"),
  saveState: state => ipcRenderer.invoke("state:save", state),
  importConfig: () => ipcRenderer.invoke("config:import"),
  importWorkflow: () => ipcRenderer.invoke("workflow:import"),
  exportConfig: payload => ipcRenderer.invoke("config:export", payload),
  copy: text => ipcRenderer.invoke("clipboard:copy", text),
  testComfy: baseUrl => ipcRenderer.invoke("comfy:test", baseUrl),
  queueComfy: request => ipcRenderer.invoke("comfy:queue", request)
});
