'use client';

import React, { useMemo } from 'react';
import styles from './Scatter.module.css';
import { FILET_SQUARE, scatterCells } from '../../../../utils/filet';

interface Props {
  rows: number;
  className?: string;
}

const Scatter = React.memo(function Scatter({ rows, className }: Props) {
  const cells = useMemo(() => scatterCells(rows), [rows]);

  return (
    <div aria-hidden="true" className={`${styles.scatter} ${className ?? ''}`}>
      {cells.map(cell => (
        <span
          key={`${cell.x}-${cell.y}`}
          className={styles.bit}
          style={{ left: cell.x * FILET_SQUARE, top: cell.y * FILET_SQUARE, background: cell.color }}
        />
      ))}
    </div>
  );
});

export default Scatter;
