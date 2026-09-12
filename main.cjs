const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const statePath = () => path.join(app.getPath("userData"), "state.json");

async function readState() {
  try { return JSON.parse(await fs.readFile(statePath(), "utf8")); }
  catch { return null; }
}
async function writeState(state) {
  await fs.mkdir(path.dirname(statePath()), { recursive: true });
  await fs.writeFile(statePath(), JSON.stringify(state, null, 2), "utf8");
  return true;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1500, height: 920, minWidth: 1050, minHeight: 680,
    backgroundColor: "#090a10",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, "src", "index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("state:load", readState);
  ipcMain.handle("state:save", (_event, state) => writeState(state));
  ipcMain.handle("config:import", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "JSON", extensions: ["json"] }] });
    if (result.canceled) return null;
    return JSON.parse(await fs.readFile(result.filePaths[0], "utf8"));
  });
  ipcMain.handle("config:export", async (_event, payload) => {
    const result = await dialog.showSaveDialog({ defaultPath: `prompt-randomizer-${payload.mode}.json`, filters: [{ name: "JSON", extensions: ["json"] }] });
    if (result.canceled) return false;
    await fs.writeFile(result.filePath, JSON.stringify(payload.config, null, 2), "utf8");
    return true;
  });
  ipcMain.handle("clipboard:copy", (_event, text) => require("electron").clipboard.writeText(text));
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length || createWindow());
});
app.on("window-all-closed", () => process.platform === "darwin" || app.quit());
