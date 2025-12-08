// Preload script runs in renderer process with Node.js access
// Use contextBridge to expose safe APIs to the renderer

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for window controls
contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  // Widget data sync
  saveWidgetData: (data) => ipcRenderer.send('save-widget-data', data),
  loadWidgetData: () => ipcRenderer.invoke('load-widget-data'),
});
