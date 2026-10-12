import React from 'react';
import styles from './InventoryTable.module.css';
import { MdArrowDropDown } from 'react-icons/md';

export const InventoryTable = ({ data }) => {
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
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};