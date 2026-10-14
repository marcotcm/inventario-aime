import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { InventoryTable } from '../../components/InventoryTable/InventoryTable';
import { NewMaterialModal } from '../../components/Modals/NewMaterialModal';
import { EntryModal } from '../../components/Modals/EntryModal';
import { ExitModal } from '../../components/Modals/ExitModal';
import { FilterModal } from '../../components/Modals/FilterModal';
import { SerialsModal } from '../../components/Modals/SerialsModal';
import { inventarioClientService } from '../../services/inventario.service';
import styles from './Inventory.module.css';
import { MdSearch, MdAdd, MdArrowUpward, MdArrowDownward, MdPictureAsPdf, MdFilterList } from 'react-icons/md';

export const Inventory = () => {
  const [isNewMatOpen, setIsNewMatOpen] = useState(false);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Estado para el modal visor de seriales
  const [serialModalMaterial, setSerialModalMaterial] = useState(null);

  const [tableData, setTableData] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cat: 'Todas',
    loc: 'Todos los Almacenes',
    status: 'Todos'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const cargarInventario = useCallback(async () => {
    try {
      const dataFiltrada = await inventarioClientService.obtenerInventario({
        search: searchTerm,
        ...filters
      });
      const todos = await inventarioClientService.obtenerInventario({});
      setTableData(dataFiltrada);
      setAllMaterials(todos);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  const handleCrearMaterial = async (nuevoMat) => {
    await inventarioClientService.crearNuevoMaterial(nuevoMat);
    await cargarInventario();
  };

  const handleRegistrarEntrada = async (datosEntrada) => {
    await inventarioClientService.registrarEntrada(datosEntrada);
    await cargarInventario();
  };

  const handleRegistrarSalida = async (datosSalida) => {
    await inventarioClientService.registrarSalida(datosSalida);
    await cargarInventario();
  };

  const handleExportar = async () => {
    try {
      const res = await inventarioClientService.exportarInventario();
      if (res.exported) {
        alert(`Inventario exportado exitosamente en:\n${res.filePath}`);
      }
    } catch (error) {
      alert(`Error al exportar: ${error.message}`);
    }
  };

  const totalPages = Math.max(1, Math.ceil(tableData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = tableData.slice(startIndex, startIndex + itemsPerPage);

  const filtrosActivosCount =
    (filters.cat !== 'Todas' ? 1 : 0) +
    (filters.loc !== 'Todos los Almacenes' ? 1 : 0) +
    (filters.status !== 'Todos' ? 1 : 0);

  return (
    <MainLayout>
      <h2 className={styles.pageTitle}>INVENTARIO DE MATERIALES AIT (PETROBOSCAN)</h2>

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <MdSearch size={22} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Buscar material por Código, Nombre, Categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsNewMatOpen(true)}>
              Nuevo Material <MdAdd size={18} />
            </button>
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={() => setIsEntryOpen(true)}>
              Registrar Entrada <MdArrowUpward size={18} />
            </button>
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={() => setIsExitOpen(true)}>
              Registrar Salida <MdArrowDownward size={18} />
            </button>
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={handleExportar}>
              <MdPictureAsPdf size={18} /> Exportar Excel/CSV
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setIsFilterOpen(true)}>
              Filtrar {filtrosActivosCount > 0 ? `(${filtrosActivosCount})` : ''} <MdFilterList size={18} />
            </button>
          </div>
        </div>

        <InventoryTable 
          data={paginatedData} 
          onViewSerials={(mat) => setSerialModalMaterial(mat)} 
        />

        <div className={styles.pagination}>
          <div>
            Mostrando {tableData.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, tableData.length)} de {tableData.length} Materiales
          </div>
          <div className={styles.pageControls}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
              >
                {page}
              </button>
            ))}
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <NewMaterialModal 
        isOpen={isNewMatOpen} 
        onClose={() => setIsNewMatOpen(false)} 
        onSave={handleCrearMaterial} 
      />
      <EntryModal 
        isOpen={isEntryOpen} 
        onClose={() => setIsEntryOpen(false)} 
        materiales={allMaterials}
        onSave={handleRegistrarEntrada}
        onViewSerials={(mat) => setSerialModalMaterial(mat)}
      />
      <ExitModal 
        isOpen={isExitOpen} 
        onClose={() => setIsExitOpen(false)} 
        materiales={allMaterials}
        onSave={handleRegistrarSalida}
        onViewSerials={(mat) => setSerialModalMaterial(mat)}
      />
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        currentFilters={filters}
        onApply={(nuevosFiltros) => setFilters(nuevosFiltros)} 
      />
      <SerialsModal 
        isOpen={!!serialModalMaterial} 
        onClose={() => setSerialModalMaterial(null)} 
        material={serialModalMaterial} 
      />
    </MainLayout>
  );
};