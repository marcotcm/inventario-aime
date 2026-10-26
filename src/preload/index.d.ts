import { ElectronAPI } from '@electron-toolkit/preload';

export interface InventarioAPI {
  obtener: (filtros?: any) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
  obtenerMovimientos: (tipo?: string) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
  crear: (material: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
  actualizar: (code: string, datos: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
  registrarEntrada: (datos: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
  registrarSalida: (datos: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
  exportar: () => Promise<{ ok: boolean; exported?: boolean; filePath?: string; error?: string }>;
  actualizarSerials: (code: string, serials: string[]) => Promise<{ ok: boolean; data?: any; error?: string }>;
}

export interface PedidosAPI {
  obtener: () => Promise<{ ok: boolean; data?: any[]; error?: string }>;
  crear: (datos: any) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
  recibirParcial: (datos: any) => Promise<{ ok: boolean; data?: any[]; error?: string }>;
}

export interface ProveedoresAPI {
  obtener: () => Promise<{ ok: boolean; data?: any[]; error?: string }>;
  crear: (datos: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
}

export interface ReportesAPI {
  exportar: (args: any) => Promise<any>;
}

export interface DashboardAPI {
  obtenerResumen: () => Promise<{ ok: boolean; data?: any; error?: string }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      inventario: InventarioAPI;
      pedidos: PedidosAPI;
      proveedores: ProveedoresAPI;
      reportes: ReportesAPI;
      dashboard: DashboardAPI;
    };
  }
}