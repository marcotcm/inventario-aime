import React, { useState, useEffect } from 'react';
import styles from './InventoryTable.module.css';
import { MdArrowDropDown, MdMoreVert, MdQrCode2, MdInfo, MdEdit, MdImageNotSupported } from 'react-icons/md';

export const InventoryTable = ({ data, onViewSerials, onViewDetails, onEdit }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

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
              <th style={{ textAlign: 'center', width: '60px' }}>FOTO</th>
              <th>CÓDIGO <MdArrowDropDown size={14} style={{verticalAlign: 'middle'}}/></th>
              <th>MARCA</th>
              <th>DESCRIPCIÓN</th>
              <th>DEPARTAMENTO</th>
              <th>CATEGORÍA</th>
              <th>STOCK</th>
              <th>ESTADO</th>
              <th style={{ textAlign: 'center', width: '60px' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.code || index}>
                <td style={{ textAlign: 'center' }}>
                  {row.foto ? (
                    <img 
                      src={row.foto} 
                      alt={row.code} 
                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} 
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', borderRadius: '6px', margin: '0 auto', border: '1px dashed var(--border-color)' }}>
                      <MdImageNotSupported size={18} color="var(--text-secondary)" />
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{row.code}</td>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{row.marca}</td>
                <td>{row.desc}</td>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{row.departamento}</td>
                <td>{row.cat}</td>
                <td style={{ fontWeight: '800', fontSize: '14px' }}>{row.stock} {row.unit}</td>
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
                          onEdit(row);
                        }}
                      >
                        <MdEdit size={16} color="var(--pdvsa-red)" />
                        Editar Material
                      </button>
                      <button 
                        className={styles.dropdownItem}
                        onClick={() => {
                          setOpenMenuIndex(null);
                          onViewDetails(row);
                        }}
                      >
                        <MdInfo size={16} color="var(--pdvsa-red)" />
                        Ver Detalles
                      </button>
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