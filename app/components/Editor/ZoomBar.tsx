'use client';

import React, { useCallback } from 'react';
import styles from './ZoomBar.module.css';

interface Props {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export default function ZoomBar({ zoom, onZoomChange, showGrid, onToggleGrid }: Props) {
  const zoomPercent = Math.round(zoom * 100);

  const handleZoomIn = useCallback(() => {
    onZoomChange(Math.min(4, zoom + 0.25));
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange(Math.max(0.25, zoom - 0.25));
  }, [zoom, onZoomChange]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onZoomChange(Number(e.target.value));
    },
    [onZoomChange]
  );

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={handleZoomOut}
        disabled={zoom <= 0.25}
        title="Zoom out"
      >
        -
      </button>

      <span className={styles.zoomValue}>{zoomPercent}%</span>

      <input
        type="range"
        className={styles.slider}
        min={0.25}
        max={4}
        step={0.05}
        value={zoom}
        onChange={handleSliderChange}
      />

      <button
        className={styles.button}
        onClick={handleZoomIn}
        disabled={zoom >= 4}
        title="Zoom in"
      >
        +
      </button>

      <div className={styles.divider} />

      <button
        className={`${styles.button} ${showGrid ? styles.active : ''}`}
        onClick={onToggleGrid}
        title={showGrid ? 'Hide grid' : 'Show grid'}
      >
        ▦
      </button>

      <button
        className={styles.button}
        onClick={handleFullscreen}
        title="Toggle fullscreen"
      >
        ⛶
      </button>
    </div>
  );
}
