'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import styles from './WorkCanvas.module.css';
import type { Project } from '../../../types';
import { BASE_CELL_SIZE } from '../../../types';
import useEditorStore from '../../../store/useEditorStore';
import { paintGridLines, paintPattern, paintRowBand } from '../../../utils/paintPattern';

interface Props {
  project: Project;
  completedRows: Set<number>;
  nextRow: number | null;
  onToggleRow: (row: number) => void;
}

const DONE_OVERLAY = 'rgba(251, 248, 246, 0.62)';
const MIN_LABEL_CELL = 10;

const WorkCanvas = React.memo(function WorkCanvas({
  project,
  completedRows,
  nextRow,
  onToggleRow,
}: Props) {
  const zoom = useEditorStore(state => state.zoom);
  const showGrid = useEditorStore(state => state.showGrid);
  const onHoveredCellChange = useEditorStore(state => state.setHoveredCell);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cellSize = BASE_CELL_SIZE * zoom;
  const width = Math.round(project.cols * cellSize);
  const height = Math.round(project.rows * cellSize);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const painted = paintPattern(canvas, project.grid, cellSize);
    if (!painted) return;

    for (const row of completedRows) {
      if (row >= 0 && row < project.rows) paintRowBand(painted, row, DONE_OVERLAY);
    }

    if (showGrid) paintGridLines(painted, project.cols, project.rows, cellSize);
  }, [project, cellSize, showGrid, completedRows]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left) / cellSize);
      const visualRow = Math.floor((e.clientY - rect.top) / cellSize);

      if (col >= 0 && col < project.cols && visualRow >= 0 && visualRow < project.rows) {
        onHoveredCellChange({ row: project.rows - visualRow, col: col + 1 });
      } else {
        onHoveredCellChange(null);
      }
    },
    [project.cols, project.rows, cellSize, onHoveredCellChange]
  );

  const handleMouseLeave = useCallback(() => {
    onHoveredCellChange(null);
  }, [onHoveredCellChange]);

  useEffect(() => () => onHoveredCellChange(null), [onHoveredCellChange]);

  const showAllLabels = cellSize >= MIN_LABEL_CELL;

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.layout}>
          <div className={styles.gutter}>
            {Array.from({ length: project.rows }, (_, visualRow) => {
              const dataRow = visualRow;
              const displayRow = project.rows - visualRow;
              const done = completedRows.has(dataRow);
              const isNext = displayRow === nextRow;
              const showLabel = showAllLabels || isNext || displayRow === 1 || displayRow % 5 === 0;
              return (
                <button
                  key={displayRow}
                  type="button"
                  className={`${styles.rowNumber} ${done ? styles.done : ''} ${isNext ? styles.next : ''}`}
                  style={{ height: cellSize, lineHeight: `${cellSize}px` }}
                  onClick={() => onToggleRow(dataRow)}
                  aria-label={`Row ${displayRow}${done ? ', done' : ''}`}
                  aria-pressed={done}
                >
                  {showLabel ? (done ? '✓' : displayRow) : ''}
                </button>
              );
            })}
          </div>

          <div className={styles.frame}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              style={{ width, height }}
              role="img"
              aria-label="Pattern grid with completed rows dimmed"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            {nextRow !== null && (
              <span
                className={styles.nextOutline}
                aria-hidden="true"
                style={{ top: (project.rows - nextRow) * cellSize - 2, height: cellSize + 4 }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default WorkCanvas;
