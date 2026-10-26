import { ipcMain } from 'electron';
import { pedidosService } from '../services/pedidos.service';

export const registerPedidosIpc = () => {
  ipcMain.handle('pedidos:obtener', async () => {
    try {
      const data = pedidosService.listarPedidos();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('pedidos:crear', async (_event, datos) => {
    try {
      const data = pedidosService.crearPedido(datos);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle('pedidos:recibir-parcial', async (_event, datos) => {
    try {
      const data = pedidosService.recibirParcial(datos);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
};