const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Shared data file path for widget integration
const getDataFilePath = () => {
  const appDataPath = path.join(app.getPath('home'), 'Library', 'Application Support', 'QuickNote');
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }
  return path.join(appDataPath, 'data.json');
};

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 520,
    frame: false,           // Remove window frame for custom look
    transparent: true,      // Enable transparency for glassmorphism effect
    backgroundColor: '#00000000', // Fully transparent background
    hasShadow: false,       // Remove window shadow on macOS
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Set always on top with floating level (allows input method to show above)
  mainWindow.setAlwaysOnTop(true, 'floating');

  // In development, load from Vite dev server
  // In production, load the built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Make window draggable via CSS -webkit-app-region: drag
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  app.setName('quicknote');
  createWindow();
});

// Handle always-on-top toggle from renderer
ipcMain.on('set-always-on-top', (event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag, 'floating');
  }
});

// Handle saving data to shared file for widget integration
ipcMain.on('save-widget-data', (event, data) => {
  try {
    const filePath = getDataFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save widget data:', err);
  }
});

// Handle reading data from shared file
ipcMain.handle('load-widget-data', async () => {
  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to load widget data:', err);
  }
  return null;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
