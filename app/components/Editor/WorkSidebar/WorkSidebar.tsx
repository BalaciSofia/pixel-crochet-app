'use client';

import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import styles from './WorkSidebar.module.css';
import YarnCalculator from './YarnCalculator';
import Icon from '../../shared/Icon';
import SectionLabel from '../../shared/SectionLabel';
import BuyBadge from '../../shared/BuyBadge';
import ToBuyList from '../../shared/ToBuyList';
import { useYarnNames } from '../../../hooks/useYarnNames';
import { useColorsToBuy } from '../../../hooks/useOwnedColors';
import type { Project } from '../../../types';
import { getStitchCounts } from '../../../utils/exportUtils';

interface Props {
  project: Project;
  completedRows: Set<number>;
  nextRow: number | null;
  onToggleRow: (row: number) => void;
  onResetProgress: () => void;
  onMatchYarn: () => void;
  onCmPerStitchChange: (value: number | undefined) => void;
}

const EXTRA = 0.1;

function metres(stitches: number, cmPerStitch: number): string {
  return ((stitches * cmPerStitch * (1 + EXTRA)) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function parseCm(value: string): number | undefined {
  const n = Number(value.replace(',', '.'));
  return value.trim() !== '' && Number.isFinite(n) && n > 0 ? n : undefined;
}

export default function WorkSidebar({
  project,
  completedRows,
  nextRow,
  onToggleRow,
  onResetProgress,
  onMatchYarn,
  onCmPerStitchChange,
}: Props) {
  const [calcOpen, setCalcOpen] = useState(project.cmPerStitch !== undefined);
  const [cmText, setCmText] = useState(
    project.cmPerStitch !== undefined ? String(project.cmPerStitch) : ''
  );
  const cm = parseCm(cmText);

  const handleCmChange = (value: string) => {
    setCmText(value);
    const parsed = parseCm(value);
    if (parsed !== undefined || value.trim() === '') onCmPerStitchChange(parsed);
  };

  const totalRows = project.rows;
  const completedCount = completedRows.size;
  const progress = totalRows > 0 ? Math.round((completedCount / totalRows) * 100) : 0;
  const yarnNames = useYarnNames();
  const toBuyList = useColorsToBuy(project);
  const toBuy = useMemo(() => new Set(toBuyList), [toBuyList]);

  const stitchCounts = useMemo(() => getStitchCounts(project.grid), [project.grid]);
  const totalStitches = useMemo(
    () => Array.from(stitchCounts.values()).reduce((a, b) => a + b, 0),
    [stitchCounts]
  );
  const sortedCounts = useMemo(
    () => Array.from(stitchCounts.entries()).sort((a, b) => b[1] - a[1]),
    [stitchCounts]
  );
  const usedToBuy = useMemo(
    () => sortedCounts.map(([hex]) => hex.toUpperCase()).filter(hex => toBuy.has(hex)),
    [sortedCounts, toBuy]
  );

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <SectionLabel>Progress</SectionLabel>
        <div className={styles.progressHead}>
          <span className={styles.progressCount}>
            {completedCount}
            <span className={styles.progressTotal}> / {totalRows} rows</span>
          </span>
          <span className={styles.percent}>{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Rows completed"
          aria-valuemin={0}
          aria-valuemax={totalRows}
          aria-valuenow={completedCount}
          className={styles.track}
        >
          <div className={styles.bar} style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.rowsSection}`}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Rows</SectionLabel>
          <span className={styles.hint}>Tick rows off in order</span>
        </div>
        <ul className={styles.rowList}>
          {Array.from({ length: totalRows }, (_, i) => i + 1).map(displayRow => {
            const dataRow = totalRows - displayRow;
            const done = completedRows.has(dataRow);
            const isNext = displayRow === nextRow;
            return (
              <li key={displayRow}>
                <button
                  type="button"
                  aria-pressed={done}
                  onClick={() => onToggleRow(dataRow)}
                  className={`${styles.rowItem} ${done ? styles.rowDone : ''} ${isNext ? styles.rowNext : ''}`}
                >
                  <span>Row {displayRow}</span>
                  {done ? (
                    <span className={styles.check} aria-hidden="true">
                      <Icon name="check" size={12} strokeWidth={3.5} />
                    </span>
                  ) : isNext ? (
                    <span className={styles.nextBadge}>Next</span>
                  ) : (
                    <span className={styles.todo} aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section}>
        <SectionLabel>Colors needed</SectionLabel>
        <ul className={styles.colorList}>
          {sortedCounts.map(([hex, count]) => {
            const name = yarnNames.get(hex.toUpperCase());
            const buy = toBuy.has(hex.toUpperCase());
            return (
              <li key={hex} className={styles.colorRow}>
                <span className={styles.colorSwatch} style={{ backgroundColor: hex }} aria-hidden="true" />
                <span className={styles.colorName}>
                  {name && <>{name} </>}
                  <span className={styles.colorHex}>{hex.toUpperCase()}</span>
                </span>
                {buy && (
                  <>
                    <BuyBadge />
                    <span className={styles.visuallyHidden}>Need to buy</span>
                  </>
                )}
                <span className={styles.colorCount}>{count.toLocaleString('en-US')}</span>
                {cm !== undefined && <span className={styles.metres}>≈ {metres(count, cm)} m</span>}
              </li>
            );
          })}
        </ul>
        <div className={styles.total}>
          <span className={styles.totalLabel}>Total stitches</span>
          <span className={styles.totalValue}>{totalStitches.toLocaleString('en-US')}</span>
          {cm !== undefined && (
            <span className={`${styles.metres} ${styles.totalMetres}`}>≈ {metres(totalStitches, cm)} m</span>
          )}
        </div>
        {cm !== undefined && (
          <p className={styles.extraNote}>Includes 10% extra for color changes and mistakes.</p>
        )}
        <YarnCalculator
          open={calcOpen}
          onOpen={() => setCalcOpen(true)}
          value={cmText}
          onChange={handleCmChange}
          autoFocus={project.cmPerStitch === undefined}
        />
        <ToBuyList colors={usedToBuy} />
        {toBuyList.length > 0 && (
          <Button
            variant="outlined"
            color="neutral"
            size="compact"
            fullWidth
            onClick={onMatchYarn}
          >
            Try matching to my yarn
          </Button>
        )}
      </section>

      <section className={styles.resetSection}>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<Icon name="reset" size={16} strokeWidth={2.2} />}
          onClick={onResetProgress}
        >
          Reset progress
        </Button>
      </section>
    </aside>
  );
}
