const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktopAPI", {
  loadState: () => ipcRenderer.invoke("state:load"),
  saveState: state => ipcRenderer.invoke("state:save", state),
  importConfig: () => ipcRenderer.invoke("config:import"),
  exportConfig: payload => ipcRenderer.invoke("config:export", payload),
  copy: text => ipcRenderer.invoke("clipboard:copy", text)
});
