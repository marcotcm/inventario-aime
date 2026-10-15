import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdInfoOutline, MdQrCode2, MdImageNotSupported } from 'react-icons/md';

export const MaterialDetailModal = ({ isOpen, onClose, material }) => {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render || !material) return null;

  return (
    <div 
      className={`${styles.overlay} ${styles.overlayCenter} ${!isOpen ? styles.overlayExit : ''}`} 
      onClick={onClose}
      onAnimationEnd={handleAnimationEnd}
      style={{ zIndex: 1050 }}
    >
      <div 
        className={`${styles.centerModal} ${!isOpen ? styles.centerModalExit : ''}`} 
        style={{ width: '550px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.title} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <MdInfoOutline size={22} color="var(--pdvsa-red)"/> Detalles del Material
          </div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>
        
        <div className={styles.body} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          {/* Cabecera con Foto e Información Principal */}
          <div className={styles.dynamicItem} style={{ gridColumn: '1 / -1', margin: 0, borderLeft: '4px solid var(--pdvsa-red)', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ width: '70px', height: '70px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {material.foto ? (
                <img src={material.foto} alt={material.code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <MdImageNotSupported size={28} color="var(--text-secondary)" />
              )}
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)', fontSize: '16px' }}>{material.desc}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>CÓDIGO: {material.code}</p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Marca</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.marca}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Modelo</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.modelo}</div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Departamento Asignado</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.departamento}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Categoría</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.cat}</div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Ubicación Física</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.loc}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Unidad de Medida</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.unit}</div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Stock Actual</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)', fontWeight: 'bold', color: 'var(--pdvsa-red)' }}>{material.stock}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Stock Mínimo Permitido</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.min}</div>
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Seriales Registrados en Stock ({material.serials?.length || 0})</label>
            <div className={styles.serialGrid} style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {(material.serials || []).map((s, i) => (
                <div key={i} className={styles.serialBadgeItem} style={{fontSize: '11px', padding: '6px'}}>
                  <MdQrCode2 size={14} color="var(--pdvsa-red)"/> {s}
                </div>
              ))}
              {(!material.serials || material.serials.length === 0) && (
                <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>No hay seriales registrados en este momento.</span>
              )}
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <button className={styles.btnPrimary} onClick={onClose}>Cerrar Detalles</button>
        </div>
      </div>
    </div>
  );
};