// src/main/crud/dashboard.crud.js
import { getDb } from '../database/connection';

export const dashboardCrud = {
  obtenerResumen: (desde, hasta) => {
    const db = getDb();

    return db.transaction(() => {
      const totalMaterials = db
        .prepare('SELECT COUNT(*) AS total FROM materiales')
        .get().total;

      const monthlyMovementTotals = db
        .prepare(`
          SELECT
            COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN d.qty ELSE 0 END), 0) AS entradas,
            COALESCE(SUM(CASE WHEN m.tipo = 'SALIDA' THEN d.qty ELSE 0 END), 0) AS salidas
          FROM movimientos m
          LEFT JOIN movimiento_detalles d ON d.movimiento_id = m.id
          WHERE m.fecha >= ? AND m.fecha < ?
        `)
        .get(desde, hasta);

      const inventoryStatus = db.prepare(`
        SELECT
          CASE
            WHEN COALESCE(stock.cantidad, 0) = 0 THEN 'Sin stock'
            WHEN stock.cantidad <= COALESCE(mat.min, 0) THEN 'Crítico'
            ELSE 'Stock OK'
          END AS name,
          COUNT(*) AS value
        FROM materiales mat
        LEFT JOIN (
          SELECT code, COUNT(*) AS cantidad
          FROM material_stock
          WHERE estado = 'DISPONIBLE'
          GROUP BY code
        ) stock ON stock.code = mat.code
        GROUP BY name
      `).all();

      const lowStockMaterials = db.prepare(`
        SELECT
          mat.code,
          mat.nombre as desc,
          COALESCE(stock.cantidad, 0) AS stock,
          COALESCE(mat.min, 0) AS min
        FROM materiales mat
        LEFT JOIN (
          SELECT code, COUNT(*) AS cantidad
          FROM material_stock
          WHERE estado = 'DISPONIBLE'
          GROUP BY code
        ) stock ON stock.code = mat.code
        WHERE COALESCE(stock.cantidad, 0) <= COALESCE(mat.min, 0)
        ORDER BY stock ASC, mat.code COLLATE NOCASE
      `).all();

      const topExits = db.prepare(`
        SELECT
          mat.code,
          mat.nombre as desc,
          SUM(det.qty) AS quantity
        FROM movimiento_detalles det
        JOIN movimientos mov ON mov.id = det.movimiento_id
        JOIN materiales mat ON mat.code = det.code
        WHERE mov.tipo = 'SALIDA'
          AND mov.fecha >= ?
          AND mov.fecha < ?
        GROUP BY mat.code, mat.nombre
        ORDER BY quantity DESC, mat.code COLLATE NOCASE
        LIMIT 5
      `).all(desde, hasta);

      const recentMovements = db.prepare(`
        SELECT
          mov.id,
          mov.tipo AS type,
          mov.fecha AS date,
          mov.fecha_hora AS dateTime,
          COALESCE(mov.trabajador, mov.proveedor, 'No especificado') AS responsible,
          COALESCE(mov.factura, mov.motivo, '') AS reference,
          COALESCE(SUM(det.qty), 0) AS quantity,
          COALESCE(
            GROUP_CONCAT(mat.code || ' - ' || mat.nombre, ', '),
            'Sin detalle'
          ) AS materials
        FROM movimientos mov
        LEFT JOIN movimiento_detalles det ON det.movimiento_id = mov.id
        LEFT JOIN materiales mat ON mat.code = det.code
        GROUP BY mov.id
        ORDER BY datetime(mov.fecha_hora) DESC
        LIMIT 5
      `).all();

      return {
        totalMaterials,
        entriesThisMonth: monthlyMovementTotals.entradas,
        exitsThisMonth: monthlyMovementTotals.salidas,
        inventoryStatus,
        lowStockMaterials,
        topExits,
        recentMovements
      };
    }).deferred();
  }
};