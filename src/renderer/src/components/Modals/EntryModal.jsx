import React, { useState, useEffect, useRef } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdQrCode2, MdErrorOutline } from 'react-icons/md';

export const EntryModal = ({ isOpen, onClose, materiales = [], onSave, onViewSerials }) => {
  const [render, setRender] = useState(isOpen);
  const [fecha, setFecha] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [factura, setFactura] = useState('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState([{ code: '', qty: 1, serials: [''] }]);
  const [error, setError] = useState('');
  const wasOpen = useRef(false);

  const proveedoresExistentes = [
    'TechSupply CA',
    'Inversiones SCADA C.A.',
    'Telecomunicaciones de Venezuela',
    'Distribuidora AIT',
    'Global Networks',
    'Aceros Monagas',
    'Conexiones Nacionales',
    'Suministros Soldafacil'
  ];

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setRender(true);
      setError('');
      setFecha(new Date().toISOString().split('T')[0]);
      setProveedor('');
      setFactura('');
      setNotas('');
      const defaultCode = materiales.length > 0 ? materiales[0].code : '';
      setItems([{ code: defaultCode, qty: 1, serials: [''] }]);
    }
    wasOpen.current = isOpen;
  }, [isOpen, materiales]);

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

  const handleCodeChange = (index, newCode) => {
    setError('');
    const newItems = [...items];
    newItems[index].code = newCode;
    setItems(newItems);
  };

  const handleQtyChange = (index, newQty) => {
    setError('');
    const qty = Math.max(1, parseInt(newQty) || 1);
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
    setError('');
    const newItems = [...items];
    newItems[itemIndex].serials[serialIndex] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setError('');
    const defaultCode = materiales.length > 0 ? materiales[0].code : '';
    setItems([...items, { code: defaultCode, qty: 1, serials: [''] }]);
  };

  const removeItem = (indexToRemove) => {
    if (items.length <= 1) return;
    setError('');
    setItems(items.filter((_, idx) => idx !== indexToRemove));
  };

  const validarFormulario = () => {
    if (!fecha) return 'Debe seleccionar la fecha de ingreso.';
    if (!proveedor.trim()) return 'Debe seleccionar el proveedor.';
    if (!factura.trim()) return 'Debe ingresar el Nro. de Referencia o Factura.';

    const todosLosSeriales = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const num = i + 1;

      if (!it.code || !it.code.trim()) {
        return `Material #${num}: Seleccione un material o elimine el bloque con Quitar.`;
      }

      if (!it.qty || it.qty <= 0) {
        return `Material #${num} (${it.code}): La cantidad debe ser mayor a 0.`;
      }

      for (let s = 0; s < it.serials.length; s++) {
        const valorSerial = (it.serials[s] || '').trim();
        if (!valorSerial) {
          return `Material #${num} (${it.code}): El Serial #${s + 1} está en blanco. Complételo o quite el material.`;
        }
        const upper = valorSerial.toUpperCase();
        if (todosLosSeriales.includes(upper)) {
          return `El serial "${valorSerial}" está repetido en el formulario.`;
        }
        todosLosSeriales.push(upper);
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const mensajeError = validarFormulario();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    try {
      setError('');
      await onSave({ fecha, proveedor, factura, items, notas });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div 
      className={`${styles.overlay} ${!isOpen ? styles.overlayExit : ''}`} 
      onClick={onClose} 
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        className={`${styles.sidePanel} ${!isOpen ? styles.sidePanelExit : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.title}>Registrar Nueva Entrada</div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label>Fecha de Ingreso</label>
            <input 
              type="date" 
              className={styles.input} 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Proveedor</label>
            <select 
              className={styles.select} 
              value={proveedor} 
              onChange={(e) => setProveedor(e.target.value)}
            >
              <option value="">Seleccione un proveedor registrado...</option>
              {proveedoresExistentes.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', display: 'block', lineHeight: '1.4' }}>
              * Si desea incluir un proveedor distinto o un material que no existe, cierre esta ventana y use la opción <b>"Nuevo Material"</b>.
            </span>
          </div>

          <div className={styles.formGroup}>
            <label>Nro. Referencia/Factura (Manual)</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ej. F-00928" 
              value={factura}
              onChange={(e) => setFactura(e.target.value)}
            />
          </div>

          <div className={styles.separator}></div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>Lista de Materiales a Ingresar</label>

          {items.map((item, index) => {
            const selectedMat = materiales.find((m) => m.code === item.code);

            return (
              <div key={index} className={styles.dynamicItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemBadgeTitle}>Material #{index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => removeItem(index)}
                      title="Quitar este material"
                    >
                      <MdClose size={14} /> Quitar
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ flex: 2 }}>
                    <select 
                      className={styles.select}
                      value={item.code}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                    >
                      <option value="">-- Seleccione Material --</option>
                      {materiales.map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.code} - {m.desc} (Stock: {m.stock})
                        </option>
                      ))}
                    </select>
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

                {selectedMat && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Nuevos Seriales a Ingresar ({item.qty}):
                    </span>
                    <button 
                      type="button" 
                      className={styles.viewSerialsBtn}
                      onClick={() => onViewSerials && onViewSerials(selectedMat)}
                    >
                      <MdQrCode2 size={14} />
                      Ver seriales ({selectedMat.serials?.length || 0})
                    </button>
                  </div>
                )}
                
                {item.qty > 0 && (
                  <div className={styles.serialGrid}>
                    {item.serials.map((serial, sIndex) => (
                      <input 
                        key={sIndex}
                        type="text" 
                        className={styles.input} 
                        placeholder={`Nuevo Serial #${sIndex + 1}`}
                        value={serial}
                        onChange={(e) => handleSerialChange(index, sIndex, e.target.value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button 
            type="button" 
            onClick={addItem} 
            style={{ background: 'none', border: 'none', color: 'var(--active-text)', fontWeight: '600', cursor: 'pointer', textAlign: 'left', marginTop: '5px' }}
          >
            + Añadir otro material a la guía
          </button>

          <div className={styles.separator}></div>
          <div className={styles.formGroup}>
            <label>Notas Adicionales (Opcional)</label>
            <textarea 
              className={styles.textarea} 
              rows="3" 
              placeholder="Observaciones de la entrada..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            ></textarea>
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
          <button className={styles.btnPrimary} style={{ background: '#84CC16', color: '#1A2E05', borderColor: '#84CC16' }} onClick={handleSubmit}>Guardar Entrada</button>
        </div>
      </div>
    </div>
  );
};