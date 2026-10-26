import { getDb } from '../database/connection';
import { ProductoModel } from '../models/producto.model';

export const productoCrud = {
  obtenerTodos: () => {
    const db = getDb();
    
    const query = `
      SELECT m.*, 
        (SELECT MAX(fecha_hora) FROM movimientos mov 
         JOIN movimiento_detalles det ON mov.id = det.movimiento_id 
         WHERE det.code = m.code) as last_mov_date
      FROM materiales m
      ORDER BY COALESCE(last_mov_date, m.created_at) DESC
    `;
    
    const materiales = db.prepare(query).all();
    
    return materiales.map(mat => {
      const serialRows = db.prepare('SELECT serial, proveedor_nombre, estado_material FROM material_stock WHERE code = ? AND estado = ?').all(mat.code, 'DISPONIBLE');
      const serials = serialRows.map(s => s.serial);
      const stock = serials.length;
      const status = ProductoModel.calcularEstado(stock, mat.min);
      
      return new ProductoModel({ ...mat, stock, status, serials, stockDetails: serialRows });
    });
  },

  obtenerPorCodigo: (code) => {
    const db = getDb();
    const mat = db.prepare('SELECT * FROM materiales WHERE code = ?').get(code.toUpperCase());
    if (!mat) return null;

    const serialRows = db.prepare('SELECT serial, proveedor_nombre, estado_material FROM material_stock WHERE code = ? AND estado = ?').all(mat.code, 'DISPONIBLE');
    const serials = serialRows.map(s => s.serial);
    const stock = serials.length;
    const status = ProductoModel.calcularEstado(stock, mat.min);

    return new ProductoModel({ ...mat, stock, status, serials, stockDetails: serialRows });
  },

  crear: (nuevoProducto) => {
    const db = getDb();
    const codigoLimpio = (nuevoProducto.code || '').trim().toUpperCase();

    if (!codigoLimpio || !(nuevoProducto.nombre || '').trim()) {
      throw new Error('El código y el nombre del material son obligatorios.');
    }

    const existe = db.prepare('SELECT code FROM materiales WHERE code = ?').get(codigoLimpio);
    if (existe) {
      throw new Error(`El código de material ${codigoLimpio} ya existe en el inventario.`);
    }

    db.prepare(`
      INSERT INTO materiales (code, nombre, descripcion, marca, modelo, departamento, cat, loc, unit, min, foto)
      VALUES (@code, @nombre, @descripcion, @marca, @modelo, @departamento, @cat, @loc, @unit, @min, @foto)
    `).run({
      code: codigoLimpio,
      nombre: nuevoProducto.nombre.trim(),
      descripcion: (nuevoProducto.descripcion || '').trim(),
      marca: nuevoProducto.marca || 'N/A',
      modelo: nuevoProducto.modelo || 'N/A',
      departamento: nuevoProducto.departamento || 'AIT',
      cat: nuevoProducto.cat || 'General',
      loc: nuevoProducto.loc || 'Almacén A',
      unit: nuevoProducto.unit || 'UND',
      min: nuevoProducto.min || 10,
      foto: nuevoProducto.foto || null
    });

    return productoCrud.obtenerPorCodigo(codigoLimpio);
  },
  
  actualizar: (code, datos) => {
    const db = getDb();
    const codigoLimpio = code.toUpperCase();

    const existe = db.prepare('SELECT code FROM materiales WHERE code = ?').get(codigoLimpio);
    if (!existe) {
      throw new Error(`El material con código ${codigoLimpio} no existe.`);
    }

    db.prepare(`
      UPDATE materiales 
      SET nombre = @nombre, descripcion = @descripcion, marca = @marca, modelo = @modelo, departamento = @departamento, cat = @cat, loc = @loc, unit = @unit, min = @min, foto = @foto
      WHERE code = @code
    `).run({
      code: codigoLimpio,
      nombre: datos.nombre.trim(),
      descripcion: (datos.descripcion || '').trim(),
      marca: datos.marca || 'N/A',
      modelo: datos.modelo || 'N/A',
      departamento: datos.departamento || 'AIT',
      cat: datos.cat || 'General',
      loc: datos.loc || 'Almacén A',
      unit: datos.unit || 'UND',
      min: datos.min || 10,
      foto: datos.foto || null
    });

    return productoCrud.obtenerPorCodigo(codigoLimpio);
  },

  actualizarSerialesStock: (code, nuevosSerials) => {
    const db = getDb();
    const codigoLimpio = code.toUpperCase();

    const transaccion = db.transaction(() => {
      db.prepare("DELETE FROM material_stock WHERE code = ? AND estado = 'DISPONIBLE'").run(codigoLimpio);

      const insertStock = db.prepare('INSERT INTO material_stock (code, serial, proveedor_nombre, estado_material, estado) VALUES (?, ?, ?, ?, ?)');
      const insertProv = db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)');
      
      for (const item of nuevosSerials) {
        const prov = (item.proveedor_nombre || 'No especificado').trim();
        const est = item.estado_material || 'NUEVO';
        
        if (prov !== 'No especificado') {
          insertProv.run(prov, '', '');
        }
        insertStock.run(codigoLimpio, item.serial, prov, est, 'DISPONIBLE');
      }
    });

    transaccion();
    return productoCrud.obtenerPorCodigo(codigoLimpio);
  }
};