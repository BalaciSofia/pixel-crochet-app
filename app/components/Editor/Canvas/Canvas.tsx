'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import styles from './Canvas.module.css';
import { useCanvas } from '../../../hooks/useCanvas';
import useEditorStore from '../../../store/useEditorStore';
import useProjectStore from '../../../store/useProjectStore';
import type { Project } from '../../../types';
import type { Cell } from '../../../utils/line';

interface Props {
  project: Project;
}

const Canvas = React.memo(function Canvas({ project }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tool = useEditorStore(state => state.tool);
  const color = useEditorStore(state => state.color);
  const zoom = useEditorStore(state => state.zoom);
  const showGrid = useEditorStore(state => state.showGrid);
  const setZoom = useEditorStore(state => state.setZoom);
  const setHoveredCell = useEditorStore(state => state.setHoveredCell);

  const updateCells = useProjectStore(state => state.updateCells);
  const updateGrid = useProjectStore(state => state.updateGrid);
  const pushHistory = useProjectStore(state => state.pushHistory);

  const handleHover = useCallback(
    (cell: Cell | null) => {
      setHoveredCell(cell ? { row: cell.row + 1, col: cell.col + 1 } : null);
    },
    [setHoveredCell]
  );

  const { cellSize } = useCanvas({
    canvasRef,
    scrollRef,
    project,
    tool,
    color,
    zoom,
    showGrid,
    updateCells,
    updateGrid,
    pushHistory,
    setZoom,
    onHover: handleHover,
  });

  useEffect(() => () => setHoveredCell(null), [setHoveredCell]);

  return (
    <div ref={scrollRef} className={styles.container}>
      <div className={styles.wrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={project.cols * cellSize}
          height={project.rows * cellSize}
          style={{
            cursor: tool === 'fill' ? 'crosshair' : 'default',
          }}
        />
      </div>
    </div>
  );
});

export default Canvas;
