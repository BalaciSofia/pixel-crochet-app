'use client';

import React from 'react';
import styles from './PositionIndicator.module.css';
import useEditorStore from '../../../store/useEditorStore';

export default function PositionIndicator() {
  const cell = useEditorStore(state => state.hoveredCell);
  if (!cell) return null;

  return (
    <div className={styles.indicator}>
      Col {cell.col} · Row {cell.row}
    </div>
  );
}
