// src/renderer/src/components/Modals/NewMaterialModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdErrorOutline, MdCloudUpload, MdAdd, MdBusiness } from 'react-icons/md';

export const NewMaterialModal = ({ isOpen, onClose, onSave }) => {
  const [render, setRender] = useState(isOpen);
  const [modo, setModo] = useState('ENTRADA'); 
  
  const [formData, setFormData] = useState({
    code: '',
    nombre: '',
    descripcion: '',
    marca: '',
    modelo: '',
    departamento: 'AIT',
    cat: 'Tubería',
    loc: '',
    unit: 'UND',
    proveedor: '',
    receptor: '',
    estadoMaterial: 'NUEVO',
    foto: null,
    qty_solicitada: 1,
    qty_recibida: 1,
    min: 5,
    serials: ['']
  });
  
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const wasOpen = useRef(false);

  const [proveedoresList, setProveedoresList] = useState([]);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');
  
  useEffect(() => {
    const fetchProveedores = async () => {
      if (window.api && window.api.proveedores) {
        try {
          const res = await window.api.proveedores.obtener();
          if (res.ok) setProveedoresList(res.data);
        } catch (e) {
          console.error('Error cargando proveedores:', e);
        }
      }
    };
    fetchProveedores();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProviderDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setRender(true);
      setError('');
      setPreviewImage(null);
      setProviderSearch('');
      setShowProviderDropdown(false);
      setModo('ENTRADA');
      setFormData({
        code: '',
        nombre: '',
        descripcion: '',
        marca: '',
        modelo: '',
        departamento: 'AIT',
        cat: 'Tubería',
        loc: '',
        unit: 'UND',
        proveedor: '',
        receptor: '',
        estadoMaterial: 'NUEVO',
        foto: null,
        qty_solicitada: 1,
        qty_recibida: 1,
        min: 5,
        serials: ['']
      });
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  const handleModoChange = (nuevoModo) => {
    setModo(nuevoModo);
    setError('');
    if (nuevoModo === 'PEDIDO') {
      setFormData({ ...formData, qty_recibida: 0, serials: [] });
    } else {
      const sol = formData.qty_solicitada || 1;
      setFormData({ ...formData, qty_recibida: sol, serials: Array(sol).fill('') });
    }
  };

  const handleQtySolicitadaChange = (val) => {
    setError('');
    if (val === '') {
      if (modo === 'ENTRADA') {
        setFormData({ ...formData, qty_solicitada: '', qty_recibida: '', serials: [] });
      } else {
        setFormData({ ...formData, qty_solicitada: '' });
      }
      return;
    }
    const sol = parseInt(val, 10);
    if (isNaN(sol)) return;

    if (modo === 'ENTRADA') {
      setFormData({ ...formData, qty_solicitada: sol, qty_recibida: sol, serials: Array(sol).fill('') });
    } else {
      setFormData({ ...formData, qty_solicitada: sol });
    }
  };

  const handleQtyRecibidaChange = (val) => {
    setError('');
    if (val === '') {
      setFormData({ ...formData, qty_recibida: '', serials: [] });
      return;
    }
    const qty = parseInt(val, 10);
    if (isNaN(qty)) return;

    const currentSerials = formData.serials || [];
    setFormData({ 
      ...formData, 
      qty_recibida: qty, 
      serials: qty > currentSerials.length ? [...currentSerials, ...Array(qty - currentSerials.length).fill('')] : currentSerials.slice(0, qty) 
    });
  };

  const handleSerialChange = (index, val) => {
    setError('');
    const updated = [...formData.serials];
    updated[index] = val;
    setFormData({ ...formData, serials: updated });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor seleccione un archivo de imagen válido.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, foto: reader.result }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreviewImage(null);
    setFormData({ ...formData, foto: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectProvider = (name) => {
    setProviderSearch(name);
    setFormData({ ...formData, proveedor: name });
    setShowProviderDropdown(false);
  };

  const addNewProvider = async () => {
    if (!providerSearch.trim()) return;
    const nombreProv = providerSearch.trim();

    try {
      if (window.api && window.api.proveedores) {
        await window.api.proveedores.crear({ 
          nombre: nombreProv, 
          rif: '', 
          telefono: '' 
        });
        
        const res = await window.api.proveedores.obtener();
        if (res.ok) {
          setProveedoresList(res.data);
        }
      }
      selectProvider(nombreProv);
    } catch (e) {
      setError('Error al crear proveedor nuevo: ' + e.message);
    }
  };

  const filteredProviders = proveedoresList.filter(p => 
    p.nombre.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.nombre.trim()) {
      setError('El Código y el Nombre del material son obligatorios.');
      return;
    }
    
    if (formData.qty_solicitada === '' || formData.qty_solicitada <= 0) {
      setError('La cantidad solicitada debe ser válida y mayor a 0.');
      return;
    }

    if (formData.qty_recibida === '' || formData.qty_recibida < 0) {
      setError('La cantidad entrante debe ser válida.');
      return;
    }

    if (formData.qty_solicitada > 0 && !formData.proveedor.trim()) {
      setError('Debe seleccionar o crear un proveedor para el pedido/stock inicial.');
      return;
    }

    if (formData.qty_recibida > formData.qty_solicitada) {
      setError('No puede recibir más de lo solicitado en el lote inicial.');
      return;
    }

    if (formData.qty_recibida > 0) {
      const limpios = formData.serials.map((s) => s.trim());
      const indexVacio = limpios.findIndex((s) => s === '');
      
      if (indexVacio !== -1) {
        setError(`El Serial #${indexVacio + 1} está en blanco. Complételo o reduzca la Cant. Entrante.`);
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
      
      const materialDef = {
        code: formData.code,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        marca: formData.marca,
        modelo: formData.modelo,
        departamento: formData.departamento,
        cat: formData.cat,
        loc: formData.loc,
        unit: formData.unit,
        min: formData.min,
        foto: formData.foto
      };

      const pedidoDef = formData.qty_solicitada > 0 ? {
        fecha: new Date().toISOString().split('T')[0],
        ordenNumero: 'INICIAL-' + Date.now().toString().slice(-6),
        factura: 'N/A',
        notas: 'Registro inicial de stock y catálogo de nuevo material.',
        receptor: formData.receptor,
        items: [
          {
            code: formData.code,
            qty_solicitada: formData.qty_solicitada,
            qty_recibida: formData.qty_recibida,
            proveedor: formData.proveedor,
            estadoMaterial: formData.estadoMaterial,
            serials: formData.serials
          }
        ]
      } : null;

      await onSave({ materialDef, pedidoDef });
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
        style={{ width: '700px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.title}>Registrar Nuevo Material y Configurar Lote Inicial</div>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.body} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Código (Manual)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ej. PM-0080" 
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Departamento</label>
                <select 
                  className={styles.select} 
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                >
                  <option value="AIT">AIT</option>
                  <option value="SCADA">SCADA</option>
                  <option value="TELECOM">TELECOM</option>
                  <option value="MECÁNICA">MECÁNICA</option>
                  <option value="OPERACIONES">OPERACIONES</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Nombre del Material</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder='Ej. Válvula Esférica' 
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Descripción detallada</label>
              <textarea 
                className={styles.textarea} 
                rows="2"
                placeholder='Ej. Válvula de Acero Inoxidable Clase 300...' 
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Marca</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ej. Cisco" 
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Modelo</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ej. Catalyst 2960" 
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ position: 'relative' }} ref={dropdownRef}>
                <label>Proveedor (Asociado al Lote Inicial)</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Escriba para buscar o crear..." 
                  value={providerSearch}
                  onFocus={() => setShowProviderDropdown(true)}
                  onChange={(e) => {
                    setProviderSearch(e.target.value);
                    setFormData({ ...formData, proveedor: e.target.value });
                    setShowProviderDropdown(true);
                  }}
                />
                
                {showProviderDropdown && (
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
                          onClick={() => selectProvider(p.nombre)}
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
                        onClick={addNewProvider} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                          width: '100%', textAlign: 'left', borderRadius: '4px', border: 'none',
                          background: 'rgba(211, 47, 47, 0.05)', color: 'var(--pdvsa-red)', cursor: 'pointer',
                          fontWeight: '600', fontSize: '13px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 47, 47, 0.05)'}
                      >
                        <MdAdd size={16} /> Registrar nuevo: "{providerSearch}"
                      </button>
                    )}
                  </div>
                )}
            </div>
            
            <div className={styles.modoButtonGroup}>
              <button 
                type="button"
                className={`${styles.modoBtn} ${modo === 'ENTRADA' ? styles.modoBtnActive : ''}`}
                onClick={() => handleModoChange('ENTRADA')}
              >
                Entrada Completa
              </button>
              <button 
                type="button"
                className={`${styles.modoBtn} ${modo === 'PEDIDO' ? styles.modoBtnActive : ''}`}
                onClick={() => handleModoChange('PEDIDO')}
              >
                Solo Pedido
              </button>
            </div>
            
            <div className={styles.modoExplanationBox}>
              {modo === 'ENTRADA' ? (
                <span className={styles.modoExplanationText}>
                  <strong>Modo Entrada:</strong> Se registrará el material en el catálogo y las unidades ingresarán directamente al inventario físico disponible. Si recibes menos de lo solicitado, se generará un pedido pendiente automático.
                </span>
              ) : (
                <span className={styles.modoExplanationText}>
                  <strong>Modo Pedido:</strong> Se registrará el material en el catálogo, pero las unidades generarán un Pedido Activo en cantidad 0 recibida para procesarse a futuro en el módulo de Pedidos.
                </span>
              )}
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className={styles.formGroup}>
              <label>Foto del Material</label>
              <div 
                className={styles.imageUploadArea} 
                onClick={() => fileInputRef.current.click()}
                style={{
                    height: '110px', 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-main)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
              >
                {previewImage ? (
                  <>
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                    <button 
                      onClick={removeImage} 
                      style={{ 
                        position: 'absolute', top: '5px', right: '5px', 
                        background: 'rgba(0,0,0,0.6)', color: 'white', 
                        border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' 
                      }}
                    >
                      <MdClose size={14}/>
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    <MdCloudUpload size={32} />
                    <span style={{ fontSize: '11px', marginTop: '5px' }}>Subir Imagen</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageChange}
                />
              </div>
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
                  <option value="Tarjetas">Tarjetas</option>
                  <option value="Bombas">Bombas</option>
                  <option value="Motores">Motores</option>
                  <option value="Equipos Red">Equipos Red</option>
                  <option value="Servidores">Servidores</option>
                </select>
              </div>
              
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Ubicación</label>
                <input 
                  type="text"
                  className={styles.input}
                  placeholder="Ej. Almacén A, Patio..."
                  value={formData.loc}
                  onChange={(e) => setFormData({ ...formData, loc: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-card)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div className={styles.formGroup}>
                <label>Cant. Solicitada</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  min="1"
                  value={formData.qty_solicitada}
                  onChange={(e) => handleQtySolicitadaChange(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Cant. Entrante {modo === 'PEDIDO' && '(Bloqueado)'}</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  min="0"
                  max={formData.qty_solicitada}
                  value={formData.qty_recibida}
                  disabled={modo === 'PEDIDO'}
                  onChange={(e) => handleQtyRecibidaChange(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Receptor (Quién recibe)</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Ej. Almacenista José" 
                value={formData.receptor} 
                onChange={(e) => setFormData({ ...formData, receptor: e.target.value })} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
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
                      <option value="BBL">BBL</option>
                    </select>
                </div>
            </div>
            
          </div>
          
          {(formData.qty_recibida || 0) > 0 && (
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Seriales Físicos Iniciales ({formData.qty_recibida})</label>
              <div className={styles.serialGrid} style={{ maxHeight: '120px', overflowY: 'auto' }}>
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
            Crear Material y Transacción
          </button>
        </div>
      </div>
    </div>
  );
};