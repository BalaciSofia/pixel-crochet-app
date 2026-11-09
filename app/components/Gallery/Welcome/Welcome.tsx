'use client';

import React from 'react';
import Button from '@mui/material/Button';
import styles from './Welcome.module.css';
import Icon from '../../shared/Icon';

interface Props {
  visible: boolean;
  onStart: () => void;
}

export default function Welcome({ visible, onStart }: Props) {
  return (
    <div
      className={`${styles.layer} ${visible ? '' : styles.hidden}`}
      inert={!visible}
      aria-hidden={!visible}
    >
      <div className={styles.card}>
        <h1 className={styles.title}>Pixel Pattern Studio</h1>
        <p className={styles.tagline}>Design it square by square. Crochet it row by row.</p>
        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          className={styles.start}
          endIcon={<Icon name="arrowRight" size={20} strokeWidth={2.2} className={styles.arrow} />}
        >
          Start
        </Button>
      </div>
    </div>
  );
}
