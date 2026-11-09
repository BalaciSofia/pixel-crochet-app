'use client';

import React, { useMemo } from 'react';
import styles from './FiletPanel.module.css';
import { FILET_SQUARE, filetCells } from '../../../utils/filet';

interface Props {
  cols: number;
  rows: number;
  animate: boolean;
  className?: string;
}

const FiletPanel = React.memo(function FiletPanel({ cols, rows, animate, className }: Props) {
  const cells = useMemo(() => filetCells(cols, rows), [cols, rows]);

  return (
    <div
      role="img"
      aria-label="Filet crochet chart of eight-petal flowers in soft pink yarn"
      className={`${styles.art} ${animate ? styles.animate : ''} ${className ?? ''}`}
    >
      {cells.map(cell => (
        <span
          key={`${cell.x}-${cell.y}`}
          className={styles.cell}
          style={{
            left: cell.x * FILET_SQUARE,
            top: cell.y * FILET_SQUARE,
            background: cell.color,
            animationDelay: animate ? `${(cell.x + cell.y) * 7}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
});

export default FiletPanel;
