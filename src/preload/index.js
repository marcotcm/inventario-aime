import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  inventario: {
    obtener: (filtros) => ipcRenderer.invoke('inventario:obtener', filtros),
    obtenerMovimientos: (tipo) => ipcRenderer.invoke('inventario:movimientos', tipo),
    crear: (material) => ipcRenderer.invoke('inventario:crear', material),
    actualizar: (code, datos) => ipcRenderer.invoke('inventario:actualizar', code, datos), // <--- AGREGAR ESTA LÍNEA
    registrarEntrada: (datos) => ipcRenderer.invoke('inventario:registrar-entrada', datos),
    registrarSalida: (datos) => ipcRenderer.invoke('inventario:registrar-salida', datos),
    exportar: () => ipcRenderer.invoke('inventario:exportar') ,
    actualizarSerials: (code, serials) => ipcRenderer.invoke('inventario:actualizar-serials', code, serials)
  },
  reportes: {
    exportar: (args) => ipcRenderer.invoke('reportes:exportar', args)
  },
  dashboard: {
    obtenerResumen: () => ipcRenderer.invoke('dashboard:obtener-resumen')
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