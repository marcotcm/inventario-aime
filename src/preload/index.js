import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  inventario: {
    obtener: (filtros) => ipcRenderer.invoke('inventario:obtener', filtros),
    obtenerMovimientos: (tipo) => ipcRenderer.invoke('inventario:movimientos', tipo),
    crear: (material) => ipcRenderer.invoke('inventario:crear', material),
    actualizar: (code, datos) => ipcRenderer.invoke('inventario:actualizar', code, datos),
    registrarEntrada: (datos) => ipcRenderer.invoke('inventario:registrar-entrada', datos),
    registrarSalida: (datos) => ipcRenderer.invoke('inventario:registrar-salida', datos),
    exportar: () => ipcRenderer.invoke('inventario:exportar'),
    actualizarSerials: (code, serials) => ipcRenderer.invoke('inventario:actualizar-serials', code, serials)
  },
  pedidos: { // <--- AGREGADO
    obtener: () => ipcRenderer.invoke('pedidos:obtener'),
    crear: (datos) => ipcRenderer.invoke('pedidos:crear', datos),
    recibirParcial: (datos) => ipcRenderer.invoke('pedidos:recibir-parcial', datos)
  },
  proveedores: { // <--- AGREGADO (Faltaba exponerlo)
    obtener: () => ipcRenderer.invoke('proveedores:obtener'),
    crear: (datos) => ipcRenderer.invoke('proveedores:crear', datos)
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