// src/main/crud/pedidos.crud.js
import { getDb } from '../database/connection';

export const pedidosCrud = {
  obtenerTodos: () => {
    const db = getDb();
    const pedidos = db.prepare('SELECT * FROM pedidos ORDER BY datetime(fecha_creacion) DESC').all();
    
    return pedidos.map(pedido => {
      const detalles = db.prepare(`
        SELECT pd.*, m.nombre as material_nombre, m.descripcion as material_descripcion, m.marca as material_marca, m.modelo as material_modelo, m.unit
        FROM pedido_detalles pd
        JOIN materiales m ON m.code = pd.code
        WHERE pd.pedido_id = ?
        ORDER BY pd.id ASC
      `).all(pedido.id);
      
      return { ...pedido, detalles };
    });
  },

  crearPedidoAutomático: (datos) => {
    const db = getDb();
    const pedidoId = `ORD-${Date.now()}`;
    const fechaActual = datos.fecha || new Date().toISOString().split('T')[0];
    const nroOrden = datos.ordenNumero || `SIN-ORDEN-${Date.now().toString().slice(-6)}`;
    const factura = datos.factura || 'N/A';
    
    const proveedorPrincipal = (datos.items[0]?.proveedor || 'Varios').trim();
    const receptorPrincipal = (datos.receptor || 'No especificado').trim();

    const transaccion = db.transaction(() => {
      if (proveedorPrincipal !== 'Varios' && proveedorPrincipal !== '') {
        db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)').run(proveedorPrincipal, '', '');
      }

      db.prepare(`
        INSERT INTO pedidos (id, orden_numero, fecha_creacion, proveedor, estado, notas)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(pedidoId, nroOrden, new Date().toISOString(), proveedorPrincipal, 'ACTIVO', datos.notas || 'Generado automáticamente.');

      const insertDetalle = db.prepare(`
        INSERT INTO pedido_detalles (pedido_id, code, qty_solicitada, qty_recibida, estado_material, fecha_recepcion, receptor)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      let todoCompleto = true;
      let hayRecepcion = false;

      for (const item of datos.items) {
        const solicitada = Number(item.qty_solicitada) || 0;
        const recibida = Number(item.qty_recibida) || 0;
        const estadoMat = item.estadoMaterial || 'NUEVO';

        if (recibida > 0) hayRecepcion = true;

        if (solicitada > 0) {
          const fRec = recibida > 0 ? (datos.fecha || new Date().toISOString()) : null;
          const rec = recibida > 0 ? receptorPrincipal : null;
          
          insertDetalle.run(pedidoId, item.code.toUpperCase(), solicitada, recibida, estadoMat, fRec, rec);
          if (recibida < solicitada) {
            todoCompleto = false;
          }
        }
      }

      if (todoCompleto) {
        db.prepare("UPDATE pedidos SET estado = 'COMPLETADO' WHERE id = ?").run(pedidoId);
      }

      if (hayRecepcion) {
        const movId = `MOV-${Date.now()}`;
        db.prepare(`
          INSERT INTO movimientos (id, tipo, fecha, fecha_hora, proveedor, factura, trabajador, motivo, notas)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(movId, 'ENTRADA', fechaActual, new Date().toISOString(), proveedorPrincipal, factura, receptorPrincipal, `Recepción de Orden: ${pedidoId}`, datos.notas || null);

        const insertStock = db.prepare('INSERT INTO material_stock (code, serial, proveedor_nombre, estado_material, estado) VALUES (?, ?, ?, ?, ?)');
        const insertDetMov = db.prepare('INSERT INTO movimiento_detalles (movimiento_id, code, qty, serial, proveedor) VALUES (?, ?, ?, ?, ?)');

        for (const item of datos.items) {
          const recibida = Number(item.qty_recibida) || 0;
          if (recibida > 0) {
            const provItem = (item.proveedor || proveedorPrincipal).trim();
            if (provItem !== 'Varios' && provItem !== '') {
              db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)').run(provItem, '', '');
            }
            
            for (let i = 0; i < recibida; i++) {
              const serial = (item.serials[i] || '').trim();
              if (serial) {
                try {
                  insertStock.run(item.code.toUpperCase(), serial, provItem, item.estadoMaterial || 'NUEVO', 'DISPONIBLE');
                  insertDetMov.run(movId, item.code.toUpperCase(), 1, serial, provItem);
                } catch (error) {
                  if (error.message.includes('UNIQUE constraint failed')) {
                    throw new Error(`El serial "${serial}" ya existe en el sistema. Los seriales deben ser únicos globales.`);
                  }
                  throw error;
                }
              }
            }
          }
        }
      }
    });

    transaccion();
    return pedidoId;
  },

  actualizarRecepcionParcial: (pedidoId, code, cantidadNuevaRecibida, nuevosSeriales, receptor, fechaRecepcion) => {
    const db = getDb();
    const rec = (receptor || 'No especificado').trim();
    const fechaRec = fechaRecepcion || new Date().toISOString();

    const transaccion = db.transaction(() => {
      const detallesPrevios = db.prepare('SELECT * FROM pedido_detalles WHERE pedido_id = ? AND code = ?').all(pedidoId, code);
      const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
      
      if (detallesPrevios.length === 0) throw new Error('Detalle de pedido no encontrado.');

      const qty_solicitada = detallesPrevios[0].qty_solicitada;
      const total_recibido_hasta_ahora = detallesPrevios.reduce((sum, d) => sum + d.qty_recibida, 0);
      
      const faltante = qty_solicitada - total_recibido_hasta_ahora;
      
      if (cantidadNuevaRecibida > faltante) {
        throw new Error('No puede recibir más de lo que falta en el pedido.');
      }

      if (pedido.proveedor) {
        db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)').run(pedido.proveedor, '', '');
      }

      const insertStock = db.prepare('INSERT INTO material_stock (code, serial, proveedor_nombre, estado_material, estado) VALUES (?, ?, ?, ?, ?)');
      const insertDetMov = db.prepare('INSERT INTO movimiento_detalles (movimiento_id, code, qty, serial, proveedor) VALUES (?, ?, ?, ?, ?)');
      
      const movId = `MOV-${Date.now()}`;
      db.prepare(`
        INSERT INTO movimientos (id, tipo, fecha, fecha_hora, proveedor, factura, trabajador, motivo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(movId, 'ENTRADA', fechaRec.split('T')[0], new Date().toISOString(), pedido.proveedor, 'RECEPCIÓN PARCIAL', rec, `Orden: ${pedido.orden_numero}`);

      for (const serial of nuevosSeriales) {
        try {
          insertStock.run(code, serial, pedido.proveedor, detallesPrevios[0].estado_material, 'DISPONIBLE');
          insertDetMov.run(movId, code, 1, serial, pedido.proveedor);
        } catch (error) {
          if (error.message.includes('UNIQUE constraint failed')) {
            throw new Error(`El serial "${serial}" ya existe en el sistema. Revise duplicados.`);
          }
          throw error;
        }
      }

      db.prepare(`
        INSERT INTO pedido_detalles (pedido_id, code, qty_solicitada, qty_recibida, estado_material, fecha_recepcion, receptor)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(pedidoId, code, qty_solicitada, cantidadNuevaRecibida, detallesPrevios[0].estado_material, fechaRec, rec);
      
      const todosLosDetalles = db.prepare('SELECT code, qty_solicitada, qty_recibida FROM pedido_detalles WHERE pedido_id = ?').all(pedidoId);
      const totalesPorCode = {};
      todosLosDetalles.forEach(d => {
        if (!totalesPorCode[d.code]) totalesPorCode[d.code] = { solic: d.qty_solicitada, recib: 0 };
        totalesPorCode[d.code].recib += d.qty_recibida;
      });
      
      const estaCompleto = Object.values(totalesPorCode).every(t => t.recib >= t.solic);

      if (estaCompleto) {
        db.prepare("UPDATE pedidos SET estado = 'COMPLETADO' WHERE id = ?").run(pedidoId);
      }
    });

    transaccion();
    return pedidosCrud.obtenerTodos();
  }
};