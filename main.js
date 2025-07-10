import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// eslint-disable-next-line no-undef
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let isWindowVisible = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    center: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Hide window when it loses focus
  mainWindow.on('blur', () => {
    if (isWindowVisible) {
      hideWindow();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function showWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    isWindowVisible = true;
  }
}

function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
    isWindowVisible = false;
  }
}

function toggleWindow() {
  if (isWindowVisible) {
    hideWindow();
  } else {
    showWindow();
  }
}

app.whenReady().then(() => {
  createWindow();

  // IPC handler for hiding window
  ipcMain.handle('hide-window', () => {
    hideWindow();
  });

  // IPC handler for resizing window
  ipcMain.handle('resize-window', (event, width, height) => {
    if (mainWindow) {
      mainWindow.setSize(width, height);
      mainWindow.center();
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
      const x = Math.round((screenWidth - width) / 2);
      const y = Math.round((screenHeight - height) / 2);
      mainWindow.setBounds({ x, y, width, height });
    }
  });

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+Space', toggleWindow) ||
  
  // Escape key handled by the React app, not globally

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // eslint-disable-next-line no-undef
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Prevent the app from quitting when all windows are closed on macOS
app.on('before-quit', (event) => {
  // eslint-disable-next-line no-undef
  if (process.platform === 'darwin') {
    event.preventDefault();
    hideWindow();
  }
});