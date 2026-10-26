// src/main/database/connection.js
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

// Cambiamos a v5 para forzar la recreación de la base de datos con la nueva estructura
const getDbPath = () => path.join(app.getPath('userData'), 'pdvsa_sqlite_db_v5.db');

let dbInstance = null;

export const getDb = () => {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const dbExists = fs.existsSync(dbPath);
  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  if (!dbExists) {
    crearTablasYEvaluarDatos(dbInstance);
  } else {
    const count = dbInstance.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='materiales'").get();
    if (count['count(*)'] === 0) {
      crearTablasYEvaluarDatos(dbInstance);
    }
  }

  return dbInstance;
};

function crearTablasYEvaluarDatos(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS proveedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        rif TEXT,
        telefono TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS materiales (
        code TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        marca TEXT DEFAULT 'N/A',
        modelo TEXT DEFAULT 'N/A',
        departamento TEXT NOT NULL,
        cat TEXT DEFAULT 'General',
        loc TEXT DEFAULT 'Almacén A',
        unit TEXT DEFAULT 'UND',
        min INTEGER DEFAULT 10,
        foto TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS material_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL,
        serial TEXT NOT NULL UNIQUE,
        proveedor_nombre TEXT NOT NULL DEFAULT 'No especificado',
        estado_material TEXT DEFAULT 'NUEVO',
        estado TEXT DEFAULT 'DISPONIBLE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (code) REFERENCES materiales(code) ON DELETE CASCADE,
        FOREIGN KEY (proveedor_nombre) REFERENCES proveedores(nombre) ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS movimientos (
        id TEXT PRIMARY KEY,
        tipo TEXT NOT NULL,
        fecha TEXT NOT NULL,
        fecha_hora DATETIME NOT NULL,
        proveedor TEXT,
        factura TEXT,
        trabajador TEXT,
        aprobado_por TEXT,
        motivo TEXT,
        notas TEXT
    );

    CREATE TABLE IF NOT EXISTS movimiento_detalles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movimiento_id TEXT NOT NULL,
        code TEXT NOT NULL,
        qty INTEGER NOT NULL,
        serial TEXT NOT NULL,
        proveedor TEXT DEFAULT 'No especificado',
        FOREIGN KEY (movimiento_id) REFERENCES movimientos(id) ON DELETE CASCADE,
        FOREIGN KEY (code) REFERENCES materiales(code) ON DELETE CASCADE,
        FOREIGN KEY (proveedor) REFERENCES proveedores(nombre) ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pedidos (
        id TEXT PRIMARY KEY,
        orden_numero TEXT,
        fecha_creacion DATETIME NOT NULL,
        proveedor TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        notas TEXT,
        FOREIGN KEY (proveedor) REFERENCES proveedores(nombre) ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pedido_detalles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id TEXT NOT NULL,
        code TEXT NOT NULL,
        qty_solicitada INTEGER NOT NULL,
        qty_recibida INTEGER DEFAULT 0,
        estado_material TEXT DEFAULT 'NUEVO',
        fecha_recepcion DATETIME,
        receptor TEXT,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
    );
  `);

  poblarDatosIniciales(db);
}

function poblarDatosIniciales(db) {
  const materialesDef = [
    { code: 'AIT-1001', nombre: 'Switch Industrial', descripcion: 'Switch Administrable de 8 Puertos PoE para redes de control', marca: 'Cisco', modelo: 'IE-3000', departamento: 'AIT', cat: 'Equipos Red', loc: 'Rack Principal AIT', unit: 'UND', min: 2 },
    { code: 'AIT-1002', nombre: 'Servidor Rack 2U', descripcion: 'Servidor Dual Intel Xeon con 64GB RAM y discos SSD', marca: 'Dell', modelo: 'PowerEdge R740', departamento: 'AIT', cat: 'Servidores', loc: 'Data Center B', unit: 'UND', min: 1 },
    { code: 'MEC-2001', nombre: 'Válvula de Bola 4"', descripcion: 'Válvula de Acero Inoxidable Clase 300 para manejo de crudo', marca: 'WKM', modelo: 'Ball-4-SS', departamento: 'MECÁNICA', cat: 'Válvulas', loc: 'Patio de Válvulas', unit: 'UND', min: 10 },
    { code: 'MEC-2002', nombre: 'Empacadura Neopreno 6"', descripcion: 'Empacadura 150# RF para conexiones de bridas', marca: 'Garlock', modelo: 'Style 22', departamento: 'MECÁNICA', cat: 'Conexiones', loc: 'Almacén de Tuberías', unit: 'UND', min: 50 },
    { code: 'OPE-3001', nombre: 'Aceite Hidráulico', descripcion: 'Aceite ISO 68 anti-desgaste para maquinaria pesada', marca: 'Mobil', modelo: 'DTE 26', departamento: 'OPERACIONES', cat: 'Fluidos', loc: 'Galpón de Lubricantes', unit: 'LTR', min: 200 },
    { code: 'OPE-3002', nombre: 'Braga Ignífuga', descripcion: 'Braga de seguridad con cintas reflectivas', marca: 'Bulwark', modelo: 'Nomex IIIA', departamento: 'OPERACIONES', cat: 'EPP', loc: 'Lockers Operaciones', unit: 'UND', min: 15 }
  ];

  const proveedoresDef = [
    { nombre: 'Corporación Cisco Vzla', rif: 'J-12345678-9', telefono: '0261-5551010' },
    { nombre: 'Dell Technologies Latam', rif: 'J-98765432-1', telefono: '0261-5552020' },
    { nombre: 'Ferretería Industrial Zulia', rif: 'J-11223344-5', telefono: '0261-5553030' },
    { nombre: 'Suministros Globales AIT', rif: 'J-55667788-9', telefono: '0261-5554040' },
    { nombre: 'Baker Hughes S.A.', rif: 'J-99887766-5', telefono: '0261-5555050' },
    { nombre: 'Halliburton de Venezuela', rif: 'J-44332211-0', telefono: '0261-5556060' }
  ];

  const transaccion = db.transaction(() => {
    const insertProv = db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)');
    proveedoresDef.forEach(p => insertProv.run(p.nombre, p.rif, p.telefono));

    const insertMat = db.prepare(`
      INSERT OR REPLACE INTO materiales (code, nombre, descripcion, marca, modelo, departamento, cat, loc, unit, min, foto)
      VALUES (@code, @nombre, @descripcion, @marca, @modelo, @departamento, @cat, @loc, @unit, @min, @foto)
    `);
    materialesDef.forEach(m => insertMat.run({ ...m, foto: null }));

    const insertMov = db.prepare(`INSERT INTO movimientos (id, tipo, fecha, fecha_hora, proveedor, factura, trabajador, aprobado_por, motivo, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertDet = db.prepare(`INSERT INTO movimiento_detalles (movimiento_id, code, qty, serial, proveedor) VALUES (?, ?, ?, ?, ?)`);
    const insertStock = db.prepare(`INSERT INTO material_stock (code, serial, proveedor_nombre, estado_material, estado) VALUES (?, ?, ?, ?, ?)`);
    const deleteStock = db.prepare(`DELETE FROM material_stock WHERE code = ? AND serial = ?`);

    // Entradas
    let movId = `MOV-8001`;
    insertMov.run(movId, 'ENTRADA', '2026-10-01', '2026-10-01T08:00:00Z', 'Corporación Cisco Vzla', 'F-10045', null, null, null, 'Actualización Data Center');
    for(let i=1; i<=6; i++) {
      insertStock.run('AIT-1001', `SW-CS-00${i}`, 'Corporación Cisco Vzla', 'NUEVO', 'DISPONIBLE');
      insertDet.run(movId, 'AIT-1001', 1, `SW-CS-00${i}`, 'Corporación Cisco Vzla');
    }
    insertStock.run('AIT-1002', `SRV-DELL-01`, 'Dell Technologies Latam', 'NUEVO', 'DISPONIBLE');
    insertDet.run(movId, 'AIT-1002', 1, `SRV-DELL-01`, 'Dell Technologies Latam');
    insertStock.run('AIT-1002', `SRV-DELL-02`, 'Dell Technologies Latam', 'NUEVO', 'DISPONIBLE');
    insertDet.run(movId, 'AIT-1002', 1, `SRV-DELL-02`, 'Dell Technologies Latam');

    movId = `MOV-8002`;
    insertMov.run(movId, 'ENTRADA', '2026-10-05', '2026-10-05T10:30:00Z', 'Ferretería Industrial Zulia', 'F-5582', null, null, null, 'Stock de Patio Central');
    for(let i=1; i<=15; i++) {
      insertStock.run('MEC-2001', `VB-4-WKM-${i}`, 'Ferretería Industrial Zulia', 'NUEVO', 'DISPONIBLE');
      insertDet.run(movId, 'MEC-2001', 1, `VB-4-WKM-${i}`, 'Ferretería Industrial Zulia');
    }
    insertStock.run('MEC-2002', 'LOTE-EMP-01', 'Ferretería Industrial Zulia', 'NUEVO', 'DISPONIBLE');
    insertDet.run(movId, 'MEC-2002', 70, 'LOTE-EMP-01', 'Ferretería Industrial Zulia');

    movId = `MOV-8003`;
    insertMov.run(movId, 'ENTRADA', '2026-10-10', '2026-10-10T14:15:00Z', 'Suministros Globales AIT', 'F-8899', null, null, null, 'Insumos de Operaciones Mensuales');
    insertStock.run('OPE-3001', 'LOTE-ACEITE-01', 'Suministros Globales AIT', 'NUEVO', 'DISPONIBLE');
    insertDet.run(movId, 'OPE-3001', 350, 'LOTE-ACEITE-01', 'Suministros Globales AIT');
    for(let i=1; i<=30; i++) {
      insertStock.run('OPE-3002', `BRG-NMX-${i}`, 'Suministros Globales AIT', 'NUEVO', 'DISPONIBLE');
      insertDet.run(movId, 'OPE-3002', 1, `BRG-NMX-${i}`, 'Suministros Globales AIT');
    }

    // Salidas
    movId = `MOV-9001`;
    insertMov.run(movId, 'SALIDA', '2026-10-12', '2026-10-12T09:00:00Z', null, null, 'Ing. Roberto Silva (Data Center B)', 'Gerencia AIT', 'Migración de Servidores', null);
    insertDet.run(movId, 'AIT-1002', 1, 'SRV-DELL-01', 'Dell Technologies Latam');
    deleteStock.run('AIT-1002', 'SRV-DELL-01');
    for(let i=1; i<=2; i++) {
      insertDet.run(movId, 'AIT-1001', 1, `SW-CS-00${i}`, 'Corporación Cisco Vzla');
      deleteStock.run('AIT-1001', `SW-CS-00${i}`);
    }

    movId = `MOV-9002`;
    insertMov.run(movId, 'SALIDA', '2026-10-18', '2026-10-18T16:45:00Z', null, null, 'Sup. Héctor Gómez (Planta de Gas)', 'Jefe de Operaciones', 'Reemplazo preventivo en línea 4', null);
    for(let i=1; i<=4; i++) {
      insertDet.run(movId, 'MEC-2001', 1, `VB-4-WKM-${i}`, 'Ferretería Industrial Zulia');
      deleteStock.run('MEC-2001', `VB-4-WKM-${i}`);
    }
    for(let i=1; i<=8; i++) {
      insertDet.run(movId, 'OPE-3002', 1, `BRG-NMX-${i}`, 'Suministros Globales AIT');
      deleteStock.run('OPE-3002', `BRG-NMX-${i}`);
    }

    // Pedidos
    const insertPedido = db.prepare(`INSERT INTO pedidos (id, orden_numero, fecha_creacion, proveedor, estado, notas) VALUES (?, ?, ?, ?, ?, ?)`);
    const insertPedidoDet = db.prepare(`INSERT INTO pedido_detalles (pedido_id, code, qty_solicitada, qty_recibida, estado_material, fecha_recepcion, receptor) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    insertPedido.run('ORD-8001', 'OC-505011', '2026-09-15T10:00:00Z', 'Baker Hughes S.A.', 'COMPLETADO', 'Recepción total en Patio.');
    insertPedidoDet.run('ORD-8001', 'MEC-2001', 10, 10, 'NUEVO', '2026-09-16T11:00:00Z', 'Almacenista José Perez');

    insertPedido.run('ORD-8002', 'OC-505022', '2026-10-20T08:00:00Z', 'Halliburton de Venezuela', 'ACTIVO', 'Entrega programada por partes.');
    insertPedidoDet.run('ORD-8002', 'OPE-3001', 500, 200, 'NUEVO', '2026-10-22T09:30:00Z', 'Almacenista María López');
    insertPedidoDet.run('ORD-8002', 'MEC-2002', 100, 0, 'NUEVO', null, null);
  });

  transaccion();
}