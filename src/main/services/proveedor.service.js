import { proveedorCrud } from '../crud/proveedor.crud';

export const proveedorService = {
  listarProveedores: () => proveedorCrud.obtenerTodos(),
  crearProveedor: (datos) => {
    if (!datos.nombre || !datos.nombre.trim()) {
      throw new Error('El nombre del proveedor es obligatorio.');
    }
    return proveedorCrud.crear(datos.nombre, datos.rif, datos.telefono);
  }
};