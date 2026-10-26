// src/renderer/src/components/Modals/MaterialDetailModal.jsx
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

  const stockDetails = material.stockDetails || (material.serials || []).map(s => ({
    serial: s,
    proveedor_nombre: 'Proveedor No Especificado',
    estado_material: 'N/A'
  }));

  const groupedByProvider = stockDetails.reduce((acc, curr) => {
    const prov = curr.proveedor_nombre || 'Proveedor No Especificado';
    if (!acc[prov]) {
      acc[prov] = [];
    }
    acc[prov].push(curr);
    return acc;
  }, {});

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
            <MdInfoOutline size={22} color="var(--pdvsa-red)"/> 
            Detalles del Material
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
          >
            <MdClose size={24} />
          </button>
        </div>
        
        <div className={styles.body} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div className={styles.dynamicItem} style={{ gridColumn: '1 / -1', margin: 0, borderLeft: '4px solid var(--pdvsa-red)', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ 
              width: '70px', 
              height: '70px', 
              flexShrink: 0, 
              borderRadius: '6px', 
              overflow: 'hidden', 
              background: 'var(--bg-main)', 
              border: '1px solid var(--border-color)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {material.foto ? (
                <img src={material.foto} alt={material.code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <MdImageNotSupported size={28} color="var(--text-secondary)" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)', fontSize: '16px' }}>
                {material.nombre}
              </h3>
              <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                {material.descripcion || 'Sin descripción detallada'}
              </p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>
                CÓDIGO: {material.code}
              </p>
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
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.loc || 'No asignada'}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Unidad de Medida</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.unit}</div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Stock Actual</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)', fontWeight: 'bold', color: 'var(--pdvsa-red)' }}>
              {material.stock}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Stock Mínimo Permitido</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)' }}>{material.min}</div>
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Existencia Histórica (Total Ingresado en el tiempo)</label>
            <div className={styles.input} style={{ background: 'var(--bg-main)', fontWeight: 'bold', color: '#16a34a' }}>
              {material.existencia_historica} {material.unit} ingresados históricamente
            </div>
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Seriales en Stock Agrupados por Proveedor ({material.stock})</label>
            
            {Object.keys(groupedByProvider).length === 0 ? (
               <div style={{fontSize:'12px', color:'var(--text-secondary)', padding: '10px', background: 'var(--bg-main)', borderRadius: '6px'}}>
                 No hay seriales registrados en este momento.
               </div>
            ) : (
               <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px' }}>
                 {Object.keys(groupedByProvider).map((proveedor, idx) => (
                   <div key={idx} style={{ marginBottom: '12px' }}>
                     <div style={{ 
                       fontSize: '11px', 
                       fontWeight: '700', 
                       color: 'var(--pdvsa-red)', 
                       marginBottom: '6px'
                     }}>
                       {proveedor}
                     </div>
                     <div className={styles.serialGrid} style={{ marginTop: 0 }}>
                       {groupedByProvider[proveedor].map((item, i) => (
                         <div key={i} className={styles.serialBadgeItem} style={{fontSize: '11px', padding: '6px'}}>
                           <MdQrCode2 size={14} color="var(--text-secondary)"/> 
                           {item.serial} 
                           <span style={{color: 'var(--text-secondary)', fontSize: '9px', marginLeft: 'auto'}}>({item.estado_material})</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

        </div>

        <div className={styles.footer}>
          <button 
            className={styles.btnPrimary} 
            onClick={onClose}
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>
  );
};