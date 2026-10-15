import { registerInventarioIpc } from './inventario.ipc';
import { registerSalidaIpc } from './salida.ipc';
import { registerProveedorIpc } from './proveedor.ipc';
import { registerReportesIpc } from './reportes.ipc';

export const registerAllIpc = () => {
  registerInventarioIpc();
  registerSalidaIpc();
  registerProveedorIpc();
  registerReportesIpc();
};