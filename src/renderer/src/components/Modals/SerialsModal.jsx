import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdSearch, MdQrCode2 } from 'react-icons/md';

export const SerialsModal = ({ isOpen, onClose, material }) => {
  const [render, setRender] = useState(isOpen);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setSearch('');
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render || !material) return null;

  const serialsList = material.serials || [];
  const filteredSerials = serialsList.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      className={`${styles.overlay} ${styles.overlayCenter} ${!isOpen ? styles.overlayExit : ''}`} 
      style={{ zIndex: 1100 }}
      onClick={onClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        className={`${styles.centerModal} ${!isOpen ? styles.centerModalExit : ''}`} 
        style={{ width: '480px', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Seriales Registrados ({material.code})</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {material.desc} — Stock Total: <strong>{material.stock} {material.unit}</strong>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>

        <div className={styles.body}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 10px' }}>
            <MdSearch size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              className={styles.input} 
              style={{ border: 'none', background: 'transparent' }}
              placeholder="Buscar serial específico..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredSerials.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No se encontraron seriales registrados para este criterio.
            </div>
          ) : (
            <div className={styles.serialsListWrapper}>
              {filteredSerials.map((serial, idx) => (
                <div key={idx} className={styles.serialBadgeItem}>
                  <MdQrCode2 size={16} color="var(--pdvsa-red)" />
                  <span>{serial}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnPrimary} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};