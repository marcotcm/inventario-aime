import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { EntryModal } from '../../components/Modals/EntryModal';
import { FilterModal } from '../../components/Modals/FilterModal';
import styles from './Entries.module.css';
import { MdAdd, MdFilterList, MdPictureAsPdf, MdKeyboardArrowDown, MdKeyboardArrowUp, MdDateRange, MdInventory2 } from 'react-icons/md';

export const Entries = () => {
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ '15-10-2026': true });

  const toggleGroup = (date) => {
    setExpandedGroups(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const groupedData = [
    {
      date: '15-10-2026',
      summary: '3 Materiales ingresados | Total: 450 UND recibidas.',
      records: [
        { time: '08:30 AM', code: 'PM-0001', desc: 'Tubería de Acero 6"x6m', qty: '+300 UND', unit: 'UND', provider: 'Aceros Monagas', doc: 'F-00928' },
        { time: '09:15 AM', code: 'PM-0012', desc: 'Empacadura Espiralada 4" RF', qty: '+100 UND', unit: 'UND', provider: 'Conexiones Nacionales', doc: 'FA-771' },
        { time: '11:00 AM', code: 'PM-0041', desc: 'Electrodos de Soldadura E7018 1/8"', qty: '+50 KG', unit: 'KG', provider: 'Suministros Soldafacil', doc: 'SF-312' }
      ]
    },
    { date: '14-10-2026', summary: '2 Materiales | 180 UND', records: [] },
    { date: '13-10-2026', summary: '4 Materiales | 510 UND', records: [] },
    { date: '12-10-2026', summary: '4 Materiales | 510 UND', records: [] },
    { date: '11-10-2026', summary: '2 Materiales | 180 UND', records: [] },
    { date: '10-10-2026', summary: '1 Materiales | 220 UND', records: [] },
  ];

  return (
    <MainLayout>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>REGISTRO Y CONSULTA DE INGRESOS</h2>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnGreen}`} onClick={() => setIsEntryOpen(true)}>
            Nueva Entrada <MdAdd size={18} />
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setIsFilterOpen(true)}>
            Filtrar por Fecha/Proveedor <MdFilterList size={18} />
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`}>
            <MdPictureAsPdf size={18} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.accordionContainer}>
          {groupedData.map((group, idx) => (
            <div key={idx} className={styles.groupCard}>
              <div className={styles.groupHeader} onClick={() => toggleGroup(group.date)}>
                <div className={styles.groupTitle}>
                  <MdDateRange size={18} /> Fecha: {group.date}
                  <span className={styles.groupSummary}>
                    {expandedGroups[group.date] ? <><MdInventory2 size={16} /> Resumen del día: {group.summary}</> : `[${group.summary}]`}
                  </span>
                </div>
                {expandedGroups[group.date] ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
              </div>

              {expandedGroups[group.date] && group.records.length > 0 && (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>HORA <MdKeyboardArrowUp size={14} style={{verticalAlign: 'middle'}}/></th>
                        <th>CÓDIGO MATERIAL</th>
                        <th>DESCRIPCIÓN DEL MATERIAL</th>
                        <th>CANTIDAD (+ unidades)</th>
                        <th>UNIDAD</th>
                        <th>PROVEEDOR</th>
                        <th>NRO. DOCUMENTO (Guía/Factura)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((rec, i) => (
                        <tr key={i}>
                          <td>{rec.time}</td>
                          <td style={{ fontWeight: '600' }}>{rec.code}</td>
                          <td>{rec.desc}</td>
                          <td><span className={styles.pillGreen}>{rec.qty}</span></td>
                          <td>{rec.unit}</td>
                          <td>{rec.provider}</td>
                          <td>{rec.doc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <EntryModal isOpen={isEntryOpen} onClose={() => setIsEntryOpen(false)} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </MainLayout>
  );
};