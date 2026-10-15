import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose } from 'react-icons/md';

export const FilterModal = ({ isOpen, onClose, currentFilters, onApply }) => {
  const [render, setRender] = useState(isOpen);
  const [cat, setCat] = useState('Todas');
  const [loc, setLoc] = useState('Todos los Almacenes');
  const [status, setStatus] = useState('Todos');
  const [marca, setMarca] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      if (currentFilters) {
        setCat(currentFilters.cat || 'Todas');
        setLoc(currentFilters.loc || 'Todos los Almacenes');
        setStatus(currentFilters.status || 'Todos');
        setMarca(currentFilters.marca || '');
      }
    }
  }, [isOpen, currentFilters]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  const handleClear = () => {
    const clean = { cat: 'Todas', loc: 'Todos los Almacenes', status: 'Todos', marca: '' };
    setCat(clean.cat);
    setLoc(clean.loc);
    setStatus(clean.status);
    setMarca(clean.marca);
    onApply(clean);
    onClose();
  };

  const handleApply = () => {
    onApply({ cat, loc, status, marca });
    onClose();
  };

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
            <label>Filtrar por Marca</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ej. Cisco, Schneider..." 
              value={marca} 
              onChange={(e) => setMarca(e.target.value)} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Categoría</label>
            <select className={styles.select} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="Todas">Todas</option>
              <option value="Tubería">Tubería</option>
              <option value="Válvulas">Válvulas</option>
              <option value="Conexiones">Conexiones</option>
              <option value="EPP">EPP</option>
              <option value="Fluidos">Fluidos</option>
              <option value="Soldadura">Soldadura</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Ubicación Física</label>
            <select className={styles.select} value={loc} onChange={(e) => setLoc(e.target.value)}>
              <option value="Todos los Almacenes">Todos los Almacenes</option>
              <option value="Almacén A">Almacén A</option>
              <option value="Almacén B">Almacén B</option>
              <option value="Almacén C">Almacén C</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Estado del Stock</label>
            <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Stock OK">Stock OK</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={handleClear}>Limpiar</button>
          <button className={styles.btnPrimary} onClick={handleApply}>Aplicar Filtros</button>
        </div>
      </div>
    </div>
  );
};