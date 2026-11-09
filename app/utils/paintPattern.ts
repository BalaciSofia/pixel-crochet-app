const MAX_SIDE = 8192;
const MAX_AREA = 16_000_000;
const MIN_GRID_CELL = 4;
const GRID_COLOR = 'rgba(30, 26, 28, 0.13)';

export interface PaintedPattern {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  edge: (index: number) => number;
}

function canvasScale(cssWidth: number, cssHeight: number): number {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const largest = Math.max(cssWidth, cssHeight, 1);
  const area = Math.max(cssWidth * cssHeight, 1);
  return Math.min(dpr, MAX_SIDE / largest, Math.sqrt(MAX_AREA / area));
}

export function paintPattern(
  canvas: HTMLCanvasElement,
  grid: (string | null)[][],
  cellSize: number
): PaintedPattern | null {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const scale = canvasScale(cols * cellSize, rows * cellSize);
  const step = cellSize * scale;
  const edge = (index: number) => Math.round(index * step);
  const width = Math.max(1, edge(cols));
  const height = Math.max(1, edge(rows));

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < rows; row++) {
    const y = edge(row);
    const h = edge(row + 1) - y;
    for (let col = 0; col < cols; col++) {
      const color = grid[row][col];
      if (!color) continue;
      const x = edge(col);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, edge(col + 1) - x, h);
    }
  }

  return { ctx, width, height, edge };
}

export function paintRowBand(painted: PaintedPattern, row: number, color: string) {
  const { ctx, width, edge } = painted;
  ctx.fillStyle = color;
  ctx.fillRect(0, edge(row), width, edge(row + 1) - edge(row));
}

export function paintGridLines(painted: PaintedPattern, cols: number, rows: number, cellSize: number) {
  if (cellSize < MIN_GRID_CELL) return;
  const { ctx, width, height, edge } = painted;
  ctx.fillStyle = GRID_COLOR;
  for (let row = 1; row < rows; row++) {
    ctx.fillRect(0, edge(row), width, 1);
  }
  for (let col = 1; col < cols; col++) {
    ctx.fillRect(edge(col), 0, 1, height);
  }
}
