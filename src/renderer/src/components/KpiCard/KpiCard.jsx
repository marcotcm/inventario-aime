import React from 'react';
import styles from './KpiCard.module.css';

export const KpiCard = ({ title, value, icon }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {icon}
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};