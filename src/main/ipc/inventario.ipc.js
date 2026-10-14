import { ipcMain } from 'electron';
import { inventarioService } from '../services/inventario.service';

export const registerInventarioIpc = () => {
  ipcMain.handle('inventario:obtener', async (_event, filtros) => {
    try {
      const data = inventarioService.listarInventario(filtros);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('inventario:crear', async (_event, nuevoMaterial) => {
    try {
      const data = inventarioService.crearMaterial(nuevoMaterial);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('inventario:registrar-entrada', async (_event, datosEntrada) => {
    try {
      const data = inventarioService.procesarEntrada(datosEntrada);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('inventario:registrar-salida', async (_event, datosSalida) => {
    try {
      const data = inventarioService.procesarSalida(datosSalida);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('inventario:exportar', async () => {
    try {
      const res = await inventarioService.exportarCSV();
      return { ok: true, ...res };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
};