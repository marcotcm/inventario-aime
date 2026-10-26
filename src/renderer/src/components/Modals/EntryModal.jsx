import React, { useState, useEffect, useRef } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdQrCode2, MdErrorOutline, MdAdd, MdBusiness } from 'react-icons/md';

export const EntryModal = ({ 
  isOpen, 
  onClose, 
  materiales = [], 
  onSave, 
  onViewSerials 
}) => {
  const [render, setRender] = useState(isOpen);
  const [modo, setModo] = useState('ENTRADA'); // 'ENTRADA' | 'PEDIDO'
  const [fecha, setFecha] = useState('');
  const [ordenNumero, setOrdenNumero] = useState('');
  const [factura, setFactura] = useState('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState([
    { 
      code: '', 
      qty_solicitada: 1, 
      qty_recibida: 1, 
      proveedor: '', 
      estadoMaterial: 'NUEVO', 
      serials: [''] 
    }
  ]);
  const [error, setError] = useState('');
  
  const [proveedoresList, setProveedoresList] = useState([]);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  
  const dropdownRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const fetchProveedores = async () => {
      if (window.api && window.api.proveedores) {
        try {
          const res = await window.api.proveedores.obtener();
          if (res.ok) setProveedoresList(res.data);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchProveedores();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setRender(true);
      setError('');
      setModo('ENTRADA');
      setFecha(new Date().toISOString().split('T')[0]);
      setOrdenNumero('');
      setFactura('');
      setNotas('');
      setActiveDropdownIndex(null);
      
      const defaultCode = materiales.length > 0 ? materiales[0].code : '';
      setItems([{ 
        code: defaultCode, 
        qty_solicitada: 1, 
        qty_recibida: 1, 
        proveedor: '', 
        estadoMaterial: 'NUEVO', 
        serials: [''] 
      }]);
    }
    wasOpen.current = isOpen;
  }, [isOpen, materiales]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  const handleModoChange = (nuevoModo) => {
    setModo(nuevoModo);
    setError('');
    if (nuevoModo === 'PEDIDO') {
      const newItems = items.map(it => ({ ...it, qty_recibida: 0, serials: [] }));
      setItems(newItems);
    } else {
      const newItems = items.map(it => {
         const recv = it.qty_solicitada || 1;
         return { ...it, qty_recibida: recv, serials: Array(recv).fill('') };
      });
      setItems(newItems);
    }
  };

  const updateItem = (index, field, value) => {
    setError('');
    const newItems = [...items];

    if (field === 'qty_solicitada' || field === 'qty_recibida') {
      if (value === '') {
        newItems[index][field] = '';
        if (field === 'qty_solicitada' && modo === 'ENTRADA') {
          newItems[index].qty_recibida = '';
          newItems[index].serials = [];
        } else if (field === 'qty_recibida') {
          newItems[index].serials = [];
        }
      } else {
        let numVal = parseInt(value, 10);
        if (isNaN(numVal)) return;

        newItems[index][field] = numVal;

        if (field === 'qty_solicitada' && modo === 'ENTRADA') {
          newItems[index].qty_recibida = numVal;
          newItems[index].serials = Array(numVal).fill('');
        } else if (field === 'qty_recibida') {
          const currentSerials = newItems[index].serials || [];
          if (numVal > currentSerials.length) {
            newItems[index].serials = [...currentSerials, ...Array(numVal - currentSerials.length).fill('')];
          } else {
            newItems[index].serials = currentSerials.slice(0, numVal);
          }
        }
      }
    } else {
      newItems[index][field] = value;
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
      { 
        code: defaultCode, 
        qty_solicitada: 1, 
        qty_recibida: modo === 'ENTRADA' ? 1 : 0, 
        proveedor: '', 
        estadoMaterial: 'NUEVO', 
        serials: modo === 'ENTRADA' ? [''] : [] 
      }
    ]);
  };

  const removeItem = (indexToRemove) => {
    if (items.length <= 1) return;
    setError('');
    setItems(items.filter((_, idx) => idx !== indexToRemove));
  };

  const selectProvider = (index, name) => {
    updateItem(index, 'proveedor', name);
    setActiveDropdownIndex(null);
  };

  const addNewProvider = async (index, name) => {
    if (!name.trim()) return;

    try {
      if (window.api && window.api.proveedores) {
        await window.api.proveedores.crear({ 
          nombre: name.trim(), 
          rif: '', 
          telefono: '' 
        });
        const res = await window.api.proveedores.obtener();
        if (res.ok) setProveedoresList(res.data);
      }
      selectProvider(index, name.trim());
    } catch (e) {
      setError('Error al crear proveedor: ' + e.message);
    }
  };

  const validarFormulario = () => {
    if (!fecha) return 'Debe seleccionar la fecha.';
    if (modo === 'ENTRADA' && !factura.trim()) return 'El Nro. de Referencia/Factura es obligatorio para entradas.';
    
    const todosLosSeriales = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const num = i + 1;

      if (!it.code || !it.code.trim()) return `Material #${num}: Seleccione un material.`;
      if (!it.proveedor.trim()) return `Material #${num}: Seleccione un proveedor.`;
      if (it.qty_solicitada === '' || it.qty_solicitada <= 0) return `Material #${num}: La cantidad solicitada debe ser > 0.`;
      
      if (modo === 'ENTRADA' && (it.qty_recibida === '' || it.qty_recibida <= 0)) {
        return `Material #${num}: Para registrar una entrada, la cantidad recibida debe ser mayor a 0.`;
      }
      if (it.qty_recibida > it.qty_solicitada) {
        return `Material #${num}: No puede recibir más de lo solicitado.`;
      }

      if (it.qty_recibida > 0) {
        for (let s = 0; s < it.qty_recibida; s++) {
          const valorSerial = (it.serials[s] || '').trim();
          if (!valorSerial) return `Material #${num}: El Serial #${s + 1} está en blanco.`;
          
          const upper = valorSerial.toUpperCase();
          if (todosLosSeriales.includes(upper)) return `El serial "${valorSerial}" está repetido en este formulario.`;
          todosLosSeriales.push(upper);
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
      await onSave({ 
        fecha, 
        ordenNumero, 
        factura: factura || 'N/A', 
        items, 
        notas 
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
          <div className={styles.title}>Registrar Entrada / Orden de Compra</div>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
          >
            <MdClose size={24} />
          </button>
        </div>
        
        <div className={styles.body}>

          <div className={styles.modoButtonGroup}>
            <button 
              type="button"
              className={`${styles.modoBtn} ${modo === 'ENTRADA' ? styles.modoBtnActive : ''}`}
              onClick={() => handleModoChange('ENTRADA')}
            >
              Modo Entrada (Recepción Física)
            </button>
            <button 
              type="button"
              className={`${styles.modoBtn} ${modo === 'PEDIDO' ? styles.modoBtnActive : ''}`}
              onClick={() => handleModoChange('PEDIDO')}
            >
              Modo Nuevo Pedido (Sin Recepción)
            </button>
          </div>

          <div className={styles.modoExplanationBox}>
            {modo === 'ENTRADA' ? (
              <span className={styles.modoExplanationText}>
                <strong>Modo Entrada:</strong> Es una entrada de material existente. Si quedan pendientes unidades por llegar (Cant. Recibida &lt; Cant. Solicitada), se convertirá en un pedido incompleto y se podrá visualizar en el módulo de Pedidos. Si es una entrada normal, se visualizará en pedidos como pedido completo y el stock se sumará al inventario.
              </span>
            ) : (
              <span className={styles.modoExplanationText}>
                <strong>Modo Pedido:</strong> Es solo un pedido en cero unidades recibidas. Se visualizará en el módulo de Pedidos para su posterior seguimiento y recepción. No sumará stock al inventario inmediatamente.
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className={styles.formGroup}>
              <label>Fecha</label>
              <input 
                type="date" 
                className={styles.input} 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)} 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Nro. Orden (Opcional)</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Ej. 0061332133" 
                value={ordenNumero} 
                onChange={(e) => setOrdenNumero(e.target.value)} 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Nro. Referencia/Factura {modo === 'PEDIDO' && '(Opcional)'}</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ej. F-00928" 
              value={factura} 
              onChange={(e) => setFactura(e.target.value)} 
            />
          </div>

          <div className={styles.separator}></div>
          
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>
            Detalles de la Transacción
          </label>

          {items.map((item, index) => {
            const filteredProviders = proveedoresList.filter(p => 
              p.nombre.toLowerCase().includes(item.proveedor.toLowerCase())
            );
            const selectedMat = materiales.find((m) => m.code === item.code);

            return (
              <div 
                key={index} 
                className={styles.dynamicItem} 
                style={{ 
                  borderLeft: (item.qty_recibida || 0) < (item.qty_solicitada || 0) 
                    ? '3px solid #f59e0b' 
                    : '3px solid #22c55e' 
                }}
              >
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
                    onChange={(e) => updateItem(index, 'code', e.target.value)}
                  >
                    <option value="">-- Seleccione Material --</option>
                    {materiales.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.code} - {m.desc}
                      </option>
                    ))}
                  </select>
                  {selectedMat && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '4px' }}>
                      <strong>Marca:</strong> {selectedMat.marca} | <strong>Modelo:</strong> {selectedMat.modelo}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginBottom: '10px' }} ref={dropdownRef}>
                  <div className={styles.formGroup} style={{ position: 'relative' }}>
                    <label>Proveedor</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Buscar o crear..." 
                      value={item.proveedor}
                      onFocus={() => setActiveDropdownIndex(index)}
                      onChange={(e) => {
                        updateItem(index, 'proveedor', e.target.value);
                        setActiveDropdownIndex(index);
                      }}
                    />
                    
                    {activeDropdownIndex === index && (
                      <div 
                        className={styles.dropdownMenu} 
                        style={{ 
                          position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 10,
                          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px',
                          maxHeight: '200px', overflowY: 'auto', marginTop: '4px', padding: '4px'
                        }}
                      >
                        {filteredProviders.length > 0 ? (
                          filteredProviders.map(p => (
                            <button 
                              key={p.id} 
                              type="button" 
                              className={styles.dropdownItem} 
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                width: '100%', textAlign: 'left', borderRadius: '4px', border: 'none',
                                background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px'
                              }}
                              onClick={() => selectProvider(index, p.nombre)}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <MdBusiness size={16} color="var(--text-secondary)" />
                              {p.nombre}
                            </button>
                          ))
                        ) : (
                          <button 
                            type="button" 
                            className={styles.dropdownItem} 
                            onClick={() => addNewProvider(index, item.proveedor)} 
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                              width: '100%', textAlign: 'left', borderRadius: '4px', border: 'none',
                              background: 'rgba(211, 47, 47, 0.05)', color: 'var(--pdvsa-red)', cursor: 'pointer',
                              fontWeight: '600', fontSize: '13px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.05)'}
                          >
                            <MdAdd size={16} /> Registrar nuevo: "{item.proveedor}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Estado</label>
                    <select 
                      className={styles.select} 
                      value={item.estadoMaterial} 
                      onChange={(e) => updateItem(index, 'estadoMaterial', e.target.value)}
                    >
                      <option value="NUEVO">Nuevo</option>
                      <option value="REPARADO">Reparado</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-card)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div className={styles.formGroup}>
                    <label>Cant. Solicitada</label>
                    <input 
                      type="number" 
                      className={styles.input} 
                      min="1" 
                      value={item.qty_solicitada} 
                      onChange={(e) => updateItem(index, 'qty_solicitada', e.target.value)} 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Cant. Recibida {modo === 'PEDIDO' && '(Bloqueado)'}</label>
                    <input 
                      type="number" 
                      className={styles.input} 
                      min="0" 
                      max={item.qty_solicitada} 
                      value={item.qty_recibida} 
                      disabled={modo === 'PEDIDO'}
                      onChange={(e) => updateItem(index, 'qty_recibida', e.target.value)} 
                    />
                  </div>
                </div>

                {(item.qty_recibida || 0) < (item.qty_solicitada || 0) && (item.qty_solicitada || 0) > 0 && (
                   <div style={{ fontSize: '11px', color: '#b45309', marginTop: '6px', fontWeight: 'bold' }}>
                     * Quedarán {(item.qty_solicitada || 0) - (item.qty_recibida || 0)} unidades pendientes en un nuevo Pedido Activo.
                   </div>
                )}
                
                {(item.qty_recibida || 0) > 0 && (
                  <div className={styles.serialGrid} style={{ marginTop: '10px' }}>
                    {item.serials.map((serial, sIndex) => (
                      <input 
                        key={sIndex}
                        type="text" 
                        className={styles.input} 
                        placeholder={`Serial Físico Recibido #${sIndex + 1}`}
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
            + Añadir otro material a la guía
          </button>

          <div className={styles.separator}></div>
          <div className={styles.formGroup}>
            <label>Notas Adicionales</label>
            <textarea 
              className={styles.textarea} 
              rows="2" 
              value={notas} 
              onChange={(e) => setNotas(e.target.value)}
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
            style={{ background: '#84CC16', color: '#1A2E05', borderColor: '#84CC16' }} 
            onClick={handleSubmit}
          >
            Procesar Transacción
          </button>
        </div>
      </div>
    </div>
  );
};