import React, { useState, useEffect, useRef } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdErrorOutline } from 'react-icons/md';

export const NewMaterialModal = ({ isOpen, onClose, onSave }) => {
  const [render, setRender] = useState(isOpen);
  const [formData, setFormData] = useState({
    code: '',
    desc: '',
    cat: 'Tubería',
    loc: 'Almacén A',
    unit: 'UND',
    stock: 1,
    min: 5,
    serials: ['']
  });
  const [error, setError] = useState('');
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setRender(true);
      setError('');
      setFormData({
        code: '',
        desc: '',
        cat: 'Tubería',
        loc: 'Almacén A',
        unit: 'UND',
        stock: 1,
        min: 5,
        serials: ['']
      });
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Hacer que el error flotante desaparezca automáticamente a los 4 segundos
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  const handleStockChange = (newStock) => {
    setError('');
    const qty = Math.max(0, parseInt(newStock) || 0);
    const currentSerials = formData.serials || [];
    let updatedSerials = [];

    if (qty > currentSerials.length) {
      updatedSerials = [...currentSerials, ...Array(qty - currentSerials.length).fill('')];
    } else {
      updatedSerials = currentSerials.slice(0, qty);
    }

    setFormData({ ...formData, stock: qty, serials: updatedSerials });
  };

  const handleSerialChange = (index, val) => {
    setError('');
    const updated = [...formData.serials];
    updated[index] = val;
    setFormData({ ...formData, serials: updated });
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.desc.trim()) {
      setError('El Código y la Descripción del material son obligatorios.');
      return;
    }

    if (formData.stock > 0) {
      const limpios = formData.serials.map((s) => s.trim());
      const indexVacio = limpios.findIndex((s) => s === '');
      if (indexVacio !== -1) {
        setError(`El Serial #${indexVacio + 1} está en blanco. Complételo o reduzca el Stock Inicial.`);
        return;
      }
      const unicos = new Set(limpios.map((s) => s.toUpperCase()));
      if (unicos.size !== limpios.length) {
        setError('Ha ingresado seriales repetidos para este material.');
        return;
      }
    }

    try {
      setError('');
      await onSave(formData);
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
    >
      <div 
        className={`${styles.centerModal} ${!isOpen ? styles.centerModalExit : ''}`} 
        style={{ width: '500px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.title}>Registrar Nuevo Material</div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label>Código del Material (Manual)</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ej. PM-0080" 
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Descripción del Material</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder='Ej. Válvula Esférica 2" ANSI 300' 
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Categoría</label>
              <select 
                className={styles.select} 
                value={formData.cat}
                onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
              >
                <option value="Tubería">Tubería</option>
                <option value="Válvulas">Válvulas</option>
                <option value="Conexiones">Conexiones</option>
                <option value="EPP">EPP</option>
                <option value="Fluidos">Fluidos</option>
                <option value="Soldadura">Soldadura</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Ubicación</label>
              <select 
                className={styles.select}
                value={formData.loc}
                onChange={(e) => setFormData({ ...formData, loc: e.target.value })}
              >
                <option value="Almacén A">Almacén A</option>
                <option value="Almacén B">Almacén B</option>
                <option value="Almacén C">Almacén C</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Unidad</label>
              <select 
                className={styles.select}
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="UND">UND</option>
                <option value="LTR">LTR</option>
                <option value="KG">KG</option>
                <option value="MTR">MTR</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Stock Inicial</label>
              <input 
                type="number" 
                className={styles.input} 
                min="0"
                value={formData.stock}
                onChange={(e) => handleStockChange(e.target.value)}
              />
            </div>

            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Stock Mínimo</label>
              <input 
                type="number" 
                className={styles.input} 
                min="0"
                value={formData.min}
                onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })}
              />
            </div>
          </div>

          {formData.stock > 0 && (
            <div className={styles.formGroup}>
              <label>Seriales Iniciales del Material ({formData.stock})</label>
              <div className={styles.serialGrid}>
                {formData.serials.map((s, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className={styles.input}
                    placeholder={`Serial #${idx + 1}`}
                    value={s}
                    onChange={(e) => handleSerialChange(idx, e.target.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notificación flotante superpuesta */}
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
          <button className={styles.btnPrimary} onClick={handleSubmit}>Crear Material</button>
        </div>
      </div>
    </div>
  );
};