import { useCallback, useEffect, useLayoutEffect, useRef, RefObject } from 'react';
import type { Project, Tool } from '../types';
import { BASE_CELL_SIZE } from '../types';
import { floodFill } from '../utils/floodFill';
import { cellsOnLine, type Cell } from '../utils/line';
import { paintGridLines, paintPattern } from '../utils/paintPattern';

const TOUCH_DRAW_THRESHOLD = 6;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

interface Point {
  x: number;
  y: number;
}

interface UseCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  scrollRef: RefObject<HTMLElement | null>;
  project: Project;
  tool: Tool;
  color: string;
  zoom: number;
  showGrid: boolean;
  updateCells: (cells: Cell[], color: string | null) => void;
  updateGrid: (grid: (string | null)[][]) => void;
  pushHistory: () => void;
  setZoom: (zoom: number) => void;
  onHover: (cell: Cell | null) => void;
}

const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function useCanvas({
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
  onHover,
}: UseCanvasProps) {
  const cellSize = BASE_CELL_SIZE * zoom;

  const pointers = useRef(new Map<number, Point>());
  const strokePointer = useRef<number | null>(null);
  const lastCell = useRef<Cell | null>(null);
  const pendingTouch = useRef<{ id: number; start: Point; cell: Cell } | null>(null);
  const gesture = useRef<{ distance: number; zoom: number; mid: Point } | null>(null);
  const zoomAnchor = useRef<{ cellX: number; cellY: number; clientX: number; clientY: number } | null>(null);

  const getCell = useCallback(
    (clientX: number, clientY: number): Cell | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const col = Math.floor((clientX - rect.left) / cellSize);
      const row = Math.floor((clientY - rect.top) / cellSize);

      if (row < 0 || row >= project.rows || col < 0 || col >= project.cols) {
        return null;
      }
      return { row, col };
    },
    [canvasRef, project.rows, project.cols, cellSize]
  );

  const applyTool = useCallback(
    (cells: Cell[]) => {
      if (cells.length === 0) return;

      switch (tool) {
        case 'draw':
          updateCells(cells, color);
          break;
        case 'erase':
          updateCells(cells, null);
          break;
        case 'fill': {
          const { row, col } = cells[0];
          const targetColor = project.grid[row][col];
          if (targetColor !== color) {
            pushHistory();
            updateGrid(floodFill(project.grid, row, col, targetColor, color));
          }
          break;
        }
      }
    },
    [project.grid, tool, color, updateCells, updateGrid, pushHistory]
  );

  const startStroke = useCallback(
    (cell: Cell, pointerId: number) => {
      if (tool === 'fill') {
        applyTool([cell]);
        return;
      }
      pushHistory();
      strokePointer.current = pointerId;
      lastCell.current = cell;
      applyTool([cell]);
    },
    [tool, applyTool, pushHistory]
  );

  const continueStroke = useCallback(
    (cell: Cell) => {
      const from = lastCell.current;
      if (!from) {
        applyTool([cell]);
      } else if (from.row !== cell.row || from.col !== cell.col) {
        applyTool(cellsOnLine(from, cell));
      }
      lastCell.current = cell;
    },
    [applyTool]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      try {
        canvasRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // pointer already released
      }
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (e.pointerType !== 'touch') {
        const cell = getCell(e.clientX, e.clientY);
        if (cell) startStroke(cell, e.pointerId);
        return;
      }

      if (pointers.current.size >= 2) {
        pendingTouch.current = null;
        strokePointer.current = null;
        lastCell.current = null;
        const [a, b] = Array.from(pointers.current.values());
        gesture.current = { distance: distance(a, b) || 1, zoom, mid: midpoint(a, b) };
        return;
      }

      const cell = getCell(e.clientX, e.clientY);
      if (cell) {
        pendingTouch.current = { id: e.pointerId, start: { x: e.clientX, y: e.clientY }, cell };
      }
    },
    [canvasRef, getCell, startStroke, zoom]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (pointers.current.has(e.pointerId)) {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (e.pointerType !== 'touch') {
        onHover(getCell(e.clientX, e.clientY));
      }

      const g = gesture.current;
      if (g && pointers.current.size >= 2) {
        const [a, b] = Array.from(pointers.current.values());
        const mid = midpoint(a, b);
        const canvas = canvasRef.current;
        const scroll = scrollRef.current;

        const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, g.zoom * (distance(a, b) / g.distance)));

        if (canvas && Math.abs(nextZoom - zoom) > 1e-3) {
          const rect = canvas.getBoundingClientRect();
          zoomAnchor.current = {
            cellX: (g.mid.x - rect.left) / cellSize,
            cellY: (g.mid.y - rect.top) / cellSize,
            clientX: mid.x,
            clientY: mid.y,
          };
        }

        if (scroll) {
          scroll.scrollLeft -= mid.x - g.mid.x;
          scroll.scrollTop -= mid.y - g.mid.y;
        }
        g.mid = mid;
        setZoom(nextZoom);
        return;
      }

      const pending = pendingTouch.current;
      if (pending && pending.id === e.pointerId) {
        if (distance(pending.start, { x: e.clientX, y: e.clientY }) < TOUCH_DRAW_THRESHOLD) return;
        pendingTouch.current = null;
        startStroke(pending.cell, e.pointerId);
      }

      if (strokePointer.current === e.pointerId) {
        const cell = getCell(e.clientX, e.clientY);
        if (cell) continueStroke(cell);
      }
    },
    [canvasRef, scrollRef, getCell, onHover, startStroke, continueStroke, setZoom, zoom, cellSize]
  );

  const handlePointerEnd = useCallback(
    (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);

      const pending = pendingTouch.current;
      if (pending && pending.id === e.pointerId) {
        pendingTouch.current = null;
        if (e.type === 'pointerup') startStroke(pending.cell, e.pointerId);
      }

      if (strokePointer.current === e.pointerId) {
        strokePointer.current = null;
        lastCell.current = null;
      }

      if (pointers.current.size < 2) gesture.current = null;
      if (e.pointerType !== 'mouse') onHover(null);
    },
    [startStroke, onHover]
  );

  const handlePointerLeave = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && strokePointer.current === null) onHover(null);
    },
    [onHover]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerEnd);
    canvas.addEventListener('pointercancel', handlePointerEnd);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerEnd);
      canvas.removeEventListener('pointercancel', handlePointerEnd);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [canvasRef, handlePointerDown, handlePointerMove, handlePointerEnd, handlePointerLeave]);

  useLayoutEffect(() => {
    const anchor = zoomAnchor.current;
    const canvas = canvasRef.current;
    const scroll = scrollRef.current;
    if (!anchor || !canvas || !scroll) return;
    zoomAnchor.current = null;

    const rect = canvas.getBoundingClientRect();
    scroll.scrollLeft += rect.left + anchor.cellX * cellSize - anchor.clientX;
    scroll.scrollTop += rect.top + anchor.cellY * cellSize - anchor.clientY;
  }, [canvasRef, scrollRef, cellSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const painted = paintPattern(canvas, project.grid, cellSize);
    if (painted && showGrid) paintGridLines(painted, project.cols, project.rows, cellSize);
  }, [canvasRef, project, cellSize, showGrid]);

  return { cellSize };
}
