import Database from 'better-sqlite3'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

let database

export function initializeDatabase(app) {
  const bundledDatabasePath = join(app.getAppPath(), 'data', 'inventarioAime.db')
  const userDatabasePath = join(app.getPath('userData'), 'inventarioAime.db')
  const databasePath = app.isPackaged ? userDatabasePath : bundledDatabasePath

  if (app.isPackaged && !existsSync(databasePath)) {
    if (!existsSync(bundledDatabasePath)) {
      throw new Error(`No se encontró la base SQLite inicial: ${bundledDatabasePath}`)
    }

    mkdirSync(dirname(databasePath), { recursive: true })
    copyFileSync(bundledDatabasePath, databasePath)
  }

  if (!existsSync(databasePath)) {
    throw new Error(`No se encontró la base SQLite: ${databasePath}`)
  }

  database = new Database(databasePath)
  database.pragma('foreign_keys = ON')
}

export function listInventory() {
  if (!database) {
    throw new Error('La base de datos no ha sido inicializada')
  }

  return database
    .prepare(
      `SELECT
        m.id,
        m.codigo AS code,
        m.nombre AS desc,
        COALESCE(c.nombre, 'Sin categoría') AS cat,
        COALESCE(GROUP_CONCAT(DISTINCT u.nombre), 'Sin ubicación') AS loc,
        m.unidad_medida AS unit,
        COALESCE(SUM(s.cantidad), 0) AS stock,
        m.stock_minimo AS min,
        CASE
          WHEN COALESCE(SUM(s.cantidad), 0) <= m.stock_minimo THEN 'Crítico'
          ELSE 'Stock OK'
        END AS status
      FROM materiales m
      LEFT JOIN categorias c ON c.id = m.categoria_id
      LEFT JOIN stock s ON s.material_id = m.id
      LEFT JOIN ubicaciones u ON u.id = s.ubicacion_id
      WHERE m.activo = 1
      GROUP BY m.id
      ORDER BY m.codigo COLLATE NOCASE`
    )
    .all()
}

export function createMaterial(material) {
  if (!database) {
    throw new Error('La base de datos no ha sido inicializada')
  }

  const code = material.code?.trim()
  const name = material.name?.trim()
  const unit = material.unit?.trim()
  const categoryName = material.category?.trim()
  const locationName = material.location?.trim()
  const minimumStock = Number(material.minimumStock)
  const initialStock = Number(material.initialStock)

  if (!code || !name || !unit) {
    throw new Error('El código, el nombre y la unidad de medida son obligatorios')
  }
  if (!Number.isFinite(minimumStock) || minimumStock < 0) {
    throw new Error('El stock mínimo debe ser un número igual o mayor que cero')
  }
  if (!Number.isFinite(initialStock) || initialStock < 0) {
    throw new Error('El stock inicial debe ser un número igual o mayor que cero')
  }

  return database.transaction(() => {
    let categoryId = null
    if (categoryName) {
      database.prepare('INSERT OR IGNORE INTO categorias (nombre) VALUES (?)').run(categoryName)
      categoryId = database
        .prepare('SELECT id FROM categorias WHERE nombre = ? COLLATE NOCASE')
        .get(categoryName).id
    }

    const result = database
      .prepare(
        `INSERT INTO materiales (codigo, nombre, descripcion, categoria_id, unidad_medida, stock_minimo)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(code, name, material.description?.trim() || null, categoryId, unit, minimumStock)

    if (locationName) {
      database.prepare('INSERT OR IGNORE INTO ubicaciones (nombre) VALUES (?)').run(locationName)
      const locationId = database
        .prepare('SELECT id FROM ubicaciones WHERE nombre = ? COLLATE NOCASE ORDER BY id LIMIT 1')
        .get(locationName).id

      database
        .prepare('INSERT INTO stock (material_id, ubicacion_id, cantidad) VALUES (?, ?, ?)')
        .run(result.lastInsertRowid, locationId, initialStock)

      if (initialStock > 0) {
        const movement = database
          .prepare(
            `INSERT INTO movimientos (tipo, fecha, notas)
             VALUES ('entrada', CURRENT_TIMESTAMP, 'Stock inicial del material')`
          )
          .run()

        database
          .prepare(
            `INSERT INTO detalle_movimientos
              (movimiento_id, material_id, cantidad, ubicacion_destino_id)
             VALUES (?, ?, ?, ?)`
          )
          .run(movement.lastInsertRowid, result.lastInsertRowid, initialStock, locationId)
      }
    } else if (initialStock > 0) {
      throw new Error('Indica una ubicación para asignar el stock inicial')
    }

    return { id: result.lastInsertRowid }
  })()
}

export function closeDatabase() {
  database?.close()
  database = undefined
}
