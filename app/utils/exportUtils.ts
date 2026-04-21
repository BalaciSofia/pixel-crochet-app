import type { Project } from '../types';

const EXPORT_CELL_SIZE = 20;

export function gridToCanvas(
  grid: (string | null)[][],
  cellSize: number = EXPORT_CELL_SIZE
): HTMLCanvasElement {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const color = grid[row][col];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;

  for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * cellSize);
    ctx.lineTo(cols * cellSize, row * cellSize);
    ctx.stroke();
  }

  for (let col = 0; col <= cols; col++) {
    ctx.beginPath();
    ctx.moveTo(col * cellSize, 0);
    ctx.lineTo(col * cellSize, rows * cellSize);
    ctx.stroke();
  }

  return canvas;
}

export function getStitchCounts(grid: (string | null)[][]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of grid) {
    for (const cell of row) {
      if (cell) {
        counts.set(cell, (counts.get(cell) || 0) + 1);
      }
    }
  }

  return counts;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function createThumbnail(
  grid: (string | null)[][],
  maxSize: number = 100
): string {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  if (rows === 0 || cols === 0) return '';

  const cellSize = Math.max(1, Math.floor(maxSize / Math.max(rows, cols)));
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const color = grid[row][col];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
}
