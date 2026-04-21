'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import styles from './WorkCanvas.module.css';
import type { Project } from '../../types';
import { BASE_CELL_SIZE } from '../../types';

interface Props {
  project: Project;
  zoom: number;
  showGrid: boolean;
  completedRows: Set<number>;
  onToggleRow: (row: number) => void;
  onHoveredCellChange: (cell: { row: number; col: number } | null) => void;
}

const WorkCanvas = React.memo(function WorkCanvas({
  project,
  zoom,
  showGrid,
  completedRows,
  onToggleRow,
  onHoveredCellChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cellSize = BASE_CELL_SIZE * zoom;
  const rowNumberWidth = 40;
  const colNumberHeight = 24;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = project.cols * cellSize + rowNumberWidth * 2;
    const canvasHeight = project.rows * cellSize + colNumberHeight * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let col = 0; col < project.cols; col++) {
      const x = rowNumberWidth + col * cellSize + cellSize / 2;
      ctx.fillText((col + 1).toString(), x, colNumberHeight / 2);
    }

    for (let col = 0; col < project.cols; col++) {
      const x = rowNumberWidth + col * cellSize + cellSize / 2;
      const y = colNumberHeight + project.rows * cellSize + colNumberHeight / 2;
      ctx.fillText((col + 1).toString(), x, y);
    }

    for (let visualRow = 0; visualRow < project.rows; visualRow++) {
      const dataRow = project.rows - 1 - visualRow;
      const displayRowNum = visualRow + 1;
      const isEven = displayRowNum % 2 === 0;
      const isCompleted = completedRows.has(dataRow);
      const y = colNumberHeight + (project.rows - 1 - visualRow) * cellSize;

      if (isCompleted) {
        ctx.fillStyle = 'rgba(232, 172, 195, 0.16)';
        ctx.fillRect(rowNumberWidth, y, project.cols * cellSize, cellSize);
      }

      for (let col = 0; col < project.cols; col++) {
        const cellColor = project.grid[dataRow][col];
        const x = rowNumberWidth + col * cellSize;

        if (cellColor) {
          ctx.fillStyle = isCompleted ? fadeColor(cellColor, 0.4) : cellColor;
          ctx.fillRect(x, y, cellSize, cellSize);
        } else {
          ctx.fillStyle = isCompleted ? '#F5F5F5' : '#FAFAF8';
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }

      ctx.fillStyle = isCompleted ? '#D48FAA' : '#888';
      ctx.font = isCompleted ? 'bold 11px sans-serif' : '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const rowY = y + cellSize / 2;
      const rowNumStr = displayRowNum.toString();

      if (isEven) {
        ctx.fillText(rowNumStr, rowNumberWidth / 2, rowY);
      } else {
        ctx.fillText(rowNumStr, rowNumberWidth + project.cols * cellSize + rowNumberWidth / 2, rowY);
      }
    }

    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;

      for (let row = 0; row <= project.rows; row++) {
        const y = colNumberHeight + row * cellSize;
        ctx.beginPath();
        ctx.moveTo(rowNumberWidth, y);
        ctx.lineTo(rowNumberWidth + project.cols * cellSize, y);
        ctx.stroke();
      }

      for (let col = 0; col <= project.cols; col++) {
        const x = rowNumberWidth + col * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, colNumberHeight);
        ctx.lineTo(x, colNumberHeight + project.rows * cellSize);
        ctx.stroke();
      }
    }
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (
        x >= rowNumberWidth &&
        x < rowNumberWidth + project.cols * cellSize &&
        y >= colNumberHeight &&
        y < colNumberHeight + project.rows * cellSize
      ) {
        const col = Math.floor((x - rowNumberWidth) / cellSize);
        const visualRow = Math.floor((y - colNumberHeight) / cellSize);
        const displayRow = project.rows - visualRow;
        onHoveredCellChange({ row: displayRow, col: col + 1 });
      } else {
        onHoveredCellChange(null);
      }
    },
    [project, cellSize, onHoveredCellChange]
  );

  const handleMouseLeave = useCallback(() => {
    onHoveredCellChange(null);
  }, [onHoveredCellChange]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const isLeftArea = x < rowNumberWidth;
      const isRightArea = x > rowNumberWidth + project.cols * cellSize;

      if (isLeftArea || isRightArea) {
        const visualRow = Math.floor((y - colNumberHeight) / cellSize);
        const dataRow = project.rows - 1 - visualRow;
        if (dataRow >= 0 && dataRow < project.rows) {
          onToggleRow(dataRow);
        }
      }
    },
    [project, cellSize, onToggleRow]
  );

  const canvasWidth = project.cols * cellSize + rowNumberWidth * 2;
  const canvasHeight = project.rows * cellSize + colNumberHeight * 2;

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.wrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
});

function fadeColor(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default WorkCanvas;
