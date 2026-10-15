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
  ipcMain.handle('inventario:actualizar', async (_event, code, datos) => {
    try {
      const data = inventarioService.actualizarMaterial(code, datos);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
  ipcMain.handle('inventario:actualizar-serials', async (_event, code, serials) => {
    try {
      const data = inventarioService.actualizarSerialesStock(code, serials);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
};