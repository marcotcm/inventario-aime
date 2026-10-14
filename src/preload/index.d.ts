import { ElectronAPI } from '@electron-toolkit/preload';

export interface InventarioAPI {
  obtener: (filtros?: any) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
  crear: (material: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
  registrarEntrada: (datos: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
  registrarSalida: (datos: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
  exportar: () => Promise<{ ok: boolean; exported?: boolean; filePath?: string; error?: string }>;
}
export interface ReportesAPI {
  exportar: (args: { formato: 'PDF' | 'EXCEL', tipoReporte: string, data: any[], dateRange: any }) => Promise<{ ok: boolean; exported?: boolean; filePath?: string; error?: string }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      inventario: InventarioAPI;
      reportes: ReportesAPI;
    };
  }
}