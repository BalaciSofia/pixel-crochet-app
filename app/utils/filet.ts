export const FILET_SQUARE = 16;

const TILE = 26;
const CENTER = 13;
const RADIUS = 11.4;

export interface FiletCell {
  x: number;
  y: number;
  color: string;
}

function filetColor(x: number, y: number): string | null {
  const tx = x % TILE;
  const ty = y % TILE;

  if (tx === 0 || ty === 0) {
    return (tx === 0 ? y : x) % 2 === 0 ? '#F2D2DE' : null;
  }

  if ((tx <= 2 || tx >= TILE - 2) && (ty <= 2 || ty >= TILE - 2)) {
    return (tx + ty) % 2 === 0 ? '#F2D2DE' : null;
  }

  const dx = tx - CENTER;
  const dy = ty - CENTER;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  const edge = RADIUS * (0.26 + 0.74 * Math.pow(Math.abs(Math.cos(4 * a)), 0.8));
  const vein = r > 3.5 && Math.abs(Math.sin(4 * a)) * r < 0.75;

  if (r < 1.6) return '#E3A9BF';
  if (r > 2.6 && r <= edge && !vein) return '#EDC3D3';
  return null;
}

export function filetCells(cols: number, rows: number): FiletCell[] {
  const cells: FiletCell[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = filetColor(x, y);
      if (color) cells.push({ x, y, color });
    }
  }
  return cells;
}

export const SCATTER_COLS = 13;

export function scatterCells(rows: number): FiletCell[] {
  const cells: FiletCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < SCATTER_COLS; c++) {
      const h = (((r * 73856093) ^ (c * 19349663) ^ 2654435761) >>> 0) % 1000 / 1000;
      if (h >= Math.pow(1 - c / SCATTER_COLS, 1.7) * 0.8) continue;
      const h2 = (((r * 83492791) ^ (c * 2971215073)) >>> 0) % 1000 / 1000;
      const color = h2 < 0.45 ? '#EDC3D3' : h2 < 0.8 ? '#F2D2DE' : '#F8E6EE';
      cells.push({ x: c, y: r, color });
    }
  }
  return cells;
}
