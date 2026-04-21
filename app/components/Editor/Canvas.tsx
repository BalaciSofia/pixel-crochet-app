'use client';

import React, { useRef, useEffect } from 'react';
import styles from './Canvas.module.css';
import { useCanvas } from '../../hooks/useCanvas';
import type { Project, Tool } from '../../types';

interface Props {
  project: Project;
  tool: Tool;
  color: string;
  zoom: number;
  showGrid: boolean;
  updateCell: (row: number, col: number, color: string | null) => void;
  updateGrid: (grid: (string | null)[][]) => void;
  onHoveredCellChange: (cell: { row: number; col: number } | null) => void;
  pushHistory: (grid: (string | null)[][]) => void;
}

const Canvas = React.memo(function Canvas({
  project,
  tool,
  color,
  zoom,
  showGrid,
  updateCell,
  updateGrid,
  onHoveredCellChange,
  pushHistory,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { hoveredCell, cellSize } = useCanvas({
    canvasRef,
    project,
    tool,
    color,
    zoom,
    showGrid,
    updateCell,
    updateGrid,
    pushHistory,
  });

  useEffect(() => {
    onHoveredCellChange(hoveredCell);
  }, [hoveredCell, onHoveredCellChange]);

  const canvasWidth = project.cols * cellSize;
  const canvasHeight = project.rows * cellSize;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            cursor: tool === 'fill' ? 'crosshair' : 'default',
          }}
        />
      </div>
    </div>
  );
});

export default Canvas;
