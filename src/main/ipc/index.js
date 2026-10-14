import { registerInventarioIpc } from './inventario.ipc';
import { registerReportesIpc } from './reportes.ipc';

export const registerAllIpc = () => {
  registerInventarioIpc();
  registerReportesIpc(); // Registramos el nuevo IPC
};