// src/renderer/src/components/Modals/ReceiveModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdErrorOutline } from 'react-icons/md';

export const ReceiveModal = ({ isOpen, onClose, fila, onSave }) => {
  const [render, setRender] = useState(isOpen);
  const [nuevaCantidad, setNuevaCantidad] = useState(1);
  const [seriales, setSeriales] = useState(['']);
  const [receptor, setReceptor] = useState('');
  const [fechaRecepcion, setFechaRecepcion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && fila) {
      setRender(true);
      setError('');
      setNuevaCantidad(1);
      setSeriales(['']);
      setReceptor('');
      setFechaRecepcion(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, fila]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render || !fila) return null;

  const faltante = fila.qty_solicitada - (fila.totalRecibidoGlobalDelCodigo ?? fila.qty_recibida);

  const handleQtyChange = (val) => {
    setError('');
    if (val === '') {
      setNuevaCantidad('');
      setSeriales([]);
      return;
    }

    let qty = parseInt(val, 10);
    if (isNaN(qty)) return;
    
    if (qty > faltante) qty = faltante;

    setNuevaCantidad(qty);

    if (qty > seriales.length) {
      setSeriales([...seriales, ...Array(qty - seriales.length).fill('')]);
    } else {
      setSeriales(seriales.slice(0, qty));
    }
  };

  const handleSerialChange = (index, value) => {
    setError('');
    const nuevos = [...seriales];
    nuevos[index] = value;
    setSeriales(nuevos);
  };

  const handleSubmit = async () => {
    if (nuevaCantidad === '' || nuevaCantidad <= 0) {
      setError('Debe ingresar una cantidad válida mayor a 0.');
      return;
    }
    
    if (!receptor.trim()) {
      setError('Debe indicar quién recibe el material.');
      return;
    }
    
    if (!fechaRecepcion) {
      setError('Debe seleccionar la fecha de recepción.');
      return;
    }

    const limpios = seriales.map(s => s.trim());
    
    if (limpios.some(s => s === '')) {
      setError('No puede dejar campos de seriales en blanco.');
      return;
    }

    const unicos = new Set(limpios.map(s => s.toUpperCase()));
    if (unicos.size !== limpios.length) {
      setError('Existen seriales repetidos en la lista.');
      return;
    }

    try {
      setError('');
      await onSave({
        pedidoId: fila.pedido_id,
        code: fila.code,
        cantidadRecibida: nuevaCantidad,
        seriales: limpios,
        receptor: receptor.trim(),
        fechaRecepcion
      });
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
      style={{ zIndex: 1100 }}
    >
      <div 
        className={`${styles.centerModal} ${!isOpen ? styles.centerModalExit : ''}`} 
        style={{ width: '550px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Recepción de Material ({fila.code})</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Orden Asociada: <strong>{fila.ordenNumero}</strong> | Proveedor: {fila.proveedorGeneral}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div style={{ background: 'rgba(211, 47, 47, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(211, 47, 47, 0.2)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            Material: <strong>{fila.material_nombre}</strong> (Marca: {fila.material_marca} / Modelo: {fila.material_modelo})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '15px' }}>
            <div className={styles.formGroup}>
              <label>Cant. Solicitada</label>
              <input type="text" className={styles.input} disabled value={`${fila.qty_solicitada} ${fila.unit}`} style={{ fontWeight: 'bold' }} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Total Previo Recibido</label>
              <input type="text" className={styles.input} disabled value={`${fila.totalRecibidoGlobalDelCodigo ?? fila.qty_recibida} ${fila.unit}`} />
            </div>

            <div className={styles.formGroup}>
              <label style={{ color: 'var(--pdvsa-red)' }}>Recibir Ahora</label>
              <input 
                type="number" 
                className={styles.input} 
                min="1" 
                max={faltante} 
                value={nuevaCantidad} 
                onChange={(e) => handleQtyChange(e.target.value)} 
                style={{ borderColor: 'var(--pdvsa-red)', fontWeight: 'bold', color: 'var(--pdvsa-red)' }}
              />
            </div>
          </div>

          {faltante > 0 && (
            <div style={{ fontSize: '11px', color: '#b45309', marginBottom: '15px', fontWeight: 'bold' }}>
              * Quedarán {faltante - (nuevaCantidad || 0)} unidades pendientes de esta partida.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
             <div className={styles.formGroup}>
               <label>Fecha de Recepción</label>
               <input 
                 type="date" 
                 className={styles.input} 
                 value={fechaRecepcion} 
                 onChange={(e) => setFechaRecepcion(e.target.value)} 
               />
             </div>
             <div className={styles.formGroup}>
               <label>Receptor (Quién recibe)</label>
               <input 
                 type="text" 
                 className={styles.input} 
                 placeholder="Ej. Almacenista José" 
                 value={receptor} 
                 onChange={(e) => setReceptor(e.target.value)} 
               />
             </div>
          </div>

          <div className={styles.formGroup}>
            <label>Seriales Físicos Entrantes ({nuevaCantidad || 0})</label>
            <div className={styles.serialGrid} style={{ maxHeight: '140px', overflowY: 'auto', marginTop: '5px' }}>
              {seriales.map((s, idx) => (
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
        </div>

        {error && (
          <div className={styles.floatingToast}>
            <MdErrorOutline size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
            <button className={styles.toastCloseBtn} onClick={() => setError('')}><MdClose size={18} /></button>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.btnPrimary} style={{ background: '#84CC16', color: '#1A2E05', borderColor: '#84CC16' }} onClick={handleSubmit}>
            Confirmar Recepción
          </button>
        </div>
      </div>
    </div>
  );
};