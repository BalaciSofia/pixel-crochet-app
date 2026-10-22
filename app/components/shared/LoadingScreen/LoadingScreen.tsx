'use client';

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={styles.loading}>
      <CircularProgress aria-label={label} />
    </div>
  );
}
