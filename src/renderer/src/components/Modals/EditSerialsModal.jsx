import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdQrCode2, MdErrorOutline } from 'react-icons/md';

export const EditSerialsModal = ({ isOpen, onClose, material, onSaveSerials }) => {
  const [render, setRender] = useState(isOpen);
  const [serialsList, setSerialsList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && material) {
      setRender(true);
      setError('');
      setSerialsList([...(material.serials || [])]);
    }
  }, [isOpen, material]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render || !material) return null;

  const handleSerialChange = (index, value) => {
    setError('');
    const updated = [...serialsList];
    updated[index] = value;
    setSerialsList(updated);
  };

  const handleSubmit = async () => {
    const limpios = serialsList.map(s => s.trim());
    if (limpios.some(s => s === '')) {
      setError('No puede dejar ningún campo de serial en blanco.');
      return;
    }
    const unicos = new Set(limpios.map(s => s.toUpperCase()));
    if (unicos.size !== limpios.length) {
      setError('Existen seriales duplicados en la lista.');
      return;
    }

    try {
      setError('');
      await onSaveSerials(material.code, limpios);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div 
      className={`${styles.overlay} ${styles.overlayCenter} ${!isOpen ? styles.overlayExit : ''}`} 
      onClick={onClose}
      onAnimationEnd={handleAnimationEnd}
      style={{ zIndex: 1150 }}
    >
      <div 
        className={`${styles.centerModal} ${!isOpen ? styles.centerModalExit : ''}`} 
        style={{ width: '500px', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Editar Seriales Individuales</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Material: <strong>{material.code}</strong> — {material.desc}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>

        <div className={styles.body}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Aquí puedes corregir o actualizar los códigos de seriales físicos registrados en el inventario para este material:
          </p>

          <div className={styles.serialGrid} style={{ gridTemplateColumns: '1fr', maxHeight: '250px', overflowY: 'auto' }}>
            {serialsList.map((serial, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdQrCode2 size={18} color="var(--pdvsa-red)" style={{ flexShrink: 0 }} />
                <input 
                  type="text" 
                  className={styles.input} 
                  value={serial} 
                  onChange={(e) => handleSerialChange(idx, e.target.value)}
                  placeholder={`Serial #${idx + 1}`}
                />
              </div>
            ))}
            {serialsList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Este material no tiene stock ni seriales registrados actualmente.
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className={styles.floatingToast}>
            <MdErrorOutline size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
            <button type="button" className={styles.toastCloseBtn} onClick={() => setError('')}>
              <MdClose size={18} />
            </button>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.btnPrimary} onClick={handleSubmit}>Guardar Seriales</button>
        </div>
      </div>
    </div>
  );
};