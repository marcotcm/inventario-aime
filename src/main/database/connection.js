import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const getDbPath = () => path.join(app.getPath('userData'), 'pdvsa_mock_db_v2.json');

const initialData = {
  productos: [
    { 
      code: 'PM-0001', 
      desc: 'Tubería de Acero 6"x6m', 
      cat: 'Tubería', 
      loc: 'Almacén A', 
      unit: 'UND', 
      stock: 5, 
      min: 2, 
      status: 'Stock OK', 
      serials: ['SN-TUB6-001', 'SN-TUB6-002', 'SN-TUB6-003', 'SN-TUB6-004', 'SN-TUB6-005'] 
    },
    { 
      code: 'PM-0005', 
      desc: 'Válvula de Compuerta 4" ANSI 150', 
      cat: 'Válvulas', 
      loc: 'Almacén B', 
      unit: 'UND', 
      stock: 3, 
      min: 5, 
      status: 'Crítico', 
      serials: ['SN-VAL4-101', 'SN-VAL4-102', 'SN-VAL4-103'] 
    },
    { 
      code: 'PM-0012', 
      desc: 'Empacadura Espiralada 4" RF', 
      cat: 'Conexiones', 
      loc: 'Almacén A', 
      unit: 'UND', 
      stock: 4, 
      min: 2, 
      status: 'Stock OK', 
      serials: ['SN-EMP4-201', 'SN-EMP4-202', 'SN-EMP4-203', 'SN-EMP4-204'] 
    },
    { 
      code: 'PM-0021', 
      desc: 'Casco de Seguridad (Rojo) PDVSA', 
      cat: 'EPP', 
      loc: 'Almacén C', 
      unit: 'UND', 
      stock: 4, 
      min: 2, 
      status: 'Stock OK', 
      serials: ['SN-CAS-301', 'SN-CAS-302', 'SN-CAS-303', 'SN-CAS-304'] 
    },
    { 
      code: 'PM-0033', 
      desc: 'Lubricante Multigrado SAE 15W-40', 
      cat: 'Fluidos', 
      loc: 'Almacén B', 
      unit: 'LTR', 
      stock: 2, 
      min: 5, 
      status: 'Crítico', 
      serials: ['LOTE-LUB-01', 'LOTE-LUB-02'] 
    },
    { 
      code: 'PM-0041', 
      desc: 'Electrodos de Soldadura E7018 1/8"', 
      cat: 'Soldadura', 
      loc: 'Almacén A', 
      unit: 'KG', 
      stock: 3, 
      min: 1, 
      status: 'Stock OK', 
      serials: ['CAJA-ELEC-01', 'CAJA-ELEC-02', 'CAJA-ELEC-03'] 
    }
  ],
  movimientos: []
};

export const db = {
  read: () => {
    try {
      const dbPath = getDbPath();
      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
        return initialData;
      }
      const raw = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      console.error('Error leyendo la BD simulada:', error);
      return initialData;
    }
  },
  write: (data) => {
    try {
      const dbPath = getDbPath();
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Error escribiendo en la BD simulada:', error);
      return false;
    }
  }
};