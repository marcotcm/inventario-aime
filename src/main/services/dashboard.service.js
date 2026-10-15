import { dashboardCrud } from '../crud/dashboard.crud';

export const dashboardService = {
  obtenerResumen: () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const desde = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
    const hasta = new Date(Date.UTC(year, month + 1, 1)).toISOString().slice(0, 10);

    return dashboardCrud.obtenerResumen(desde, hasta);
  }
};
