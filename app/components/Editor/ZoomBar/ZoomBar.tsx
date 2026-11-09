'use client';

import React, { useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import styles from './ZoomBar.module.css';
import Icon from '../../shared/Icon';
import useEditorStore from '../../../store/useEditorStore';

export default function ZoomBar() {
  const zoom = useEditorStore(state => state.zoom);
  const showGrid = useEditorStore(state => state.showGrid);
  const onZoomChange = useEditorStore(state => state.setZoom);
  const onToggleGrid = useEditorStore(state => state.toggleGrid);
  const zoomPercent = Math.round(zoom * 100);

  const handleZoomIn = useCallback(() => {
    onZoomChange(Math.min(4, zoom + 0.25));
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange(Math.max(0.25, zoom - 0.25));
  }, [zoom, onZoomChange]);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  return (
    <div className={styles.container}>
      <Tooltip title="Zoom out">
        <span>
          <IconButton onClick={handleZoomOut} disabled={zoom <= 0.25} aria-label="Zoom out" className={styles.button}>
            <Icon name="minus" />
          </IconButton>
        </span>
      </Tooltip>

      <span className={styles.zoomValue} aria-live="polite">
        {zoomPercent}%
      </span>

      <Tooltip title="Zoom in">
        <span>
          <IconButton onClick={handleZoomIn} disabled={zoom >= 4} aria-label="Zoom in" className={styles.button}>
            <Icon name="plus" />
          </IconButton>
        </span>
      </Tooltip>

      <span className={styles.divider} aria-hidden="true" />

      <Tooltip title={showGrid ? 'Hide grid' : 'Show grid'}>
        <IconButton
          onClick={onToggleGrid}
          aria-label="Toggle grid lines"
          aria-pressed={showGrid}
          className={`${styles.button} ${showGrid ? styles.pressed : ''}`}
        >
          <Icon name="grid" strokeWidth={1.8} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Toggle fullscreen">
        <IconButton onClick={handleFullscreen} aria-label="Full screen" className={styles.button}>
          <Icon name="fullscreen" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
