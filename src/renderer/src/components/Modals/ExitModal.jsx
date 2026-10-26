import React, { useState, useEffect, useRef } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdQrCode2, MdErrorOutline, MdBusiness } from 'react-icons/md';

export const ExitModal = ({ 
  isOpen, 
  onClose, 
  materiales = [], 
  onSave, 
  onViewSerials 
}) => {
  const [render, setRender] = useState(isOpen);
  const [fecha, setFecha] = useState('');
  const [trabajador, setTrabajador] = useState('');
  const [destino, setDestino] = useState('');
  const [aprobadoPor, setAprobadoPor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [items, setItems] = useState([
    { code: '', qty: 1, proveedor_seleccionado: '', serials: [''] }
  ]);
  const [error, setError] = useState('');
  
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setRender(true);
      setError('');
      setFecha(new Date().toISOString().split('T')[0]);
      setTrabajador('');
      setDestino('');
      setAprobadoPor('');
      setMotivo('');
      
      const defaultCode = materiales.length > 0 ? materiales[0].code : '';
      setItems([{ code: defaultCode, qty: 1, proveedor_seleccionado: '', serials: [''] }]);
    }
    wasOpen.current = isOpen;
  }, [isOpen, materiales]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setRender(false);
    }
  };

  if (!render) return null;

  const handleCodeChange = (index, newCode) => {
    setError('');
    const newItems = [...items];
    newItems[index].code = newCode;
    // Al cambiar de material, reseteamos el proveedor seleccionado
    newItems[index].proveedor_seleccionado = '';
    const startQty = newItems[index].qty || 1;
    newItems[index].serials = Array(startQty).fill('');
    setItems(newItems);
  };

  const handleProviderChange = (index, prov) => {
    const newItems = [...items];
    newItems[index].proveedor_seleccionado = prov;
    // Reseteamos los seriales elegidos porque cambiamos de "lote" de proveedor
    const currentQty = newItems[index].qty || 1;
    newItems[index].serials = Array(currentQty).fill('');
    setItems(newItems);
  };

  const handleQtyChange = (index, val) => {
    setError('');
    const newItems = [...items];
    
    if (val === '') {
      newItems[index].qty = '';
      newItems[index].serials = [];
      setItems(newItems);
      return;
    }
    
    const qty = parseInt(val, 10);
    if (isNaN(qty)) return;
    
    newItems[index].qty = qty;
    
    const currentSerials = newItems[index].serials || [];
    
    if (qty > currentSerials.length) {
      newItems[index].serials = [
        ...currentSerials, 
        ...Array(qty - currentSerials.length).fill('')
      ];
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
    setItems([
      ...items, 
      { code: defaultCode, qty: 1, proveedor_seleccionado: '', serials: [''] }
    ]);
  };

  const removeItem = (indexToRemove) => {
    if (items.length <= 1) return;
    setError('');
    setItems(items.filter((_, idx) => idx !== indexToRemove));
  };

  const validarFormulario = () => {
    if (!fecha) return 'Debe seleccionar la fecha de salida.';
    if (!trabajador.trim()) return 'Debe ingresar los datos del trabajador receptor.';
    if (!destino.trim()) return 'Debe especificar el destino o área donde se instalará el material.';
    if (!aprobadoPor.trim()) return 'Debe indicar quién aprobó la salida.';

    const todosLosSeriales = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const num = i + 1;

      if (!it.code || !it.code.trim()) return `Material #${num}: Seleccione un material o elimine el bloque.`;

      const matObj = materiales.find((m) => m.code === it.code);
      if (!matObj) return `Material #${num}: El material seleccionado no es válido.`;
      
      if (!it.proveedor_seleccionado) return `Material #${num}: Seleccione el Proveedor Origen del cual retirar stock.`;

      if (it.qty === '' || it.qty <= 0) return `Material #${num}: La cantidad debe ser mayor a 0.`;
      
      // Contar cuántos hay disponibles de ESE proveedor en específico
      const disponiblesDelProveedor = (matObj.stockDetails || []).filter(d => d.proveedor_nombre === it.proveedor_seleccionado).length;

      if (it.qty > disponiblesDelProveedor) {
         return `Material #${num} (${it.code}): Stock insuficiente de este proveedor (Disp: ${disponiblesDelProveedor}).`;
      }

      for (let s = 0; s < it.serials.length; s++) {
        const valorSerial = (it.serials[s] || '').trim();
        if (!valorSerial) return `Material #${num}: El Serial #${s + 1} está en blanco.`;

        const upper = valorSerial.toUpperCase();
        if (todosLosSeriales.includes(upper)) return `El serial "${valorSerial}" está repetido en la salida.`;
        todosLosSeriales.push(upper);

        const existeEnInventario = (matObj.stockDetails || []).some(
          (disp) => disp.serial.toUpperCase() === upper && disp.proveedor_nombre === it.proveedor_seleccionado
        );
        
        if (!existeEnInventario) {
          return `Material #${num}: El serial "${valorSerial}" no pertenece al proveedor seleccionado.`;
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

    const trabajadorConDestino = `${trabajador.trim()} (${destino.trim()})`;

    try {
      setError('');
      await onSave({ 
        fecha, 
        trabajador: trabajadorConDestino, 
        aprobadoPor, 
        items, 
        motivo 
      });
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
        style={{ width: '600px' }}
      >
        <div className={styles.header}>
          <div className={styles.title}>Registrar Salida de Material</div>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
          >
            <MdClose size={24} />
          </button>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className={styles.formGroup}>
              <label>Trabajador (Receptor)</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Ficha / Nombre" 
                value={trabajador} 
                onChange={(e) => setTrabajador(e.target.value)} 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Destino / Área</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Ej. Pozo B-21" 
                value={destino} 
                onChange={(e) => setDestino(e.target.value)} 
              />
            </div>
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

          <div className={styles.separator}></div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>
            Materiales a Retirar
          </label>
          
          {items.map((item, index) => {
            const selectedMat = materiales.find((m) => m.code === item.code);
            const allStockDetails = selectedMat?.stockDetails || [];
            
            // Extraer lista única de proveedores que tienen stock de este material
            const proveedoresDisponibles = [...new Set(allStockDetails.map(d => d.proveedor_nombre))];
            
            // Filtrar los seriales que pertenecen SOLO al proveedor seleccionado
            const filteredDetails = allStockDetails.filter(d => d.proveedor_nombre === item.proveedor_seleccionado);

            return (
              <div key={index} className={styles.dynamicItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemBadgeTitle}>Ítem #{index + 1}</span>
                  {items.length > 1 && (
                    <button 
                      type="button" 
                      className={styles.removeItemBtn} 
                      onClick={() => removeItem(index)}
                    >
                      <MdClose size={14} /> Quitar
                    </button>
                  )}
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '10px' }}>
                  <select 
                    className={styles.select} 
                    value={item.code} 
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                  >
                    <option value="">-- Seleccione Material --</option>
                    {materiales.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.code} - {m.desc} (Disp total: {m.stock})
                      </option>
                    ))}
                  </select>
                  {selectedMat && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '4px' }}>
                      <strong>Marca:</strong> {selectedMat.marca} | <strong>Modelo:</strong> {selectedMat.modelo}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div className={styles.formGroup}>
                     <label style={{ color: 'var(--pdvsa-red)' }}>Proveedor Origen</label>
                     <select 
                        className={styles.select}
                        value={item.proveedor_seleccionado}
                        onChange={(e) => handleProviderChange(index, e.target.value)}
                     >
                       <option value="">-- Seleccione Lote --</option>
                       {proveedoresDisponibles.map((p, idx) => (
                         <option key={idx} value={p}>{p}</option>
                       ))}
                     </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Cant. a Retirar</label>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={item.qty} 
                      min="1" 
                      max={filteredDetails.length || 1} 
                      onChange={(e) => handleQtyChange(index, e.target.value)} 
                      disabled={!item.proveedor_seleccionado}
                    />
                  </div>
                </div>
                
                {(item.qty || 0) > 0 && selectedMat && item.proveedor_seleccionado && (
                  <div className={styles.formGroup} style={{ marginTop: '10px', background: 'var(--bg-card)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: 'var(--pdvsa-red)', margin: 0 }}>
                        Seleccione los Seriales ({item.qty}):
                      </label>
                      <button 
                        type="button" 
                        className={styles.viewSerialsBtn}
                        onClick={() => onViewSerials && onViewSerials(selectedMat)}
                      >
                        <MdQrCode2 size={14} />
                        Ver stock
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {item.serials.map((serial, sIndex) => (
                        <select 
                          key={sIndex}
                          className={styles.select}
                          value={serial}
                          onChange={(e) => handleSerialChange(index, sIndex, e.target.value)}
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <option value="">-- Elija un Serial de {item.proveedor_seleccionado} --</option>
                          {filteredDetails.map((det, detIdx) => (
                            <option key={detIdx} value={det.serial}>
                              SN: {det.serial} | Est: {det.estado_material}
                            </option>
                          ))}
                        </select>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <button 
            type="button" 
            onClick={addItem} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--active-text)', 
              fontWeight: '600', 
              cursor: 'pointer', 
              textAlign: 'left', 
              marginTop: '5px' 
            }}
          >
            + Añadir otro material a retirar
          </button>

          <div className={styles.separator}></div>
          
          <div className={styles.formGroup}>
            <label>Motivo / Orden de Trabajo</label>
            <textarea 
              className={styles.textarea} 
              rows="2" 
              placeholder="OT-2026-890..." 
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)}
            />
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
            Registrar Salida
          </button>
        </div>
      </div>
    </div>
  );
};