import { ipcMain } from 'electron';
import { proveedorService } from '../services/proveedor.service';

export const registerProveedorIpc = () => {
  ipcMain.handle('proveedores:obtener', async () => {
    try {
      const data = proveedorService.listarProveedores();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('proveedores:crear', async (_event, datos) => {
    try {
      const data = proveedorService.crearProveedor(datos);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
};
