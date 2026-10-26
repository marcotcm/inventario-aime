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
    const nombreClean = (nombre || '').trim();
    
    // Evitar que colapse si el proveedor ya existe en la base de datos
    const existe = db.prepare('SELECT * FROM proveedores WHERE nombre = ? COLLATE NOCASE').get(nombreClean);
    if (existe) {
      return new ProveedorModel(existe);
    }

    const stmt = db.prepare('INSERT INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)');
    const info = stmt.run(nombreClean, (rif || '').trim(), (telefono || '').trim());
    return new ProveedorModel({ id: info.lastInsertRowid, nombre: nombreClean, rif, telefono });
  }
};