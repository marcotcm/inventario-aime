import { getDb } from '../database/connection';
import { ProveedorModel } from '../models/proveedor.model';

export const proveedorCrud = {
  obtenerTodos: () => {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM proveedores ORDER BY nombre ASC').all();
    return rows.map(r => new ProveedorModel(r));
  },
  crear: (nombre, rif, telefono) => {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)');
    const info = stmt.run(nombre, rif, telefono);
    return new ProveedorModel({ id: info.lastInsertRowid, nombre, rif, telefono });
  }
};