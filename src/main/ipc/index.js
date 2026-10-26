import { registerInventarioIpc } from './inventario.ipc';
import { registerSalidaIpc } from './salida.ipc';
import { registerProveedorIpc } from './proveedor.ipc';
import { registerReportesIpc } from './reportes.ipc';
import { registerDashboardIpc } from './dashboard.ipc';
import { registerPedidosIpc } from './pedidos.ipc'; // <--- AGREGADO

export const registerAllIpc = () => {
  registerInventarioIpc();
  registerSalidaIpc();
  registerProveedorIpc();
  registerReportesIpc();
  registerDashboardIpc();
  registerPedidosIpc(); // <--- AGREGADO
};