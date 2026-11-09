'use client';

import React from 'react';
import Button from '@mui/material/Button';
import styles from './HomeHeader.module.css';
import Icon from '../../shared/Icon';

interface Props {
  headingRef: React.Ref<HTMLHeadingElement>;
  total: number;
  inProgress: number;
  onNew: () => void;
  onImport: () => void;
}

export default function HomeHeader({ headingRef, total, inProgress, onNew, onImport }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
          My patterns
        </h1>
        <p className={styles.summary}>
          {total} {total === 1 ? 'pattern' : 'patterns'} · {inProgress} in progress
        </p>
      </div>
      <div className={styles.actions}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Icon name="image" strokeWidth={1.8} />}
          onClick={onImport}
        >
          Image to pattern
        </Button>
        <Button variant="contained" startIcon={<Icon name="plus" />} onClick={onNew}>
          New pattern
        </Button>
      </div>
    </header>
  );
}
