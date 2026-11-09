'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import styles from './Canvas.module.css';
import Ruler from './Ruler';
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
  const hoveredCell = useEditorStore(state => state.hoveredCell);

  const updateCells = useProjectStore(state => state.updateCells);
  const updateGrid = useProjectStore(state => state.updateGrid);
  const pushHistory = useProjectStore(state => state.pushHistory);

  const rows = project.rows;
  const handleHover = useCallback(
    (cell: Cell | null) => {
      setHoveredCell(cell ? { row: rows - cell.row, col: cell.col + 1 } : null);
    },
    [rows, setHoveredCell]
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

  const colLabels = useMemo(
    () => Array.from({ length: project.cols }, (_, i) => i + 1),
    [project.cols]
  );
  const rowLabels = useMemo(
    () => Array.from({ length: project.rows }, (_, i) => project.rows - i),
    [project.rows]
  );

  const width = Math.round(project.cols * cellSize);
  const height = Math.round(project.rows * cellSize);

  return (
    <div ref={scrollRef} className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.layout}>
          <span />
          <Ruler labels={colLabels} cellSize={cellSize} orientation="horizontal" />
          <Ruler labels={rowLabels} cellSize={cellSize} orientation="vertical" />
          <div className={styles.frame}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              style={{ width, height }}
              role="img"
              aria-label={`Pattern grid, ${project.cols} by ${project.rows} stitches`}
            />
            {hoveredCell && (
              <span
                className={styles.hover}
                aria-hidden="true"
                style={{
                  left: (hoveredCell.col - 1) * cellSize,
                  top: (rows - hoveredCell.row) * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Canvas;
