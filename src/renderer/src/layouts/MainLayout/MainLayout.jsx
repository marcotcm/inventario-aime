import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Topbar } from '../Topbar/Topbar';
import styles from './MainLayout.module.css';

export const MainLayout = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Topbar />
        <main className={styles.contentArea}>
          {children}
        </main>
        <footer className={styles.footer}>
          <span>Lunes, 28 Oct 2024 - 10:15 AM</span>
          <span>Software Desarrollado para PDVSA Petróleos de Venezuela, S.A. - Petrobozcan v1.0</span>
        </footer>
      </div>
    </div>
  );
};