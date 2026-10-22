'use client';

import React, { useMemo } from 'react';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import styles from './WorkSidebar.module.css';
import type { Project } from '../../../types';
import { getStitchCounts } from '../../../utils/exportUtils';

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
        <Typography variant="overline" color="text.secondary" component="h3" className={styles.sectionTitle}>
          Progress
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          className={styles.progressBar}
          aria-label="Rows completed"
        />

        <Typography variant="body2" sx={{ fontWeight: 600 }} align="center">
          {completedCount} / {totalRows} rows ({progress}%)
        </Typography>
      </section>

      <section className={styles.section}>
        <Typography variant="overline" color="text.secondary" component="h3" className={styles.sectionTitle}>
          Rows
        </Typography>

        <List dense disablePadding className={styles.rowList}>
          {Array.from({ length: totalRows }, (_, i) => i + 1).map(displayRow => {
            const dataRow = totalRows - displayRow;
            const completed = completedRows.has(dataRow);
            return (
              <ListItemButton
                key={displayRow}
                selected={completed}
                onClick={() => onToggleRow(dataRow)}
                className={styles.rowItem}
              >
                <ListItemText
                  primary={`Row ${displayRow}`}
                  slotProps={{
                    primary: {
                      variant: 'body2',
                      className: completed ? styles.rowDone : undefined,
                    },
                  }}
                />
                {completed ? (
                  <CheckCircleIcon fontSize="small" color="secondary" />
                ) : (
                  <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </section>

      <section className={styles.section}>
        <Typography variant="overline" color="text.secondary" component="h3" className={styles.sectionTitle}>
          Colors Needed
        </Typography>

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
        <Typography variant="overline" color="text.secondary" component="h3" className={styles.sectionTitle}>
          Actions
        </Typography>

        <Button variant="outlined" color="secondary" fullWidth startIcon={<RestartAltIcon />} onClick={onResetProgress}>
          Reset Progress
        </Button>
      </section>
    </aside>
  );
}
