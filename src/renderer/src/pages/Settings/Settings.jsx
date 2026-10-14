import React from 'react';
import { MainLayout } from '../../layouts/MainLayout/MainLayout';
import { useTheme } from '../../context/ThemeContext';
import styles from './Settings.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { MdDarkMode, MdLightMode, MdSave, MdSecurity, MdNotificationsActive } from 'react-icons/md';

export const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <MainLayout>
      <h2 className={styles.pageTitle}>AJUSTES DEL SISTEMA</h2>

      <div className={styles.settingsGrid}>
        
        {/* Tarjeta de Perfil de Usuario */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaUserCircle size={20} />
            <h3>Perfil de Usuario</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.profileAvatar}>
              <FaUserCircle size={80} color="var(--text-secondary)" />
              <div className={styles.profileInfo}>
                <div className={styles.userName}>J. Pérez</div>
                <div className={styles.userRole}>Administrador del Sistema</div>
                <div className={styles.userBadge}>Activo</div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Nombre Completo</label>
              <input type="text" className={styles.input} defaultValue="José Pérez" />
            </div>
            <div className={styles.formGroup}>
              <label>Correo Electrónico Corporativo</label>
              <input type="email" className={styles.input} defaultValue="jperez@petrobozcan.pdvsa.com" />
            </div>
            <button className={styles.btnPrimary} style={{marginTop: '10px'}}>
              <MdSave size={16} /> Guardar Cambios
            </button>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Apariencia */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              {isDarkMode ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
              <h3>Apariencia</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.settingRow}>
                <div>
                  <strong>Modo Oscuro</strong>
                  <p className={styles.desc}>Cambia la interfaz a colores oscuros para descansar la vista.</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <MdSecurity size={20} />
              <h3>Seguridad y Accesos</h3>
            </div>
            <div className={styles.cardBody}>
              <button className={styles.btnOutline}>Cambiar Contraseña</button>
              <button className={styles.btnOutline} style={{marginTop: '10px'}}>Gestionar Permisos de Roles</button>
            </div>
          </div>

          {/* Notificaciones */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <MdNotificationsActive size={20} />
              <h3>Alertas de Inventario</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.settingRow}>
                <div>
                  <strong>Alertas de Stock Crítico</strong>
                  <p className={styles.desc}>Recibir notificación cuando un material baje del mínimo.</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};