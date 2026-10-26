import { getDb } from '../database/connection';
import { MovimientoModel } from '../models/movimiento.model';
import { productoCrud } from './producto.crud';

export const salidaCrud = {
  obtenerMovimientos: (tipoFiltro) => {
    const db = getDb();
    let query = 'SELECT * FROM movimientos';
    const params = [];

    if (tipoFiltro) {
      query += ' WHERE tipo = ?';
      params.push(tipoFiltro);
    }
    query += ' ORDER BY datetime(fecha_hora) DESC';

    const rows = db.prepare(query).all(...params);

    return rows.map(m => {
      const detalles = db.prepare(`
        SELECT id, code, qty, serial, proveedor FROM movimiento_detalles WHERE movimiento_id = ?
      `).all(m.id);

      const itemsMap = {};
      detalles.forEach(d => {
        const key = `${d.code}_${d.proveedor}`;
        if (!itemsMap[key]) {
          itemsMap[key] = { code: d.code, qty: 0, serials: [], proveedor: d.proveedor };
        }
        itemsMap[key].qty += d.qty;
        itemsMap[key].serials.push(d.serial);
      });

      return new MovimientoModel({
        ...m,
        aprobado_por: m.aprobado_por,
        items: Object.values(itemsMap)
      });
    });
  },

  procesarLoteStock: (items, tipo, datosMovimiento) => {
    const db = getDb();

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Debe agregar al menos un material a la lista.');
    }

    const transaccion = db.transaction(() => {
      // 1. Guardar silenciosamente el proveedor principal si aplica, para evitar error de Foreign Key
      if (datosMovimiento.proveedor && datosMovimiento.proveedor !== 'No especificado') {
        db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)').run(datosMovimiento.proveedor.trim(), '', '');
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const numFila = i + 1;
        const code = (item.code || '').trim().toUpperCase();
        const cant = Number(item.qty);

        if (!code) throw new Error(`Fila #${numFila}: Debe seleccionar un material.`);
        if (!cant || isNaN(cant) || cant <= 0) throw new Error(`Fila #${numFila} (${code}): La cantidad debe ser mayor a 0.`);

        const rawSerials = Array.isArray(item.serials) ? item.serials : [];
        if (rawSerials.length !== cant) {
          throw new Error(`Fila #${numFila} (${code}): La cantidad de seriales no coincide con la cantidad (${cant}).`);
        }

        const serialesEnviados = rawSerials.map((s) => String(s).trim());
        if (serialesEnviados.some((s) => s === '')) {
          throw new Error(`Fila #${numFila} (${code}): No puede dejar campos de serial en blanco.`);
        }

        const setFila = new Set(serialesEnviados.map((s) => s.toUpperCase()));
        if (setFila.size !== serialesEnviados.length) {
          throw new Error(`Fila #${numFila} (${code}): Ha escrito seriales duplicados.`);
        }

        const matExiste = db.prepare('SELECT code FROM materiales WHERE code = ?').get(code);
        if (!matExiste) throw new Error(`Fila #${numFila}: El material con código ${code} no existe.`);

        if (tipo === 'ENTRADA') {
          const proveedorFila = (item.proveedor || datosMovimiento.proveedor || 'No especificado').trim();
          const estadoMatFila = item.estadoMaterial || 'NUEVO';
          
          // Guardar silenciosamente el proveedor de esta fila si es nuevo
          if (proveedorFila !== 'No especificado') {
            db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)').run(proveedorFila, '', '');
          }

          for (const s of serialesEnviados) {
            try {
              db.prepare(`
                INSERT INTO material_stock (code, serial, proveedor_nombre, estado_material, estado) 
                VALUES (?, ?, ?, ?, ?)
              `).run(code, s, proveedorFila, estadoMatFila, 'DISPONIBLE');
            } catch (error) {
              if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error(`Fila #${numFila} (${code}): El serial "${s}" ya se encuentra registrado en el sistema. Revise los duplicados.`);
              }
              throw error;
            }
          }
        } else if (tipo === 'SALIDA') {
          for (const s of serialesEnviados) {
            const proveedorOrigen = item.proveedor_seleccionado || 'No especificado';
            const stockCheck = db.prepare('SELECT id, estado FROM material_stock WHERE code = ? AND upper(serial) = ? AND proveedor_nombre = ?').get(code, s.toUpperCase(), proveedorOrigen);
            if (!stockCheck || stockCheck.estado !== 'DISPONIBLE') {
              throw new Error(`Fila #${numFila} (${code}): El serial "${s}" del proveedor "${proveedorOrigen}" no se encuentra disponible en stock.`);
            }
            db.prepare('DELETE FROM material_stock WHERE id = ?').run(stockCheck.id);
          }
        }
      }

      const movimientoId = `MOV-${Date.now()}`;
      const fechaHora = new Date().toISOString();
      const fecha = datosMovimiento.fecha || fechaHora.split('T')[0];

      db.prepare(`
        INSERT INTO movimientos (id, tipo, fecha, fecha_hora, proveedor, factura, trabajador, aprobado_por, motivo, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        movimientoId,
        tipo,
        fecha,
        fechaHora,
        datosMovimiento.proveedor || null,
        datosMovimiento.factura || null,
        datosMovimiento.trabajador || null,
        datosMovimiento.aprobadoPor || null,
        datosMovimiento.motivo || null,
        datosMovimiento.notas || null
      );

      const insertDetalle = db.prepare(`
        INSERT INTO movimiento_detalles (movimiento_id, code, qty, serial, proveedor) VALUES (?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        for (const s of item.serials) {
          const provItem = tipo === 'ENTRADA' 
                ? (item.proveedor || datosMovimiento.proveedor || 'No especificado').trim()
                : (item.proveedor_seleccionado || 'No especificado').trim();
          
          insertDetalle.run(movimientoId, item.code.toUpperCase(), 1, s.trim(), provItem);
        }
      }
    });

    transaccion();
    return productoCrud.obtenerTodos();
  }
};