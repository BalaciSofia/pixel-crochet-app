'use client';

import React, { useMemo } from 'react';
import styles from './WorkSidebar.module.css';
import Button from '../shared/Button';
import type { Project } from '../../types';
import { getStitchCounts } from '../../utils/exportUtils';

interface Props {
  project: Project;
  completedRows: Set<number>;
  onToggleRow: (row: number) => void;
  onResetProgress: () => void;
}

export default function WorkSidebar({
  project,
  completedRows,
  onToggleRow,
  onResetProgress,
}: Props) {
  const totalRows = project.rows;
  const completedCount = completedRows.size;
  const progress = Math.round((completedCount / totalRows) * 100);

  const stitchCounts = useMemo(() => getStitchCounts(project.grid), [project.grid]);
  const totalStitches = useMemo(
    () => Array.from(stitchCounts.values()).reduce((a, b) => a + b, 0),
    [stitchCounts]
  );
  const sortedCounts = useMemo(
    () => Array.from(stitchCounts.entries()).sort((a, b) => b[1] - a[1]),
    [stitchCounts]
  );

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Progress</h3>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className={styles.progressText}>
          {completedCount} / {totalRows} rows ({progress}%)
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Rows</h3>
        
        <div className={styles.rowList}>
          {Array.from({ length: totalRows }, (_, i) => i).map(row => (
            <button
              key={row}
              className={`${styles.rowItem} ${completedRows.has(row) ? styles.completed : ''}`}
              onClick={() => onToggleRow(row)}
            >
              <span className={styles.rowNumber}>Row {row + 1}</span>
              <span className={styles.rowCheck}>
                {completedRows.has(row) ? '✓' : '○'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Colors Needed</h3>

        <div className={styles.colorList}>
          {sortedCounts.map(([hex, count]) => (
            <div key={hex} className={styles.colorRow}>
              <span className={styles.colorSwatch} style={{ backgroundColor: hex }} />
              <span className={styles.colorHex}>{hex}</span>
              <span className={styles.colorCount}>{count}</span>
            </div>
          ))}
        </div>

        <div className={styles.totalStitch}>
          Total: <strong>{totalStitches}</strong> stitches
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Actions</h3>

        <Button variant="outline" fullWidth onClick={onResetProgress}>
          Reset Progress
        </Button>
      </section>
    </aside>
  );
}
