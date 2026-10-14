import React, { useState, useEffect, useRef } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdQrCode2, MdErrorOutline } from 'react-icons/md';

export const ExitModal = ({ isOpen, onClose, materiales = [], onSave, onViewSerials }) => {
  const [render, setRender] = useState(isOpen);
  const [fecha, setFecha] = useState('');
  const [trabajador, setTrabajador] = useState('');
  const [aprobadoPor, setAprobadoPor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [items, setItems] = useState([{ code: '', qty: 1, serials: [''] }]);
  const [error, setError] = useState('');
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setRender(true);
      setError('');
      setFecha(new Date().toISOString().split('T')[0]);
      setTrabajador('');
      setAprobadoPor('');
      setMotivo('');
      const defaultCode = materiales.length > 0 ? materiales[0].code : '';
      setItems([{ code: defaultCode, qty: 1, serials: [''] }]);
    }
    wasOpen.current = isOpen;
  }, [isOpen, materiales]);

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

  const handleCodeChange = (index, newCode) => {
    setError('');
    const newItems = [...items];
    newItems[index].code = newCode;
    newItems[index].serials = Array(newItems[index].qty).fill('');
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
    if (!fecha) return 'Debe seleccionar la fecha de salida.';
    if (!trabajador.trim()) return 'Debe ingresar los datos del trabajador receptor.';
    if (!aprobadoPor.trim()) return 'Debe indicar quién aprobó la salida.';

    const todosLosSeriales = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const num = i + 1;

      if (!it.code || !it.code.trim()) {
        return `Material #${num}: Seleccione un material o elimine el bloque con Quitar.`;
      }

      const matObj = materiales.find((m) => m.code === it.code);
      if (!matObj) {
        return `Material #${num}: El material seleccionado no es válido.`;
      }

      if (!it.qty || it.qty <= 0) {
        return `Material #${num} (${it.code}): La cantidad debe ser mayor a 0.`;
      }

      if (it.qty > matObj.stock) {
        return `Material #${num} (${it.code}): Stock insuficiente (Disponible: ${matObj.stock}).`;
      }

      for (let s = 0; s < it.serials.length; s++) {
        const valorSerial = (it.serials[s] || '').trim();
        if (!valorSerial) {
          return `Material #${num} (${it.code}): El Serial #${s + 1} está en blanco. Complételo o quite el material.`;
        }

        const upper = valorSerial.toUpperCase();
        if (todosLosSeriales.includes(upper)) {
          return `El serial "${valorSerial}" está repetido dos veces en esta salida.`;
        }
        todosLosSeriales.push(upper);

        const existeEnInventario = (matObj.serials || []).some(
          (disp) => disp.toUpperCase() === upper
        );
        if (!existeEnInventario) {
          return `Material #${num} (${it.code}): El serial "${valorSerial}" no pertenece al stock actual.`;
        }
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
      await onSave({ fecha, trabajador, aprobadoPor, items, motivo });
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
          <div className={styles.title}>Registrar Salida de Material</div>
          <button className={styles.closeBtn} onClick={onClose}><MdClose size={24} /></button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label>Fecha de Salida</label>
            <input 
              type="date" 
              className={styles.input} 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Datos del Trabajador (Receptor)</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Nombre / Ficha del trabajador" 
              value={trabajador}
              onChange={(e) => setTrabajador(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Aprobado Por</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Supervisor / Gerente" 
              value={aprobadoPor}
              onChange={(e) => setAprobadoPor(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Material a Retirar</label>
            {items.map((item, index) => {
              const selectedMat = materiales.find((m) => m.code === item.code);
              const availableSerials = selectedMat?.serials || [];

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
                            {m.code} - {m.desc} (Disp: {m.stock})
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
                        max={selectedMat?.stock || 999}
                        onChange={(e) => handleQtyChange(index, e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  {selectedMat && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--pdvsa-red)', fontWeight: '600' }}>
                        Seriales Exactos a Retirar ({item.qty}):
                      </span>
                      <button 
                        type="button" 
                        className={styles.viewSerialsBtn}
                        onClick={() => onViewSerials && onViewSerials(selectedMat)}
                      >
                        <MdQrCode2 size={14} />
                        Ver seriales ({availableSerials.length})
                      </button>
                    </div>
                  )}

                  {item.qty > 0 && (
                    <>
                      <datalist id={`serials-list-${index}`}>
                        {availableSerials.map((s, idx) => (
                          <option key={idx} value={s} />
                        ))}
                      </datalist>
                      <div className={styles.serialGrid}>
                        {item.serials.map((serial, sIndex) => (
                          <input 
                            key={sIndex}
                            type="text" 
                            list={`serials-list-${index}`}
                            className={styles.input} 
                            placeholder={`Serial #${sIndex + 1}`}
                            value={serial}
                            onChange={(e) => handleSerialChange(index, sIndex, e.target.value)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <button 
              type="button" 
              onClick={addItem} 
              style={{ background: 'none', border: 'none', color: 'var(--active-text)', fontWeight: '600', cursor: 'pointer', textAlign: 'left', marginTop: '5px' }}
            >
              + Añadir otro material
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Motivo / Orden de Trabajo</label>
            <textarea 
              className={styles.textarea} 
              rows="3" 
              placeholder="OT-2026-890..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            ></textarea>
          </div>
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
          <button className={styles.btnPrimary} onClick={handleSubmit}>Registrar Salida</button>
        </div>
      </div>
    </div>
  );
};