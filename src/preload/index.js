import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  inventario: {
    obtener: (filtros) => ipcRenderer.invoke('inventario:obtener', filtros),
    crear: (material) => ipcRenderer.invoke('inventario:crear', material),
    registrarEntrada: (datos) => ipcRenderer.invoke('inventario:registrar-entrada', datos),
    registrarSalida: (datos) => ipcRenderer.invoke('inventario:registrar-salida', datos),
    exportar: () => ipcRenderer.invoke('inventario:exportar')
  },
  reportes: {
    exportar: (args) => ipcRenderer.invoke('reportes:exportar', args)
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}