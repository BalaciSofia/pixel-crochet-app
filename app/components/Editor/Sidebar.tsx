'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import styles from './Sidebar.module.css';
import Slider from '../shared/Slider';
import Button from '../shared/Button';
import type { Project } from '../../types';
import { getStitchCounts } from '../../utils/exportUtils';

interface Props {
  project: Project;
  color: string;
  onColorChange: (color: string) => void;
  onResize: (width: number, height: number) => void;
  onAddColor: (color: string) => void;
  onRemoveColor: (color: string) => void;
}

export default function Sidebar({
  project,
  color,
  onColorChange,
  onResize,
  onAddColor,
  onRemoveColor,
}: Props) {
  const [pendingWidth, setPendingWidth] = useState(project.cols);
  const [pendingHeight, setPendingHeight] = useState(project.rows);
  const [showPalette, setShowPalette] = useState(true);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const stitchCounts = useMemo(() => getStitchCounts(project.grid), [project.grid]);
  const totalStitches = useMemo(
    () => Array.from(stitchCounts.values()).reduce((a, b) => a + b, 0),
    [stitchCounts]
  );
  const sortedCounts = useMemo(
    () => Array.from(stitchCounts.entries()).sort((a, b) => b[1] - a[1]),
    [stitchCounts]
  );

  const handleWidthChange = useCallback((value: number) => {
    setPendingWidth(value);
  }, []);

  const handleHeightChange = useCallback((value: number) => {
    setPendingHeight(value);
  }, []);

  const handleApplyResize = useCallback(() => {
    if (pendingWidth !== project.cols || pendingHeight !== project.rows) {
      onResize(pendingWidth, pendingHeight);
    }
  }, [pendingWidth, pendingHeight, project.cols, project.rows, onResize]);

  const handleColorInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onColorChange(e.target.value);
    },
    [onColorChange]
  );

  const handlePaletteColorClick = useCallback(
    (paletteColor: string) => {
      onColorChange(paletteColor);
    },
    [onColorChange]
  );

  const handleAddColorFromPicker = useCallback(() => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  }, []);

  const handleNewColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddColor(e.target.value);
    },
    [onAddColor]
  );

  const handleRemoveColor = useCallback(
    (e: React.MouseEvent, colorToRemove: string) => {
      e.stopPropagation();
      onRemoveColor(colorToRemove);
    },
    [onRemoveColor]
  );

  const palette = project.palette || [];

  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Grid Size</h3>

        <Slider
          label="Width"
          value={pendingWidth}
          min={1}
          max={200}
          onChange={handleWidthChange}
        />

        <Slider
          label="Height"
          value={pendingHeight}
          min={1}
          max={200}
          onChange={handleHeightChange}
        />

        <div className={styles.sizeDisplay}>
          {pendingWidth} × {pendingHeight}
        </div>

        {(pendingWidth !== project.cols || pendingHeight !== project.rows) && (
          <Button size="small" variant="primary" fullWidth onClick={handleApplyResize}>
            Apply Size
          </Button>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Active Color</h3>

        <div className={styles.colorSwatches}>
          <div className={styles.swatchContainer}>
            <label
              className={`${styles.colorSwatch} ${styles.activeColorSwatch}`}
              style={{ backgroundColor: color }}
              title="Click to change color"
            >
              <input
                type="color"
                value={color}
                onChange={handleColorInputChange}
                className={styles.colorInput}
              />
            </label>
            <span className={styles.colorLabel}>{color.toUpperCase()}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Project Palette
          <button
            className={styles.paletteToggle}
            onClick={() => setShowPalette(!showPalette)}
            title={showPalette ? 'Collapse' : 'Expand'}
          >
            {showPalette ? '▼' : '▶'}
          </button>
        </h3>

        {showPalette && (
          <>
            <div className={styles.palette}>
              {palette.map(c => (
                <div key={c} className={styles.paletteItem}>
                  <button
                    className={`${styles.paletteColor} ${c.toUpperCase() === color.toUpperCase() ? styles.selected : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => handlePaletteColorClick(c)}
                    title={c}
                  />
                  <button
                    className={styles.removeColorBtn}
                    onClick={(e) => handleRemoveColor(e, c)}
                    title="Remove color"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className={styles.addColorBtn}
                onClick={handleAddColorFromPicker}
                title="Add new color"
              >
                +
              </button>
              <input
                ref={colorInputRef}
                type="color"
                onChange={handleNewColorChange}
                className={styles.hiddenColorInput}
              />
            </div>
            {palette.length === 0 && (
              <p className={styles.emptyPalette}>No colors yet. Add some!</p>
            )}
          </>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Stitch Count</h3>

        <div className={styles.stitchList}>
          {sortedCounts.length === 0 ? (
            <div className={styles.emptyStitch}>No stitches yet</div>
          ) : (
            sortedCounts.map(([hex, count]) => (
              <div key={hex} className={styles.stitchRow}>
                <span className={styles.stitchSwatch} style={{ backgroundColor: hex }} />
                <span className={styles.stitchHex}>{hex}</span>
                <span className={styles.stitchCount}>{count}</span>
              </div>
            ))
          )}
        </div>

        <div className={styles.totalStitch}>
          Total: <strong>{totalStitches}</strong> stitches
        </div>
      </section>


    </aside>
  );
}
