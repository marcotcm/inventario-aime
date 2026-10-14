import { useCallback, useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { InventoryTable } from '../../components/InventoryTable/InventoryTable';
import { MaterialModal } from '../../components/Modals/MaterialModal';
import { EntryModal } from '../../components/Modals/EntryModal';
import { ExitModal } from '../../components/Modals/ExitModal';
import { FilterModal } from '../../components/Modals/FilterModal';
import styles from './Inventory.module.css';
import { MdSearch, MdAdd, MdArrowUpward, MdArrowDownward, MdPictureAsPdf, MdFilterList } from 'react-icons/md';

export const Inventory = () => {
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadInventory = useCallback(() => {
    return window.api.inventory
      .list()
      .then(setTableData)
      .catch((error) => setLoadError(error.message))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const saveMaterial = async (material) => {
    setIsLoading(true)
    setLoadError('')
    try {
      await window.api.inventory.create(material)
      await loadInventory()
    } finally {
      setIsLoading(false)
    }
  }

  const filteredData = tableData.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term) ||
      item.cat.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <h2 className={styles.pageTitle}>INVENTARIO DE MATERIALES (PETROBOZCAN)</h2>

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <MdSearch size={22} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Buscar material por Código, Nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsMaterialOpen(true)}>
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

        {loadError ? (
          <p role="alert">No se pudo cargar el inventario: {loadError}</p>
        ) : isLoading ? (
          <p role="status">Cargando inventario...</p>
        ) : filteredData.length ? (
          <InventoryTable data={filteredData} />
        ) : (
          <p role="status">
            {tableData.length ? 'No hay materiales que coincidan con la búsqueda.' : 'Todavía no hay materiales registrados.'}
          </p>
        )}

        <div className={styles.pagination}>
          <div>Mostrando {filteredData.length} de {tableData.length} Materiales</div>
        </div>
      </div>

      <MaterialModal
        isOpen={isMaterialOpen}
        onClose={() => setIsMaterialOpen(false)}
        onSave={saveMaterial}
      />
      <EntryModal isOpen={isEntryOpen} onClose={() => setIsEntryOpen(false)} />
      <ExitModal isOpen={isExitOpen} onClose={() => setIsExitOpen(false)} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </MainLayout>
  );
};