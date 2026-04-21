import { useEffect, useCallback, useState, useRef, RefObject } from 'react';
import type { Project, Tool } from '../types';
import { BASE_CELL_SIZE } from '../types';
import { floodFill } from '../utils/floodFill';

interface UseCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  project: Project | null;
  tool: Tool;
  color: string;
  zoom: number;
  showGrid: boolean;
  updateCell: (row: number, col: number, color: string | null) => void;
  updateGrid: (grid: (string | null)[][]) => void;
  pushHistory: (grid: (string | null)[][]) => void;
}

interface HoveredCell {
  row: number;
  col: number;
}

export function useCanvas({
  canvasRef,
  project,
  tool,
  color,
  zoom,
  showGrid,
  updateCell,
  updateGrid,
  pushHistory,
}: UseCanvasProps) {
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  const isDrawing = useRef(false);
  const lastCell = useRef<HoveredCell | null>(null);

  const cellSize = BASE_CELL_SIZE * zoom;

  const getCellFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent): HoveredCell | null => {
      const canvas = canvasRef.current;
      if (!canvas || !project) return null;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row < 0 || row >= project.rows || col < 0 || col >= project.cols) {
        return null;
      }

      return { row, col };
    },
    [canvasRef, project, cellSize]
  );

  const applyTool = useCallback(
    (row: number, col: number) => {
      if (!project) return;

      switch (tool) {
        case 'draw':
          updateCell(row, col, color);
          break;
        case 'erase':
          updateCell(row, col, null);
          break;
        case 'fill': {
          const targetColor = project.grid[row][col];
          if (targetColor !== color) {
            pushHistory(project.grid);
            const newGrid = floodFill(project.grid, row, col, targetColor, color);
            updateGrid(newGrid);
          }
          break;
        }
      }
    },
    [project, tool, color, updateCell, updateGrid, pushHistory]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const cell = getCellFromEvent(e);
      if (!cell || !project) return;

      if (tool === 'draw' || tool === 'erase') {
        pushHistory(project.grid);
      }

      isDrawing.current = true;
      lastCell.current = cell;
      applyTool(cell.row, cell.col);
    },
    [getCellFromEvent, applyTool, pushHistory, project, tool]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const cell = getCellFromEvent(e);
      setHoveredCell(cell);

      if (!isDrawing.current || !cell || tool === 'fill') return;

      if (
        lastCell.current &&
        (lastCell.current.row !== cell.row || lastCell.current.col !== cell.col)
      ) {
        applyTool(cell.row, cell.col);
        lastCell.current = cell;
      }
    },
    [getCellFromEvent, applyTool, tool]
  );

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
    lastCell.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    isDrawing.current = false;
    lastCell.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = project.cols * cellSize;
    const height = project.rows * cellSize;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#FAFAF8';
    ctx.fillRect(0, 0, width, height);

    for (let row = 0; row < project.rows; row++) {
      for (let col = 0; col < project.cols; col++) {
        const cellColor = project.grid[row][col];
        if (cellColor) {
          ctx.fillStyle = cellColor;
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;

      for (let row = 0; row <= project.rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * cellSize);
        ctx.lineTo(width, row * cellSize);
        ctx.stroke();
      }

      for (let col = 0; col <= project.cols; col++) {
        ctx.beginPath();
        ctx.moveTo(col * cellSize, 0);
        ctx.lineTo(col * cellSize, height);
        ctx.stroke();
      }
    }
  }, [canvasRef, project, cellSize, showGrid]);

  return { hoveredCell, cellSize };
}
