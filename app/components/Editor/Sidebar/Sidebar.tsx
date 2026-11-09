'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import styles from './Sidebar.module.css';
import Icon from '../../shared/Icon';
import BuyBadge from '../../shared/BuyBadge';
import SectionLabel from '../../shared/SectionLabel';
import ToBuyList from '../../shared/ToBuyList';
import { useYarnNames } from '../../../hooks/useYarnNames';
import { useColorsToBuy, useOwnedColors } from '../../../hooks/useOwnedColors';
import useYarnStore from '../../../store/useYarnStore';
import type { Project } from '../../../types';

const MIN_SIZE = 1;
const MAX_SIZE = 200;

interface Props {
  project: Project;
  color: string;
  onColorChange: (color: string) => void;
  onResize: (width: number, height: number) => void;
  onAddColor: (color: string) => void;
  onRemoveColor: (color: string) => void;
  onMatchYarn: () => void;
}

function parseSize(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < MIN_SIZE || n > MAX_SIZE) return null;
  return n;
}

export default function Sidebar({
  project,
  color,
  onColorChange,
  onResize,
  onAddColor,
  onRemoveColor,
  onMatchYarn,
}: Props) {
  const [pendingWidth, setPendingWidth] = useState(String(project.cols));
  const [pendingHeight, setPendingHeight] = useState(String(project.rows));
  const colorInputRef = useRef<HTMLInputElement>(null);
  const yarnNames = useYarnNames();
  const owned = useOwnedColors();
  const addYarn = useYarnStore(state => state.addYarn);
  const toBuyList = useColorsToBuy(project);

  const width = parseSize(pendingWidth);
  const height = parseSize(pendingHeight);
  const sizeChanged =
    width !== null && height !== null && (width !== project.cols || height !== project.rows);

  const handleResizeSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (sizeChanged && width !== null && height !== null) onResize(width, height);
    },
    [sizeChanged, width, height, onResize]
  );

  const handleColorInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onColorChange(e.target.value);
    },
    [onColorChange]
  );

  const handleAddColorFromPicker = useCallback(() => {
    colorInputRef.current?.click();
  }, []);

  const handleNewColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddColor(e.target.value);
    },
    [onAddColor]
  );

  const palette = project.palette || [];
  const toBuy = useMemo(() => new Set(toBuyList), [toBuyList]);

  const nameOf = (hex: string) => yarnNames.get(hex.toUpperCase());
  const currentHex = color.toUpperCase();
  const currentOwned = owned?.has(currentHex) ?? false;

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <SectionLabel>Current color</SectionLabel>
        <div className={styles.current}>
          <label className={styles.currentSwatch} style={{ backgroundColor: color }}>
            <span className={styles.visuallyHidden}>Pick a custom color</span>
            <input
              type="color"
              value={color}
              onChange={handleColorInputChange}
              className={styles.colorInput}
            />
          </label>
          <div className={styles.currentText}>
            <span className={styles.currentName}>{nameOf(currentHex) ?? 'Custom'}</span>
            <span className={styles.mono}>{currentHex}</span>
            {!currentOwned && (
              <span className={styles.currentBuy}>
                {toBuy.has(currentHex) ? (
                  <span className={styles.buyTag}>
                    <Icon name="cart" size={11} strokeWidth={2.6} />
                    Need to buy
                  </span>
                ) : (
                  <span className={styles.notOwned}>Not in your yarn</span>
                )}
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => addYarn(currentHex, '')}
                  aria-label={`Already have ${currentHex}? Add it to my yarn`}
                >
                  Have it? Add
                </button>
              </span>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <SectionLabel>Palette · {palette.length}</SectionLabel>
          <Button
            size="tiny"
            onClick={handleAddColorFromPicker}
            startIcon={<Icon name="plus" size={14} strokeWidth={2.4} />}
          >
            Add
          </Button>
          <input
            ref={colorInputRef}
            type="color"
            onChange={handleNewColorChange}
            className={styles.hiddenColorInput}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {palette.length === 0 ? (
          <p className={styles.empty}>No colors yet. Add some!</p>
        ) : (
          <ul className={styles.palette}>
            {palette.map(c => {
              const hex = c.toUpperCase();
              const buy = toBuy.has(hex);
              const name = nameOf(hex);
              const label = name ? `${name} ${hex}` : hex;
              return (
                <li key={c} className={styles.paletteItem}>
                  <button
                    type="button"
                    className={`${styles.paletteColor} ${hex === currentHex ? styles.selected : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => onColorChange(c)}
                    aria-pressed={hex === currentHex}
                    title={buy ? `${label} (need to buy)` : label}
                    aria-label={`Use ${label}${buy ? ', need to buy' : ''}`}
                  />
                  {buy && <BuyBadge className={styles.buyBadge} />}
                  <IconButton
                    size="small"
                    className={styles.removeColorBtn}
                    onClick={() => onRemoveColor(c)}
                    aria-label={`Remove color ${hex}`}
                  >
                    <Icon name="close" size={12} strokeWidth={3} />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}

        <ToBuyList colors={toBuyList} />
        {toBuyList.length > 0 && (
          <Button variant="outlined" color="neutral" size="compact" fullWidth onClick={onMatchYarn}>
            Try matching to my yarn
          </Button>
        )}
      </section>

      <section className={`${styles.section} ${styles.last}`}>
        <SectionLabel>Canvas size</SectionLabel>
        <form className={styles.sizeForm} onSubmit={handleResizeSubmit}>
          <div className={styles.sizeInputs}>
            <label className={styles.field}>
              Width
              <input
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={pendingWidth}
                onChange={e => setPendingWidth(e.target.value)}
                className={styles.numberInput}
              />
            </label>
            <label className={styles.field}>
              Height
              <input
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={pendingHeight}
                onChange={e => setPendingHeight(e.target.value)}
                className={styles.numberInput}
              />
            </label>
          </div>
          <Button
            type="submit"
            variant="outlined"
            color="inherit"
            size="compact"
            fullWidth
            disabled={!sizeChanged}
          >
            Resize canvas
          </Button>
        </form>
      </section>

    </aside>
  );
}
