import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { InventoryTable } from '../../components/InventoryTable/InventoryTable';
import { EntryModal } from '../../components/Modals/EntryModal';
import { ExitModal } from '../../components/Modals/ExitModal';
import { FilterModal } from '../../components/Modals/FilterModal';
import styles from './Inventory.module.css';
import { MdSearch, MdAdd, MdArrowUpward, MdArrowDownward, MdPictureAsPdf, MdFilterList } from 'react-icons/md';

export const Inventory = () => {
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 1. Estado para almacenar el texto de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Datos base del inventario
  const tableData = [
    { code: 'PM-0001', desc: 'Tubería de Acero 6"x6m', cat: 'Tubería', loc: 'Almacén A', unit: 'UND', stock: 450, min: 100, status: 'Stock OK' },
    { code: 'PM-0005', desc: 'Válvula de Compuerta 4" ANSI 150', cat: 'Válvulas', loc: 'Almacén B', unit: 'UND', stock: 120, min: 30, status: 'Crítico' },
    { code: 'PM-0012', desc: 'Empacadura Espiralada 4" RF', cat: 'Conexiones', loc: 'Almacén A', unit: 'UND', stock: 850, min: 150, status: 'Stock OK' },
    { code: 'PM-0021', desc: 'Casco de Seguridad (Rojo) PDVSA', cat: 'EPP', loc: 'Almacén C', unit: 'UND', stock: 310, min: 50, status: 'Stock OK' },
    { code: 'PM-0033', desc: 'Lubricante Multigrado SAE 15W-40', cat: 'Fluidos', loc: 'Almacén B', unit: 'LTR', stock: 75, min: 200, status: 'Crítico' },
    { code: 'PM-0041', desc: 'Electrodos de Soldadura E7018 1/8"', cat: 'Soldadura', loc: 'Almacén A', unit: 'KG', stock: 180, min: 50, status: 'Stock OK' },
    { code: 'PM-0045', desc: 'Brida Ciega 4" ANSI 150', cat: 'Conexiones', loc: 'Almacén A', unit: 'UND', stock: 50, min: 20, status: 'Stock OK' },
    { code: 'PM-0052', desc: 'Grasa Litio Multipropósito', cat: 'Fluidos', loc: 'Almacén B', unit: 'KG', stock: 15, min: 40, status: 'Crítico' },
  ];

  // 2. Lógica de filtrado reactiva
  const filteredData = tableData.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <h2 className={styles.pageTitle}>INVENTARIO DE MATERIALES (PETROBOZCAN)</h2>

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <MdSearch size={22} color="var(--text-secondary)" />
            {/* 3. Conectamos el input al estado */}
            <input 
              type="text" 
              placeholder="Buscar material por Código, Nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsEntryOpen(true)}>
              Nuevo Material <MdAdd size={18} />
            </button>
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={() => setIsEntryOpen(true)}>
              Registrar Entrada <MdArrowUpward size={18} />
            </button>
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={() => setIsExitOpen(true)}>
              Registrar Salida <MdArrowDownward size={18} />
            </button>
            <button className={`${styles.btn} ${styles.btnDark}`}>
              <MdPictureAsPdf size={18} /> Exportar PDF
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setIsFilterOpen(true)}>
              Filtrar <MdFilterList size={18} />
            </button>
          </div>
        </div>

        {/* 4. Le pasamos a la tabla los datos filtrados en lugar de los totales */}
        <InventoryTable data={filteredData} />

        <div className={styles.pagination}>
          {/* Mostramos dinámicamente cuántos resultados coinciden */}
          <div>Mostrando {filteredData.length} de {tableData.length} Materiales</div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn}>Anterior</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <span className={styles.pageDots}>...</span>
            <button className={styles.pageBtn}>63</button>
            <button className={styles.pageBtn}>Siguiente</button>
          </div>
        </div>
      </div>

      <EntryModal isOpen={isEntryOpen} onClose={() => setIsEntryOpen(false)} />
      <ExitModal isOpen={isExitOpen} onClose={() => setIsExitOpen(false)} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </MainLayout>
  );
};