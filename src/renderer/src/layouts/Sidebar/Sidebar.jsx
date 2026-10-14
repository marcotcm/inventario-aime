import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { MdHome, MdInventory, MdInput, MdOutput, MdPeople, MdAssessment, MdSettings } from 'react-icons/md';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topLogoArea}>
        <span style={{color: 'var(--pdvsa-red)', fontWeight: '900', fontSize: '20px'}}>PDVSA</span>
      </div>

      <nav className={styles.nav}>
        <button 
          onClick={() => navigate('/dashboard')}
          className={`${styles.navItem} ${isActive('/dashboard') ? styles.navItemActive : ''}`}
        >
          <MdHome className={styles.navIcon} />
          <div>INICIO <span className={styles.subtitle}>Dashboard</span></div>
        </button>
        
        <button 
          onClick={() => navigate('/inventario')}
          className={`${styles.navItem} ${isActive('/inventario') ? styles.navItemActive : ''}`}
        >
          <MdInventory className={styles.navIcon} /> 
          <div>INVENTARIO DE <span className={styles.subtitle}>MATERIALES</span></div>
        </button>

        <button 
          onClick={() => navigate('/entradas')}
          className={`${styles.navItem} ${isActive('/entradas') ? styles.navItemActive : ''}`}
        >
          <MdInput className={styles.navIcon} /> 
          <div>ENTRADAS <span className={styles.subtitle}>Ingresos</span></div>
        </button>
        
        <button 
          onClick={() => navigate('/salidas')}
          className={`${styles.navItem} ${isActive('/salidas') ? styles.navItemActive : ''}`}
        >
          <MdOutput className={styles.navIcon} /> 
          <div>SALIDAS <span className={styles.subtitle}>Egresos</span></div>
        </button>
        
        <button 
          onClick={() => navigate('/proveedores')}
          className={`${styles.navItem} ${isActive('/proveedores') ? styles.navItemActive : ''}`}
        >
          <MdPeople className={styles.navIcon} /> 
          <div>PROVEEDORES <span className={styles.subtitle}>Directorio</span></div>
        </button>

        <button 
          onClick={() => navigate('/reportes')}
          className={`${styles.navItem} ${isActive('/reportes') ? styles.navItemActive : ''}`}
        >
          <MdAssessment className={styles.navIcon} /> 
          <div>REPORTES <span className={styles.subtitle}>Estadísticas</span></div>
        </button>

        <button 
          onClick={() => navigate('/ajustes')}
          className={`${styles.navItem} ${isActive('/ajustes') ? styles.navItemActive : ''}`}
        >
          <MdSettings className={styles.navIcon} /> 
          <div>AJUSTES <span className={styles.subtitle}>Sistema</span></div>
        </button>
      </nav>

      <div className={styles.bottomLogoArea}>
        <span style={{color: 'var(--pdvsa-red)', fontWeight: '900', fontSize: '24px'}}>❖ PDVSA</span>
      </div>
    </aside>
  );
};