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

  // Extraemos los detalles si existen (que traen proveedor y estado), 
  // si no, simulamos un formato básico para mantener compatibilidad
  const stockDetails = material.stockDetails || (material.serials || []).map(s => ({
    serial: s,
    proveedor_nombre: 'Proveedor No Especificado',
    estado_material: 'N/A'
  }));

  const filteredDetails = stockDetails.filter((item) =>
    item.serial.toLowerCase().includes(search.toLowerCase()) ||
    item.proveedor_nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupar los seriales filtrados por Proveedor
  const groupedByProvider = filteredDetails.reduce((acc, curr) => {
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
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--bg-main)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '6px', 
            padding: '0 10px' 
          }}>
            <MdSearch size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              className={styles.input} 
              style={{ border: 'none', background: 'transparent' }}
              placeholder="Buscar serial específico o proveedor..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {Object.keys(groupedByProvider).length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No se encontraron seriales registrados para este criterio.
            </div>
          ) : (
            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
              {Object.keys(groupedByProvider).map((proveedor, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: 'var(--pdvsa-red)', 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    {proveedor}
                  </div>
                  <div className={styles.serialsListWrapper}>
                    {groupedByProvider[proveedor].map((item, sIdx) => (
                      <div key={sIdx} className={styles.serialBadgeItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <MdQrCode2 size={16} color="var(--text-secondary)" />
                           <span style={{ fontWeight: '700' }}>{item.serial}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '22px' }}>
                          Estado: {item.estado_material}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.btnPrimary} 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};