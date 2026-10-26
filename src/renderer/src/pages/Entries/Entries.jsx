// src/renderer/src/pages/Entries/Entries.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { EntryModal } from '../../components/Modals/EntryModal';
import { inventarioClientService } from '../../services/inventario.service';
import { pedidosClientService } from '../../services/pedidos.client.service';
import { useReportExport } from '../../hooks/useReportExport';
import styles from './Entries.module.css';
import { MdDateRange, MdKeyboardArrowDown, MdKeyboardArrowUp, MdAdd, MdTableView, MdPictureAsPdf } from 'react-icons/md';

export const Entries = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const { exportReport, isExporting } = useReportExport();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ desde: '', hasta: '' });

  const cargarDatos = useCallback(async () => {
    try {
      const [movsData, invData] = await Promise.all([
        inventarioClientService.obtenerMovimientos('ENTRADA'),
        inventarioClientService.obtenerInventario({ departamento: 'TODOS' })
      ]);
      setMovimientos(movsData);
      setInventario(invData?.items || invData || []);

      if (movsData.length > 0) {
        const fechasUnicas = [...new Set(movsData.map(m => m.fecha))].sort((a, b) => new Date(b) - new Date(a));
        if (fechasUnicas.length > 0 && Object.keys(expandedDates).length === 0) {
          setExpandedDates({ [fechasUnicas[0]]: true });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleNuevaEntrada = async (datos) => {
    await pedidosClientService.crearPedido(datos);
    await cargarDatos();
  };

  const toggleDate = (date) => setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  const getMaterialInfo = (code) => inventario.find(m => m.code === code) || { nombre: 'Desconocido', descripcion: '', unit: 'UND', marca: '', modelo: '' };

  const filteredMovimientos = movimientos.filter(mov => {
    let matchDate = true;
    if (dateRange.desde && dateRange.hasta) {
      matchDate = mov.fecha >= dateRange.desde && mov.fecha <= dateRange.hasta;
    } else if (dateRange.desde) {
      matchDate = mov.fecha >= dateRange.desde;
    } else if (dateRange.hasta) {
      matchDate = mov.fecha <= dateRange.hasta;
    }

    let matchText = true;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      
      const movMatches = (mov.factura && mov.factura.toLowerCase().includes(term)) ||
                         (mov.trabajador && mov.trabajador.toLowerCase().includes(term)) ||
                         mov.id.toLowerCase().includes(term);

      const itemsMatch = mov.items.some(it => {
        const matInfo = getMaterialInfo(it.code);
        return it.code.toLowerCase().includes(term) ||
               (it.proveedor && it.proveedor.toLowerCase().includes(term)) ||
               (it.serials && it.serials.some(s => s.toLowerCase().includes(term))) ||
               matInfo.nombre.toLowerCase().includes(term) ||
               (matInfo.marca && matInfo.marca.toLowerCase().includes(term));
      });

      matchText = movMatches || itemsMatch;
    }

    return matchDate && matchText;
  });

  const groupedData = filteredMovimientos.reduce((acc, mov) => {
    if (!acc[mov.fecha]) acc[mov.fecha] = { movimientos: [], totalItems: 0, totalQty: 0 };
    acc[mov.fecha].movimientos.push(mov);
    mov.items.forEach(item => {
      acc[mov.fecha].totalItems += 1;
      acc[mov.fecha].totalQty += Number(item.qty);
    });
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

  const handleExport = (formato) => {
    exportReport(formato, 'HISTORIAL_ENTRADAS', filteredMovimientos, { desde: dateRange.desde || 'Inicio', hasta: dateRange.hasta || 'Actual' });
  };

  return (
    <MainLayout>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>REGISTRO Y CONSULTA DE INGRESOS</h2>
        <div className={styles.actions}>
          <button className={styles.btnEntry} onClick={() => setIsEntryModalOpen(true)}>
            Nueva Entrada <MdAdd size={18} />
          </button>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-card)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>DESDE:</span>
            <input type="date" className={styles.filterInput} value={dateRange.desde} onChange={(e) => setDateRange({...dateRange, desde: e.target.value})} />
            
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginLeft: '5px' }}>HASTA:</span>
            <input type="date" className={styles.filterInput} value={dateRange.hasta} onChange={(e) => setDateRange({...dateRange, hasta: e.target.value})} />
            
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 5px' }}></div>
            
            <input 
              type="text" 
              className={styles.filterInput}
              style={{ width: '350px' }}
              placeholder="Buscar prov, rec, marca, serial, cód..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.btnOutline} onClick={() => handleExport('EXCEL')} disabled={isExporting}>
              <MdTableView size={16} color="#16A34A" /> {isExporting ? '...' : 'Excel'}
            </button>
            <button className={styles.btnOutline} onClick={() => handleExport('PDF')} disabled={isExporting}>
              <MdPictureAsPdf size={16} color="#DC2626" /> {isExporting ? '...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.accordionContainer}>
          {sortedDates.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron ingresos con los filtros aplicados.</div>
          ) : (
            sortedDates.map((date) => {
              const group = groupedData[date];
              const isExpanded = !!expandedDates[date];

              return (
                <div key={date} className={styles.groupCard}>
                  <div className={styles.groupHeader} onClick={() => toggleDate(date)}>
                    <div className={styles.groupTitle}>
                      <MdDateRange size={18} /> Fecha: {date}
                      {isExpanded ? (
                        <span className={styles.groupSummary}>
                          Resumen del día: {group.totalItems} Lotes Ingresados | Total: {group.totalQty} unidades recibidas.
                        </span>
                      ) : (
                        <span className={styles.groupSummaryCollapsed}>
                          [{group.totalItems} Lotes | {group.totalQty} unidades]
                        </span>
                      )}
                    </div>
                    {isExpanded ? <MdKeyboardArrowUp size={24} color="var(--text-secondary)"/> : <MdKeyboardArrowDown size={24} color="var(--text-secondary)"/>}
                  </div>

                  {isExpanded && (
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>HORA</th>
                            <th>CÓDIGO / MARCA</th>
                            <th>NOMBRE / DESCRIPCIÓN</th>
                            <th>CANTIDAD</th>
                            <th>PROVEEDOR / RECEPTOR</th>
                            <th>SERIALES</th>
                            <th>GUÍA/FACTURA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.movimientos.map((mov) => (
                            mov.items.map((it, idx) => {
                              const matInfo = getMaterialInfo(it.code);
                              return (
                                <tr key={`${mov.id}-${idx}`}>
                                  <td style={{ color: 'var(--text-secondary)' }}>{formatTime(mov.fechaHora)}</td>
                                  <td>
                                    <div style={{ fontWeight: '700' }}>{it.code}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{matInfo.marca}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontWeight: '600' }}>{matInfo.nombre}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{matInfo.descripcion}</div>
                                  </td>
                                  <td><span className={styles.pillGreen}>+{it.qty} {matInfo.unit}</span></td>
                                  <td>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)'}}>{it.proveedor}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Receptor: {mov.trabajador || 'N/A'}</div>
                                  </td>
                                  <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '150px' }}>{it.serials?.join(', ')}</td>
                                  <td>{mov.factura}</td>
                                </tr>
                              );
                            })
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <EntryModal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} materiales={inventario} onSave={handleNuevaEntrada} />
    </MainLayout>
  );
};