import React from 'react';
import styles from './Topbar.module.css';
import { MdDarkMode, MdLightMode, MdNotifications } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';

export const Topbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className={styles.topbar}>
      <div className={styles.title}>SISTEMA DE GESTIÓN DE INVENTARIO</div>
      
      <div className={styles.rightSection}>
        <div className={styles.locationInfo}>
          <div className={styles.locationName}>PETROBOZCAN</div>
          <div className={styles.locationDept}>Mantenimiento y Suministros</div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.actions}>
          <button 
            className={styles.iconButton} 
            onClick={toggleTheme}
            title={isDarkMode ? "Activar Modo Claro" : "Activar Modo Oscuro"}
          >
            {isDarkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
          </button>

          <button className={styles.iconButton} title="Notificaciones de Inventario">
            <MdNotifications size={24} />
            <span className={styles.badge}>3</span>
          </button>
        </div>
      </div>
    </header>
  );
};