import React, { useState, useEffect } from 'react';
import styles from './InventoryTable.module.css';
import { MdArrowDropDown, MdMoreVert, MdQrCode2 } from 'react-icons/md';

export const InventoryTable = ({ data, onViewSerials }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  // Cerrar el menú de 3 puntos si se hace clic en cualquier parte de la ventana
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuIndex(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleToggleMenu = (e, index) => {
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>CÓDIGO <MdArrowDropDown size={14} style={{verticalAlign: 'middle'}}/></th>
              <th>DESCRIPCIÓN DEL MATERIAL</th>
              <th>CATEGORÍA</th>
              <th>UBICACIÓN</th>
              <th>UNIDAD</th>
              <th>STOCK ACTUAL</th>
              <th>STOCK MÍNIMO</th>
              <th>ESTADO</th>
              <th style={{ textAlign: 'center', width: '60px' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.code || index}>
                <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{row.code}</td>
                <td>{row.desc}</td>
                <td>{row.cat}</td>
                <td>{row.loc}</td>
                <td>{row.unit}</td>
                <td style={{ fontWeight: '800', fontSize: '14px' }}>{row.stock}</td>
                <td>{row.min}</td>
                <td>
                  <span className={`${styles.badge} ${row.status === 'Stock OK' ? styles.badgeOk : styles.badgeCritical}`}>
                    {row.status}
                  </span>
                </td>
                <td className={styles.actionCell}>
                  <button 
                    className={styles.dotsBtn} 
                    onClick={(e) => handleToggleMenu(e, index)}
                    title="Opciones"
                  >
                    <MdMoreVert size={20} />
                  </button>

                  {openMenuIndex === index && (
                    <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                      <button 
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenMenuIndex(null);
                          onViewSerials(row);
                        }}
                      >
                        <MdQrCode2 size={16} color="var(--pdvsa-red)" />
                        Ver seriales ({row.serials?.length || 0})
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};