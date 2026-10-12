import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { MdHome, MdInventory, MdInput, MdOutput, MdPeople, MdAssessment, MdSettings, MdExpandMore } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topLogoArea}>
        <span style={{color: '#cb4335', fontWeight: '900', fontSize: '20px'}}>PDVSA</span>
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
        
        <button className={styles.navItem}><MdPeople className={styles.navIcon} /> PROVEEDORES</button>
        <button className={styles.navItem}><MdAssessment className={styles.navIcon} /> REPORTES</button>
        <button className={styles.navItem}><MdSettings className={styles.navIcon} /> AJUSTES</button>
      </nav>

      <div className={styles.bottomLogoArea}>
        <span style={{color: '#cb4335', fontWeight: '900', fontSize: '24px'}}>❖ PDVSA</span>
      </div>

      <div className={styles.userProfile}>
        <FaUserCircle size={36} color="#94a3b8" />
        <div className={styles.userInfo}>
          <div className={styles.userName}>J. Pérez</div>
          <div className={styles.userRole}>Administrador</div>
        </div>
        <MdExpandMore size={20} color="#64748b" style={{ marginLeft: 'auto' }} />
      </div>
    </aside>
  );
};