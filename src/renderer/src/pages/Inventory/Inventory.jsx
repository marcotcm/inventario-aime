import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { InventoryTable } from '../../components/InventoryTable/InventoryTable';
import { NewMaterialModal } from '../../components/Modals/NewMaterialModal';
import { EditMaterialModal } from '../../components/Modals/EditMaterialModal';
import { EntryModal } from '../../components/Modals/EntryModal';
import { ExitModal } from '../../components/Modals/ExitModal';
import { SerialsModal } from '../../components/Modals/SerialsModal';
import { MaterialDetailModal } from '../../components/Modals/MaterialDetailModal';
import { FilterModal } from '../../components/Modals/FilterModal';
import { inventarioClientService } from '../../services/inventario.service';
import { useReportExport } from '../../hooks/useReportExport';
import styles from './Inventory.module.css';
import { MdSearch, MdAdd, MdArrowUpward, MdArrowDownward, MdFilterList, MdTableView, MdPictureAsPdf } from 'react-icons/md';

export const Inventory = () => {
  const [isNewMatOpen, setIsNewMatOpen] = useState(false);
  const [editModalMaterial, setEditModalMaterial] = useState(null);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [serialModalMaterial, setSerialModalMaterial] = useState(null);
  const [detailModalMaterial, setDetailModalMaterial] = useState(null);

  const [tableData, setTableData] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deptoFilter, setDeptoFilter] = useState('TODOS');
  const [advancedFilters, setAdvancedFilters] = useState({ cat: 'Todas', loc: 'Todos los Almacenes', status: 'Todos', marca: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6; 

  const { exportReport, isExporting } = useReportExport();

  const cargarInventario = useCallback(async () => {
    try {
      const response = await inventarioClientService.obtenerInventario({
        search: searchTerm, 
        departamento: deptoFilter,
        ...advancedFilters,
        page: currentPage,
        limit: itemsPerPage
      });
      
      setTableData(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);

      const todosResp = await inventarioClientService.obtenerInventario({ departamento: 'TODOS' });
      setAllMaterials(todosResp.items || []);

    } catch (error) { 
      console.error('Error cargando inventario:', error); 
    }
  }, [searchTerm, deptoFilter, advancedFilters, currentPage]);

  useEffect(() => { 
    cargarInventario(); 
  }, [cargarInventario]);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  const handleSearchChange = (val) => { setSearchTerm(val); setCurrentPage(1); };
  const handleDeptoChange = (val) => { setDeptoFilter(val); setCurrentPage(1); };
  const handleApplyFilters = (filtros) => { setAdvancedFilters(filtros); setCurrentPage(1); };

  const handleCrearMaterial = async (nuevoMat) => { 
    await inventarioClientService.crearNuevoMaterial(nuevoMat); 
    await cargarInventario(); 
  };

  const handleActualizarMaterial = async (code, datos) => {
    await inventarioClientService.actualizarMaterial(code, datos);
    await cargarInventario();
  };

  const handleRegistrarEntrada = async (datos) => { 
    await inventarioClientService.registrarEntrada(datos); 
    await cargarInventario(); 
  };
  const handleRegistrarSalida = async (datos) => { 
    await inventarioClientService.registrarSalida(datos); 
    await cargarInventario(); 
  };

  const handleExportar = async (formato) => {
    try {
      const respSinPaginacion = await inventarioClientService.obtenerInventario({
        search: searchTerm, 
        departamento: deptoFilter,
        ...advancedFilters
      });
      exportReport(formato, 'INVENTARIO', respSinPaginacion.items || [], { desde: 'Actual', hasta: 'En Tiempo Real' });
    } catch (error) {
      console.error("Error al exportar inventario completo:", error);
    }
  };

  const handlePageJump = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      let p = parseInt(inputPage);
      if (isNaN(p) || p < 1) p = 1;
      if (p > totalPages) p = totalPages;
      setCurrentPage(p);
      setInputPage(p);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tituloDepto = deptoFilter !== 'TODOS' && deptoFilter !== 'NINGUNO' ? ` ${deptoFilter}` : '';

  return (
    <MainLayout>
      <h2 className={styles.pageTitle}>INVENTARIO DE MATERIALES{tituloDepto} (PETROBOZCAN)</h2>

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarTop}>
            <div className={styles.searchBox}>
              <MdSearch size={22} color="var(--text-secondary)" />
              <input 
                type="text" 
                placeholder="Buscar material por Código, Nombre o Marca..." 
                value={searchTerm} 
                onChange={(e) => handleSearchChange(e.target.value)} 
              />
            </div>

            <div className={styles.deptoFilterWrapper}>
               <span className={styles.deptoLabel}>
                 <MdFilterList size={16} /> DEPTO:
               </span>
               <select 
                  className={styles.deptoSelect}
                  value={deptoFilter} 
                  onChange={(e) => handleDeptoChange(e.target.value)}
                >
                 <option value="TODOS">Todos</option>
                 <option value="AIT">AIT</option>
                 <option value="SCADA">SCADA</option>
                 <option value="TELECOM">TELECOM</option>
                 <option value="NINGUNO">Ninguno (Ocultar Todo)</option>
               </select>
            </div>
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
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={() => handleExportar('EXCEL')} disabled={isExporting}> 
              <MdTableView size={18} color="#16A34A" /> {isExporting ? '...' : 'Excel'}
            </button>
            <button className={`${styles.btn} ${styles.btnDark}`} onClick={() => handleExportar('PDF')} disabled={isExporting}> 
              <MdPictureAsPdf size={18} color="#DC2626" /> {isExporting ? '...' : 'PDF'}
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setIsFilterOpen(true)}> 
              Filtrar <MdFilterList size={18} /> 
            </button>
          </div>
        </div>

        <InventoryTable 
          data={tableData} 
          onEdit={(mat) => setEditModalMaterial(mat)}
          onViewSerials={(mat) => setSerialModalMaterial(mat)} 
          onViewDetails={(mat) => setDetailModalMaterial(mat)} 
        />

        <div className={styles.pagination}>
          <div>
            Mostrando {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} de {totalItems} Materiales
          </div>
          <div className={styles.pageControls}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage <= 1} 
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            > 
              Anterior 
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Pág.</span>
              <input 
                type="number" 
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={handlePageJump}
                onBlur={handlePageJump}
                style={{
                  width: '50px', padding: '6px', textAlign: 'center', 
                  borderRadius: '6px', border: '1px solid var(--pdvsa-red)', 
                  background: 'var(--bg-main)', color: 'var(--pdvsa-red)', 
                  fontWeight: 'bold', outline: 'none'
                }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>de {totalPages}</span>
            </div>

            <button 
              className={styles.pageBtn} 
              disabled={currentPage >= totalPages} 
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            > 
              Siguiente 
            </button>
          </div>
        </div>
      </div>

      <NewMaterialModal isOpen={isNewMatOpen} onClose={() => setIsNewMatOpen(false)} onSave={handleCrearMaterial} />
      <EditMaterialModal isOpen={!!editModalMaterial} onClose={() => setEditModalMaterial(null)} material={editModalMaterial} onSave={handleActualizarMaterial} />
      <EntryModal isOpen={isEntryOpen} onClose={() => setIsEntryOpen(false)} materiales={allMaterials} onSave={handleRegistrarEntrada} onViewSerials={(mat) => setSerialModalMaterial(mat)} />
      <ExitModal isOpen={isExitOpen} onClose={() => setIsExitOpen(false)} materiales={allMaterials} onSave={handleRegistrarSalida} onViewSerials={(mat) => setSerialModalMaterial(mat)} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} currentFilters={advancedFilters} onApply={handleApplyFilters} />
      <SerialsModal isOpen={!!serialModalMaterial} onClose={() => setSerialModalMaterial(null)} material={serialModalMaterial} />
      <MaterialDetailModal isOpen={!!detailModalMaterial} onClose={() => setDetailModalMaterial(null)} material={detailModalMaterial} />
    </MainLayout>
  );
};