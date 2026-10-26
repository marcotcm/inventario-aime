import React, { useState, useEffect, useRef } from 'react';
import styles from './Modals.module.css';
import { MdClose, MdErrorOutline, MdCloudUpload, MdQrCode2 } from 'react-icons/md';
import { EditSerialsModal } from './EditSerialsModal';

export const EditMaterialModal = ({ 
  isOpen, 
  onClose, 
  material, 
  onSave, 
  onSaveSerials 
}) => {
  const [render, setRender] = useState(isOpen);
  const [isSerialsModalOpen, setIsSerialsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    desc: '',
    marca: '',
    modelo: '',
    departamento: 'AIT',
    cat: 'Tubería',
    loc: 'Almacén A',
    unit: 'UND',
    min: 5,
    foto: null
  });
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && material) {
      setRender(true);
      setError('');
      setFormData({
        code: material.code || '',
        desc: material.desc || '',
        marca: material.marca || '',
        modelo: material.modelo || '',
        departamento: material.departamento || 'AIT',
        cat: material.cat || 'Tubería',
        loc: material.loc || 'Almacén A',
        unit: material.unit || 'UND',
        min: material.min || 5,
        foto: material.foto || null
      });
      setPreviewImage(material.foto || null);
    }
  }, [isOpen, material]);

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

  if (!render || !material) return null;

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.desc.trim()) {
      setError('La descripción del material es obligatoria.');
      return;
    }

    try {
      setError('');
      await onSave(material.code, formData);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div 
        className={`${styles.overlay} ${styles.overlayCenter} ${!isOpen ? styles.overlayExit : ''}`} 
        onClick={onClose}
        onAnimationEnd={handleAnimationEnd}
      >
        <div 
          className={`${styles.centerModal} ${!isOpen ? styles.centerModalExit : ''}`} 
          style={{ width: '650px', maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <div className={styles.title}>Editar Material ({material.code})</div>
            <button 
              className={styles.closeBtn} 
              onClick={onClose}
            >
              <MdClose size={24} />
            </button>
          </div>

          <div className={styles.body} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
            
            {/* Columna Izquierda: Datos del Material */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Código (No Modificable)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.code} 
                    disabled 
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
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
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Descripción del Material</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Marca</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />
                </div>
                
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Modelo</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  />
                </div>
              </div>

              {/* Botón para abrir el modal de edición de seriales individuales */}
              <div className={styles.formGroup} style={{ marginTop: '5px' }}>
                <label>Gestión de Unidades Físicas</label>
                <button 
                  type="button"
                  className={styles.viewSerialsBtn}
                  style={{ padding: '10px', justifyContent: 'center', fontWeight: 'bold' }}
                  onClick={() => setIsSerialsModalOpen(true)}
                >
                  <MdQrCode2 size={18} />
                  Editar seriales individuales ({material.serials?.length || 0})
                </button>
              </div>

            </div>

            {/* Columna Derecha: Foto, Categoría y Configuración de Stock */}
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
                          position: 'absolute', 
                          top: '5px', 
                          right: '5px', 
                          background: 'rgba(0,0,0,0.6)', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '50%', 
                          padding: '4px', 
                          cursor: 'pointer' 
                        }}
                      >
                        <MdClose size={14}/>
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                      <MdCloudUpload size={32} />
                      <span style={{ fontSize: '11px', marginTop: '5px' }}>Cambiar Imagen</span>
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

              <div className={styles.formGroup}>
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
                  <option value="Fuentes">Fuentes</option>
                  <option value="Controladores">Controladores</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Cables">Cables</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="Servidores">Servidores</option>
                  <option value="Equipos de Cómputo">Equipos de Cómputo</option>
                  <option value="Pantallas">Pantallas</option>
                  <option value="Software">Software</option>
                  <option value="Comunicaciones">Comunicaciones</option>
                  <option value="Energía">Energía</option>
                  <option value="Almacenamiento">Almacenamiento</option>
                  <option value="Equipos Red">Equipos Red</option>
                  <option value="Radios">Radios</option>
                  <option value="Antenas">Antenas</option>
                  <option value="Estructuras">Estructuras</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
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
                    <option value="Virtual">Virtual</option>
                  </select>
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
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
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
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      <EditSerialsModal 
        isOpen={isSerialsModalOpen} 
        onClose={() => setIsSerialsModalOpen(false)} 
        material={material} 
        onSaveSerials={onSaveSerials}
      />
    </>
  );
};