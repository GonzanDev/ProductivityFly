const { app, BrowserWindow, dialog, globalShortcut } = require("electron");

// Clear user tasks (optional)
app.setUserTasks([]);

// Variable to store the path of the executable that will stop the bugs
let stopExecutablePath = "";

/**
 * Create the main Electron window
 */
function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true, // full screen
    alwaysOnTop: true, // always on top
    transparent: true, // transparent background
    frame: false, // no window bar
    skipTaskbar: true, // does not appear in the taskbar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver"); // more aggressive mode
  win.setVisibleOnAllWorkspaces(true); // visible on all desktops/monitors

  // Ignore mouse events, but allow interaction with windows underneath
  win.setIgnoreMouseEvents(true, { forward: true });

  // Load the main interface (canvas with bugs)
  win.loadFile("index.html");

  // Register global shortcut to run the stop program
  globalShortcut.register("Control+Shift+X", () => {
    runStop(win);
  });
}

/**
 * Run the selected program and send message to renderer
 */
function runStop() {
  const { exec } = require("child_process");

  if (!stopExecutablePath) return;

  // Open the executable
  exec(`"${stopExecutablePath}"`, (err) => {
    if (err) console.error("Error running stop:", err);

    // Close the app immediately
    app.quit();
  });
}

/**
 * Select the stop executable before starting the app
 */
async function selectStopExecutable() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Select an executable to stop the flies",
    message: "If you do not select a file, the application will close",
    properties: ["openFile"],
    filters: [
      {
        name: "Executables",
        extensions: process.platform === "win32" ? ["exe"] : ["app", "sh"],
      },
    ],
  });

  if (canceled || filePaths.length === 0) {
    app.quit();
    return false;
  }

  stopExecutablePath = filePaths[0];
  return true;
}

// When the app is ready
app.whenReady().then(async () => {
  const selected = await selectStopExecutable();
  if (selected) createWindow();
});

// Close the app if all windows are closed
app.on("window-all-closed", () => {
  app.quit();
});
