'use client';

import React, { useCallback } from 'react';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MuiSlider from '@mui/material/Slider';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import GridOnIcon from '@mui/icons-material/GridOn';
import RemoveIcon from '@mui/icons-material/Remove';
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
    (_event: Event, value: number | number[]) => {
      onZoomChange(Array.isArray(value) ? value[0] : value);
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
      <Tooltip title="Zoom out">
        <span>
          <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 0.25} aria-label="Zoom out">
            <RemoveIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Typography variant="body2" sx={{ fontWeight: 600 }} className={styles.zoomValue}>
        {zoomPercent}%
      </Typography>

      <div className={styles.slider}>
        <MuiSlider
          size="small"
          aria-label="Zoom"
          min={0.25}
          max={4}
          step={0.05}
          value={zoom}
          onChange={handleSliderChange}
        />
      </div>

      <Tooltip title="Zoom in">
        <span>
          <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 4} aria-label="Zoom in">
            <AddIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title={showGrid ? 'Hide grid' : 'Show grid'}>
        <ToggleButton
          value="grid"
          size="small"
          selected={showGrid}
          onChange={onToggleGrid}
          aria-label="Toggle grid"
          className={styles.gridToggle}
        >
          <GridOnIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>

      <Tooltip title="Toggle fullscreen">
        <IconButton size="small" onClick={handleFullscreen} aria-label="Toggle fullscreen">
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
