import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import styles from './Providers.module.css';
import { MdSearch, MdFilterList, MdImageNotSupported } from 'react-icons/md';

export const Providers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const providersList = [
    { id: 'V-123456', name: 'Válvulas Mundiales S.A.', contact: 'Carlos Díaz', phone: '+58 261 123 4567', city: 'Maracaibo' },
    { id: 'J-234567', name: 'Tubos y Aceros Petrobozcan', contact: 'María López', phone: '+58 261 234 5678', city: 'Pozo B-21' },
    { id: 'G-345678', name: 'Suministros Industriales Zulia', contact: 'Pedro Gómez', phone: '+58 261 345 6789', city: 'Taller Central' },
  ];

  const catalog = [
    { code: 'PM-0005', name: 'Válvula de Compuerta', provider: 'Válvulas Mundiales S.A.', cat: 'Válvulas' },
    { code: 'PM-0010', name: 'Tubería de Acero', provider: 'Tubos y Aceros Petrobozcan', cat: 'Tuberías' },
    { code: 'PM-0021', name: 'Casco de Seguridad', provider: 'Suministros Industriales Zulia', cat: 'EPP' },
    { code: 'PM-0033', name: 'Lubricante Multigrado', provider: 'Lubricantes y Químicos C.A.', cat: 'Lubricantes' },
    { code: 'PM-0012', name: 'Junta Espiralada', provider: 'Empacaduras L.A.', cat: 'Empacaduras' },
    { code: 'PM-0041', name: 'Electrodo Soldadura', provider: 'Soluciones de Soldadura', cat: 'Soldadura' },
  ];

  const filteredCatalog = catalog.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <MainLayout>
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>GESTIÓN DE PROVEEDORES</h2>
        
        {/* Lista Horizontal de Proveedores */}
        <div className={styles.providersScroll}>
          {providersList.map((prov, idx) => (
            <div key={idx} className={styles.providerCard}>
              <h3 className={styles.provName}>{prov.name}</h3>
              <div className={styles.provInfo}>
                <div><strong>ID:</strong> {prov.id}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <div><strong>Contact:</strong> {prov.contact}<br/><strong>Telé.:</strong> {prov.phone}</div>
                  <div><strong>Ciudad:</strong><br/>{prov.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar del Catálogo */}
        <div className={styles.toolbar}>
          <h3 className={styles.sectionTitle}>CATÁLOGO DE MODELOS <span className={styles.subTitle}>(Catálogo Base)</span></h3>
          <div className={styles.actions}>
            <div className={styles.searchBox}>
              <MdSearch size={20} color="var(--text-secondary)" />
              <input 
                type="text" 
                placeholder="Buscar modelo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.btnOutline}>
              Filtrar por Proveedor <MdFilterList size={16} />
            </button>
          </div>
        </div>

        {/* Cuadrícula de Catálogo */}
        <div className={styles.catalogGrid}>
          {filteredCatalog.map((item, idx) => (
            <div key={idx} className={styles.catalogCard}>
              <div className={styles.imagePlaceholder}>
                <MdImageNotSupported size={32} color="var(--text-secondary)" />
              </div>
              <div className={styles.itemDetails}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemCode}>{item.code}</div>
                <div className={styles.itemMeta}>
                  <div><strong>Proveedor:</strong> {item.provider}</div>
                  <div><strong>Categoría:</strong> {item.cat}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};