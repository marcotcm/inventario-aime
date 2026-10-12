import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { ExitModal } from '../../components/Modals/ExitModal';
import { FilterModal } from '../../components/Modals/FilterModal';
import styles from './Exits.module.css';
import { MdAdd, MdFilterList, MdPictureAsPdf, MdKeyboardArrowDown, MdKeyboardArrowUp, MdDateRange, MdInventory2 } from 'react-icons/md';

export const Exits = () => {
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ '15-10-2026': true });

  const toggleGroup = (date) => {
    setExpandedGroups(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const groupedData = [
    {
      date: '15-10-2026',
      summary: '3 Materiales egresados | Total: 35 UND entregadas.',
      records: [
        { time: '10:15 AM', code: 'PM-0005', desc: 'Válvula de Compuerta 4"', qty: '-10 UND', worker: 'Ing. Carlos Mendoza', apronado: 'Marco Antonio', reason: 'Mantenimiento Preventivo', dest: 'Pozo B-21', doc: 'VS-1024' },
        { time: '02:30 PM', code: 'PM-0021', desc: 'Casco de Seguridad', qty: '-5 UND', worker: 'Sup. Juan García', apronado: 'María López', reason: 'Entrega de EPP', dest: 'Taller Central', doc: 'VS-1025' },
        { time: '04:45 PM', code: 'PM-0033', desc: 'Lubricante Multigrado', qty: '-20 LTR', worker: 'Mnto. Luis Flores', apronado: 'Carlos Rodríguez', reason: 'Cambio de Aceite de Motor', dest: 'Planta de Gas', doc: 'VS-1026' }
      ]
    },
    { date: '14-10-2026', summary: '2 Materiales | 180 UND egresadas', records: [] },
    { date: '13-10-2026', summary: '4 Materiales | 510 UND egresadas', records: [] },
    { date: '12-10-2026', summary: '4 Materiales | 510 UND egresadas', records: [] },
    { date: '11-10-2026', summary: '2 Materiales | 180 UND egresadas', records: [] },
    { date: '10-10-2026', summary: '1 Materiales | 220 UND egresadas', records: [] },
  ];

  return (
    <MainLayout>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>SALIDAS DE MATERIALES (Egresos)</h2>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnRed}`} onClick={() => setIsExitOpen(true)}>
            Nuevo Egreso <MdAdd size={18} />
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setIsFilterOpen(true)}>
            Filtrar por Trabajador/Uso <MdFilterList size={18} />
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
                        <th>CANTIDAD (- unidades)</th>
                        <th>TRABAJADOR / SOLICITANTE</th>
                        <th>APROBADO POR</th>
                        <th>RAZÓN DE SALIDA</th>
                        <th>DESTINO / ÁREA</th>
                        <th>NRO. VALE SALIDA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((rec, i) => (
                        <tr key={i}>
                          <td>{rec.time}</td>
                          <td style={{ fontWeight: '600' }}>{rec.code}</td>
                          <td>{rec.desc}</td>
                          <td><span className={styles.pillRed}>{rec.qty}</span></td>
                          <td>{rec.worker}</td>
                          <td>{rec.apronado}</td>
                          <td>{rec.reason}</td>
                          <td>{rec.dest}</td>
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

      <ExitModal isOpen={isExitOpen} onClose={() => setIsExitOpen(false)} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </MainLayout>
  );
};