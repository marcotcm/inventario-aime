import React from 'react';
import styles from './DataCard.module.css';

export const DataCard = ({ title, children }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title} dangerouslySetInnerHTML={{ __html: title }}></h3>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};