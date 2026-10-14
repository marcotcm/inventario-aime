import { ipcMain } from 'electron';
import { reportesService } from '../services/reportes.service';

export const registerReportesIpc = () => {
  ipcMain.handle('reportes:exportar', async (_event, { formato, tipoReporte, data, dateRange }) => {
    try {
      const res = await reportesService.exportar(formato, tipoReporte, data, dateRange);
      return { ok: true, ...res };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
};