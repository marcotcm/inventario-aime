import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const getDbPath = () => path.join(app.getPath('userData'), 'pdvsa_sqlite_db_v2.db');

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
    const count = dbInstance.prepare('SELECT COUNT(*) as total FROM materiales').get();
    if (count.total === 0) {
      poblarDatosIniciales(dbInstance);
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
        desc TEXT NOT NULL,
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
        estado TEXT DEFAULT 'DISPONIBLE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (code) REFERENCES materiales(code) ON DELETE CASCADE
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
        FOREIGN KEY (movimiento_id) REFERENCES movimientos(id) ON DELETE CASCADE,
        FOREIGN KEY (code) REFERENCES materiales(code) ON DELETE CASCADE
    );
  `);

  poblarDatosIniciales(db);
}

function poblarDatosIniciales(db) {
  const materialesDef = [
    { code: 'AIT-0001', desc: 'Tarjeta NOE 771', marca: 'Schneider Electric', modelo: 'NOE77101', departamento: 'AIT', cat: 'Tarjetas', loc: 'Almacén A', unit: 'UND', min: 2 },
    { code: 'AIT-0002', desc: 'Fuente de Poder 24VDC 10A', marca: 'Phoenix Contact', modelo: 'QUINT-PS', departamento: 'AIT', cat: 'Fuentes', loc: 'Almacén A', unit: 'UND', min: 5 },
    { code: 'AIT-0003', desc: 'Procesador PLC M340', marca: 'Schneider Electric', modelo: 'BMXP342020', departamento: 'AIT', cat: 'Controladores', loc: 'Almacén A', unit: 'UND', min: 1 },
    { code: 'AIT-0004', desc: 'Módulo Entradas Digitales 32CH', marca: 'Schneider Electric', modelo: 'BMXDDI3202K', departamento: 'AIT', cat: 'Tarjetas', loc: 'Almacén A', unit: 'UND', min: 4 },
    { code: 'AIT-0005', desc: 'Módulo Salidas Digitales 32CH', marca: 'Schneider Electric', modelo: 'BMXDDO3202K', departamento: 'AIT', cat: 'Tarjetas', loc: 'Almacén A', unit: 'UND', min: 4 },
    { code: 'AIT-0006', desc: 'Módulo Entradas Analógicas 8CH', marca: 'Schneider Electric', modelo: 'BMXAMI0810', departamento: 'AIT', cat: 'Tarjetas', loc: 'Almacén A', unit: 'UND', min: 2 },
    { code: 'AIT-0007', desc: 'Módulo Salidas Analógicas 4CH', marca: 'Schneider Electric', modelo: 'BMXAMO0410', departamento: 'AIT', cat: 'Tarjetas', loc: 'Almacén A', unit: 'UND', min: 2 },
    { code: 'AIT-0008', desc: 'Rack PLC 8 Slots', marca: 'Schneider Electric', modelo: 'BMXXBP0800', departamento: 'AIT', cat: 'Accesorios', loc: 'Almacén A', unit: 'UND', min: 1 },
    { code: 'AIT-0009', desc: 'Cable Comunicación USB PLC', marca: 'Schneider Electric', modelo: 'BMXXCAUSBH018', departamento: 'AIT', cat: 'Cables', loc: 'Almacén A', unit: 'UND', min: 5 },
    { code: 'AIT-0010', desc: 'Relé Interfaz 24VDC', marca: 'Finder', modelo: '39.11', departamento: 'AIT', cat: 'Eléctrico', loc: 'Almacén A', unit: 'UND', min: 20 },

    { code: 'SCA-0001', desc: 'Servidor Rack 1U', marca: 'Dell', modelo: 'PowerEdge R440', departamento: 'SCADA', cat: 'Servidores', loc: 'Almacén B', unit: 'UND', min: 1 },
    { code: 'SCA-0002', desc: 'Workstation Operador', marca: 'HP', modelo: 'Z4 G4', departamento: 'SCADA', cat: 'Equipos de Cómputo', loc: 'Almacén B', unit: 'UND', min: 2 },
    { code: 'SCA-0003', desc: 'Monitor Industrial 24"', marca: 'Advantech', modelo: 'FPM-7241W', departamento: 'SCADA', cat: 'Pantallas', loc: 'Almacén B', unit: 'UND', min: 2 },
    { code: 'SCA-0004', desc: 'Licencia SCADA', marca: 'Inductive Automation', modelo: 'Ignition Pro', departamento: 'SCADA', cat: 'Software', loc: 'Virtual', unit: 'UND', min: 1 },
    { code: 'SCA-0005', desc: 'Switch Industrial 8 Puertos', marca: 'Moxa', modelo: 'EDS-208', departamento: 'SCADA', cat: 'Comunicaciones', loc: 'Almacén B', unit: 'UND', min: 5 },
    { code: 'SCA-0006', desc: 'Cable UTP Cat 6', marca: 'Belden', modelo: '2412', departamento: 'SCADA', cat: 'Cables', loc: 'Almacén B', unit: 'MTR', min: 100 },
    { code: 'SCA-0007', desc: 'UPS 3kVA Rackmount', marca: 'APC', modelo: 'SMT3000RM2UC', departamento: 'SCADA', cat: 'Energía', loc: 'Almacén B', unit: 'UND', min: 1 },
    { code: 'SCA-0008', desc: 'KVM Switch 8 Puertos', marca: 'Tripp Lite', modelo: 'B022-U08', departamento: 'SCADA', cat: 'Accesorios', loc: 'Almacén B', unit: 'UND', min: 1 },
    { code: 'SCA-0009', desc: 'Disco Duro Servidor 2TB SAS', marca: 'Seagate', modelo: 'Exos 15E900', departamento: 'SCADA', cat: 'Almacenamiento', loc: 'Almacén B', unit: 'UND', min: 3 },
    { code: 'SCA-0010', desc: 'Transceptor SFP 1000BASE-SX', marca: 'Cisco', modelo: 'GLC-SX-MMD', departamento: 'SCADA', cat: 'Comunicaciones', loc: 'Almacén B', unit: 'UND', min: 10 },

    { code: 'TEL-0001', desc: 'Router Capa 3', marca: 'Cisco', modelo: 'ISR 4331', departamento: 'TELECOM', cat: 'Equipos Red', loc: 'Almacén C', unit: 'UND', min: 1 },
    { code: 'TEL-0002', desc: 'Switch 24 Puertos PoE', marca: 'Cisco', modelo: 'Catalyst 9200L', departamento: 'TELECOM', cat: 'Equipos Red', loc: 'Almacén C', unit: 'UND', min: 2 },
    { code: 'TEL-0003', desc: 'Radio Enlace Microondas 5GHz', marca: 'Ubiquiti', modelo: 'airFiber 5XHD', departamento: 'TELECOM', cat: 'Radios', loc: 'Almacén C', unit: 'UND', min: 2 },
    { code: 'TEL-0004', desc: 'Antena Parabólica 5GHz 30dBi', marca: 'Ubiquiti', modelo: 'AF-5G30-S45', departamento: 'TELECOM', cat: 'Antenas', loc: 'Almacén C', unit: 'UND', min: 2 },
    { code: 'TEL-0005', desc: 'Cable Coaxial LMR-400', marca: 'Times Microwave', modelo: 'LMR-400', departamento: 'TELECOM', cat: 'Cables', loc: 'Almacén C', unit: 'MTR', min: 50 },
    { code: 'TEL-0006', desc: 'Conector N Macho', marca: 'Amphenol', modelo: '172102', departamento: 'TELECOM', cat: 'Conexiones', loc: 'Almacén C', unit: 'UND', min: 20 },
    { code: 'TEL-0007', desc: 'Teléfono IP', marca: 'Cisco', modelo: 'CP-7841', departamento: 'TELECOM', cat: 'Equipos Red', loc: 'Almacén C', unit: 'UND', min: 5 },
    { code: 'TEL-0008', desc: 'Patch Panel 24 Puertos Cat 6', marca: 'Panduit', modelo: 'CP24BLY', departamento: 'TELECOM', cat: 'Accesorios', loc: 'Almacén C', unit: 'UND', min: 2 },
    { code: 'TEL-0009', desc: 'Patch Cord Cat 6 1m', marca: 'Panduit', modelo: 'UTPSP1M', departamento: 'TELECOM', cat: 'Cables', loc: 'Almacén C', unit: 'UND', min: 30 },
    { code: 'TEL-0010', desc: 'Mástil Telescópico 6m', marca: 'Genérico', modelo: 'MT-6M', departamento: 'TELECOM', cat: 'Estructuras', loc: 'Almacén C', unit: 'UND', min: 2 },
  ];

  const proveedores = ['TechSupply CA', 'Inversiones SCADA C.A.', 'Telecomunicaciones de Venezuela', 'Distribuidora AIT', 'Global Networks'];
  const trabajadores = ['Ing. Marco Morales (AIT)', 'Ing. Luis Perez (SCADA)', 'Tec. Juan Gomez (TELECOM)', 'Sup. Maria Fernandez (AIT)', 'Ing. Ana Lopez (TELECOM)'];
  const aprobadores = ['Gerencia AIT', 'Gerencia SCADA', 'Gerencia TELECOM', 'Supervisor de Turno'];

  const insertProv = db.prepare('INSERT OR IGNORE INTO proveedores (nombre, rif, telefono) VALUES (?, ?, ?)');
  proveedores.forEach(p => insertProv.run(p, 'J-00000000-0', '0261-0000000'));

  const insertMat = db.prepare(`
    INSERT OR REPLACE INTO materiales (code, desc, marca, modelo, departamento, cat, loc, unit, min, foto)
    VALUES (@code, @desc, @marca, @modelo, @departamento, @cat, @loc, @unit, @min, @foto)
  `);

  const poblarTransaccion = db.transaction(() => {
    for (const m of materialesDef) {
      insertMat.run({ ...m, foto: null });
    }

    let inventarioFinal = {}; 
    materialesDef.forEach(m => { inventarioFinal[m.code] = { stock: 0, serials: [] }; });
    const generarSerial = (prefix, index) => `${prefix}-${String(index).padStart(4, '0')}`;
    
    let currentDate = new Date('2026-09-01T08:00:00Z');
    const END_DATE = new Date('2026-10-14T23:59:59Z');
    let movIdCounter = 1000;
    let serialCounter = 1;

    const insertMov = db.prepare(`
      INSERT INTO movimientos (id, tipo, fecha, fecha_hora, proveedor, factura, trabajador, aprobado_por, motivo, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertDet = db.prepare(`
      INSERT INTO movimiento_detalles (movimiento_id, code, qty, serial) VALUES (?, ?, ?, ?)
    `);
    const insertStock = db.prepare(`
      INSERT OR IGNORE INTO material_stock (code, serial, estado) VALUES (?, ?, ?)
    `);
    const deleteStock = db.prepare(`
      DELETE FROM material_stock WHERE code = ? AND serial = ?
    `);

    // Entradas Masivas Iniciales
    for (let i = 0; i < 30; i++) {
      const matIndex = Math.floor(Math.random() * materialesDef.length);
      const material = materialesDef[matIndex];
      const qty = material.unit === 'MTR' ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 10) + 2; 
      
      const serials = [];
      if (material.unit === 'UND') {
          for(let j=0; j<qty; j++) serials.push(generarSerial(material.code, serialCounter++));
      } else {
          serials.push(`LOTE-${material.code}-${serialCounter++}`);
      }

      const movId = `MOV-${movIdCounter++}`;
      const fechaStr = currentDate.toISOString().split('T')[0];
      const fechaHoraStr = currentDate.toISOString();

      insertMov.run(movId, 'ENTRADA', fechaStr, fechaHoraStr, proveedores[Math.floor(Math.random() * proveedores.length)], `FAC-${Math.floor(Math.random() * 9000) + 1000}`, null, null, null, 'Ingreso inicial / Reposición');

      for(const s of serials) {
        insertStock.run(material.code, s, 'DISPONIBLE');
        insertDet.run(movId, material.code, 1, s);
      }

      inventarioFinal[material.code].stock += qty;
      inventarioFinal[material.code].serials.push(...serials);
      currentDate = new Date(currentDate.getTime() + (8 * 60 * 60 * 1000)); 
    }

    // Movimientos Intercalados
    for (let i = 0; i < 40; i++) {
      const esEntrada = Math.random() > 0.6;
      const matIndex = Math.floor(Math.random() * materialesDef.length);
      const material = materialesDef[matIndex];
      const movId = `MOV-${movIdCounter++}`;
      const fechaStr = currentDate.toISOString().split('T')[0];
      const fechaHoraStr = currentDate.toISOString();

      if (esEntrada) {
          const qty = material.unit === 'MTR' ? 50 : Math.floor(Math.random() * 5) + 1; 
          const serials = [];
          if (material.unit === 'UND') {
              for(let j=0; j<qty; j++) serials.push(generarSerial(material.code, serialCounter++));
          } else {
              serials.push(`LOTE-${material.code}-${serialCounter++}`);
          }

          insertMov.run(movId, 'ENTRADA', fechaStr, fechaHoraStr, proveedores[Math.floor(Math.random() * proveedores.length)], `FAC-${Math.floor(Math.random() * 9000) + 1000}`, null, null, null, 'Compras menores');

          for(const s of serials) {
            insertStock.run(material.code, s, 'DISPONIBLE');
            insertDet.run(movId, material.code, 1, s);
          }
          inventarioFinal[material.code].stock += qty;
          inventarioFinal[material.code].serials.push(...serials);

      } else { 
          const stockActual = inventarioFinal[material.code].stock;
          if (stockActual > 0) {
              const maxSacar = material.unit === 'MTR' ? Math.min(stockActual, 20) : Math.min(stockActual, 3);
              const qty = Math.floor(Math.random() * maxSacar) + 1;
              let serialsToExtract = [];
              if (material.unit === 'UND') {
                   serialsToExtract = inventarioFinal[material.code].serials.splice(0, qty); 
              } else {
                   if(inventarioFinal[material.code].serials.length > 0) serialsToExtract.push(inventarioFinal[material.code].serials[0]);
              }
              inventarioFinal[material.code].stock -= qty;

              insertMov.run(movId, 'SALIDA', fechaStr, fechaHoraStr, null, null, trabajadores[Math.floor(Math.random() * trabajadores.length)], aprobadores[Math.floor(Math.random() * aprobadores.length)], 'Mantenimiento en Planta', null);

              for(const s of serialsToExtract) {
                deleteStock.run(material.code, s);
                insertDet.run(movId, material.code, 1, s);
              }
          }
      }
      currentDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)); 
      if(currentDate > END_DATE) break;
    }
  });

  poblarTransaccion();
}