// eslint-disable-next-line no-undef
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  resizeWindow: (width, height) => ipcRenderer.invoke('resize-window', width, height)
});