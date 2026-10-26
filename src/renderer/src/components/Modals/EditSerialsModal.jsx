import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdQrCode2, MdErrorOutline } from 'react-icons/md';

export const EditSerialsModal = ({ isOpen, onClose, material, onSaveSerials }) => {
  const [render, setRender] = useState(isOpen);
  const [stockItems, setStockItems] = useState([]);
  const [error, setError] = useState('');
  const [proveedoresList, setProveedoresList] = useState([]);

  useEffect(() => {
    const fetchProveedores = async () => {
      if (window.api && window.api.proveedores) {
        try {
          const res = await window.api.proveedores.obtener();
          if (res.ok) setProveedoresList(res.data.map(p => p.nombre));
        } catch (e) {
          console.error('Error al cargar proveedores:', e);
        }
      }
    };
    if (isOpen) {
      fetchProveedores();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && material) {
      setRender(true);
      setError('');
      
      const currentStockDetails = material.stockDetails || (material.serials || []).map(s => ({
        serial: s,
        proveedor_nombre: 'Proveedor No Especificado',
        estado_material: 'NUEVO'
      }));

      setStockItems(JSON.parse(JSON.stringify(currentStockDetails)));
    }
  }, [isOpen, material]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render || !material) return null;

  const handleFieldChange = (index, field, value) => {
    setError('');
    const updated = [...stockItems];
    updated[index][field] = value;
    setStockItems(updated);
  };

  const handleSubmit = async () => {
    const hayVacios = stockItems.some(item => !item.serial || item.serial.trim() === '');
    if (hayVacios) {
      setError('No puede dejar ningún campo de serial en blanco.');
      return;
    }

    const limpios = stockItems.map(item => item.serial.trim().toUpperCase());
    const unicos = new Set(limpios);
    if (unicos.size !== limpios.length) {
      setError('Existen seriales duplicados en la lista.');
      return;
    }

    try {
      setError('');
      await onSaveSerials(material.code, stockItems);
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
        style={{ width: '650px', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Auditar y Editar Unidades Físicas</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Material: <strong>{material.code}</strong> — {material.desc}
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
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Modifique el serial, asigne el proveedor correcto o actualice el estado físico de la unidad:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
            {stockItems.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 1.2fr 0.8fr', 
                  gap: '8px', 
                  background: 'var(--bg-main)', 
                  padding: '10px', 
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label style={{ fontSize: '10px' }}>Serial Físico</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <MdQrCode2 size={16} color="var(--pdvsa-red)" style={{ flexShrink: 0 }} />
                     <input 
                       type="text" 
                       className={styles.input} 
                       value={item.serial} 
                       onChange={(e) => handleFieldChange(idx, 'serial', e.target.value)}
                       placeholder={`Serial #${idx + 1}`}
                     />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label style={{ fontSize: '10px' }}>Proveedor Asignado</label>
                  <input
                    list={`prov-list-${idx}`}
                    className={styles.input}
                    value={item.proveedor_nombre}
                    onChange={(e) => handleFieldChange(idx, 'proveedor_nombre', e.target.value)}
                    placeholder="Escriba o seleccione..."
                  />
                  <datalist id={`prov-list-${idx}`}>
                    {proveedoresList.map(p => (
                       <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>

                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label style={{ fontSize: '10px' }}>Condición</label>
                  <select 
                    className={styles.select}
                    value={item.estado_material}
                    onChange={(e) => handleFieldChange(idx, 'estado_material', e.target.value)}
                  >
                    <option value="NUEVO">Nuevo</option>
                    <option value="REPARADO">Reparado</option>
                    <option value="DAÑADO">Dañado</option>
                  </select>
                </div>

              </div>
            ))}
            {stockItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Este material no tiene stock físico disponible para auditar.
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className={styles.floatingToast}>
            <MdErrorOutline size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
            <button 
              type="button" 
              className={styles.toastCloseBtn} 
              onClick={() => setError('')}
            >
              <MdClose size={18} />
            </button>
          </div>
        )}

        <div className={styles.footer}>
          <button 
            className={styles.btnSecondary} 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className={styles.btnPrimary} 
            onClick={handleSubmit}
          >
            Guardar Auditoría
          </button>
        </div>
      </div>
    </div>
  );
};