import { getDb } from '../database/connection';
import { ProductoModel } from '../models/producto.model';

export const productoCrud = {
  obtenerTodos: () => {
    const db = getDb();
    const materiales = db.prepare('SELECT * FROM materiales').all();
    
    return materiales.map(mat => {
      const serialRows = db.prepare('SELECT serial FROM material_stock WHERE code = ? AND estado = ?').all(mat.code, 'DISPONIBLE');
      const serials = serialRows.map(s => s.serial);
      const stock = serials.length;
      const status = ProductoModel.calcularEstado(stock, mat.min);
      
      return new ProductoModel({ ...mat, stock, status, serials });
    });
  },

  obtenerPorCodigo: (code) => {
    const db = getDb();
    const mat = db.prepare('SELECT * FROM materiales WHERE code = ?').get(code.toUpperCase());
    if (!mat) return null;

    const serialRows = db.prepare('SELECT serial FROM material_stock WHERE code = ? AND estado = ?').all(mat.code, 'DISPONIBLE');
    const serials = serialRows.map(s => s.serial);
    const stock = serials.length;
    const status = ProductoModel.calcularEstado(stock, mat.min);

    return new ProductoModel({ ...mat, stock, status, serials });
  },

  crear: (nuevoProducto) => {
    const db = getDb();
    const codigoLimpio = (nuevoProducto.code || '').trim().toUpperCase();

    if (!codigoLimpio || !(nuevoProducto.desc || '').trim()) {
      throw new Error('El código y la descripción del material son obligatorios.');
    }

    const existe = db.prepare('SELECT code FROM materiales WHERE code = ?').get(codigoLimpio);
    if (existe) {
      throw new Error(`El código de material ${codigoLimpio} ya existe en el inventario.`);
    }

    const stockInicial = Number(nuevoProducto.stock) || 0;
    const rawSerials = Array.isArray(nuevoProducto.serials) ? nuevoProducto.serials : [];
    const serialesLimpios = rawSerials.map((s) => String(s).trim()).filter((s) => s !== '');

    if (stockInicial > 0 && serialesLimpios.length !== stockInicial) {
      throw new Error(`No puede dejar seriales en blanco. Debe ingresar los ${stockInicial} serial(es) iniciales.`);
    }

    const setUnicos = new Set(serialesLimpios.map((s) => s.toUpperCase()));
    if (setUnicos.size !== serialesLimpios.length) {
      throw new Error('Ha ingresado seriales repetidos en el mismo material.');
    }

    const trans = db.transaction(() => {
      db.prepare(`
        INSERT INTO materiales (code, desc, marca, modelo, departamento, cat, loc, unit, min, foto)
        VALUES (@code, @desc, @marca, @modelo, @departamento, @cat, @loc, @unit, @min, @foto)
      `).run({
        code: codigoLimpio,
        desc: nuevoProducto.desc.trim(),
        marca: nuevoProducto.marca || 'N/A',
        modelo: nuevoProducto.modelo || 'N/A',
        departamento: nuevoProducto.departamento || 'AIT',
        cat: nuevoProducto.cat || 'General',
        loc: nuevoProducto.loc || 'Almacén A',
        unit: nuevoProducto.unit || 'UND',
        min: nuevoProducto.min || 10,
        foto: nuevoProducto.foto || null
      });

      const insertStock = db.prepare('INSERT INTO material_stock (code, serial, estado) VALUES (?, ?, ?)');
      for (const s of serialesLimpios) {
        insertStock.run(codigoLimpio, s, 'DISPONIBLE');
      }
    });

    trans();
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
      SET desc = @desc, marca = @marca, modelo = @modelo, departamento = @departamento, cat = @cat, loc = @loc, unit = @unit, min = @min, foto = @foto
      WHERE code = @code
    `).run({
      code: codigoLimpio,
      desc: datos.desc.trim(),
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
      // Borramos los seriales anteriores disponibles de este código
      db.prepare("DELETE FROM material_stock WHERE code = ? AND estado = 'DISPONIBLE'").run(codigoLimpio);

      // Insertamos los nuevos seriales actualizados
      const insert = db.prepare('INSERT INTO material_stock (code, serial, estado) VALUES (?, ?, ?)');
      for (const s of nuevosSerials) {
        insert.run(codigoLimpio, s, 'DISPONIBLE');
      }
    });

    transaccion();
    return productoCrud.obtenerPorCodigo(codigoLimpio);
  }
};