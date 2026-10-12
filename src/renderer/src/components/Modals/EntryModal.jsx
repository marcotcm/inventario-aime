import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose } from 'react-icons/md';

export const EntryModal = ({ isOpen, onClose }) => {
  const [render, setRender] = useState(isOpen);
  const [items, setItems] = useState([{ material: '', qty: 1, unit: 'UND', serials: [''] }]);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  const handleQtyChange = (index, newQty) => {
    const qty = parseInt(newQty) || 0;
    const newItems = [...items];
    newItems[index].qty = qty;
    
    const currentSerials = newItems[index].serials || [];
    if (qty > currentSerials.length) {
      newItems[index].serials = [...currentSerials, ...Array(qty - currentSerials.length).fill('')];
    } else {
      newItems[index].serials = currentSerials.slice(0, qty);
    }
    setItems(newItems);
  };

  const handleSerialChange = (itemIndex, serialIndex, value) => {
    const newItems = [...items];
    newItems[itemIndex].serials[serialIndex] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { material: '', qty: 1, unit: 'UND', serials: [''] }]);

  return (
    <div 
      className={`${styles.overlay} ${!isOpen ? styles.overlayExit : ''}`} 
      onClick={onClose} 
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        className={`${styles.sidePanel} ${!isOpen ? styles.sidePanelExit : ''}`} 
        onClick={(e) => e.stopPropagation()} /* Evita cerrar al hacer clic dentro del panel */
      >
        <div className={styles.header}>
          <div className={styles.title}>Registrar Nueva Entrada</div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label>Fecha de Ingreso</label>
            <input type="date" className={styles.input} />
          </div>
          
          <div className={styles.formGroup}>
            <label>Proveedor</label>
            <input type="text" className={styles.input} placeholder="Ej. Aceros Monagas" />
          </div>

          <div className={styles.formGroup}>
            <label>Nro. Referencia/Factura</label>
            <input type="text" className={styles.input} placeholder="000-123456" />
          </div>

          <div className={styles.formGroup}>
            <label>Lista de Materiales</label>
            {items.map((item, index) => (
              <div key={index} className={styles.dynamicItem}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 2 }}>
                    <input type="text" className={styles.input} placeholder="Buscar Material..." />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={item.qty} 
                      min="1"
                      onChange={(e) => handleQtyChange(index, e.target.value)} 
                      title="Cantidad"
                    />
                  </div>
                </div>
                
                {item.qty > 0 && (
                  <div className={styles.formGroup}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Seriales / Identificadores Únicos ({item.qty})
                    </label>
                    <div className={styles.serialGrid}>
                      {item.serials.map((serial, sIndex) => (
                        <input 
                          key={sIndex}
                          type="text" 
                          className={styles.input} 
                          placeholder={`Serial #${sIndex + 1}`}
                          value={serial}
                          onChange={(e) => handleSerialChange(index, sIndex, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addItem} 
              style={{ background: 'none', border: 'none', color: 'var(--active-text)', fontWeight: '600', cursor: 'pointer', textAlign: 'left', marginTop: '5px' }}
            >
              + Añadir otro material
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Notas</label>
            <textarea className={styles.textarea} rows="3" placeholder="Observaciones de la entrada..."></textarea>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.btnPrimary} onClick={onClose}>Guardar Entrada</button>
        </div>
      </div>
    </div>
  );
};