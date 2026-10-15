import { ipcMain } from 'electron';
import { dashboardService } from '../services/dashboard.service';

export const registerDashboardIpc = () => {
  ipcMain.handle('dashboard:obtener-resumen', async () => {
    try {
      const data = dashboardService.obtenerResumen();
      return { ok: true, data };
    } catch (error) {
      console.error('Error al obtener el resumen del dashboard:', error);
      return { ok: false, error: error.message };
    }
  });
};
