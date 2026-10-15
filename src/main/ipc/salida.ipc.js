import { ipcMain } from 'electron';
import { salidaService } from '../services/salida.service';

export const registerSalidaIpc = () => {
  ipcMain.handle('inventario:movimientos', async (_event, tipo) => {
    try {
      const data = salidaService.listarMovimientos(tipo);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('inventario:registrar-entrada', async (_event, datosEntrada) => {
    try {
      const data = salidaService.procesarEntrada(datosEntrada);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('inventario:registrar-salida', async (_event, datosSalida) => {
    try {
      const data = salidaService.procesarSalida(datosSalida);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
};