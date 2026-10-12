import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose } from 'react-icons/md';

export const FilterModal = ({ isOpen, onClose }) => {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  return (
    <div 
      className={`${styles.overlay} ${styles.overlayCenter} ${!isOpen ? styles.overlayExit : ''}`} 
      onClick={onClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        className={`${styles.centerModal} ${!isOpen ? styles.centerModalExit : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.title}>Filtros Avanzados</div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label>Categoría</label>
            <select className={styles.select}>
              <option>Todas</option>
              <option>Tubería</option>
              <option>Válvulas</option>
              <option>EPP</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Ubicación</label>
            <select className={styles.select}>
              <option>Todos los Almacenes</option>
              <option>Almacén A</option>
              <option>Almacén B</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Estado del Stock</label>
            <select className={styles.select}>
              <option>Todos</option>
              <option>Stock OK</option>
              <option>Crítico</option>
            </select>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Limpiar</button>
          <button className={styles.btnPrimary} onClick={onClose}>Aplicar Filtros</button>
        </div>
      </div>
    </div>
  );
};