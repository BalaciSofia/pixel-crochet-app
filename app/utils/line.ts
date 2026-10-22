export interface Cell {
  row: number;
  col: number;
}

export function cellsOnLine(from: Cell, to: Cell): Cell[] {
  const cells: Cell[] = [];

  let row = from.row;
  let col = from.col;
  const dRow = Math.abs(to.row - row);
  const dCol = Math.abs(to.col - col);
  const stepRow = row < to.row ? 1 : -1;
  const stepCol = col < to.col ? 1 : -1;
  let err = dCol - dRow;

  while (row !== to.row || col !== to.col) {
    const doubled = 2 * err;
    if (doubled > -dRow) {
      err -= dRow;
      col += stepCol;
    }
    if (doubled < dCol) {
      err += dCol;
      row += stepRow;
    }
    cells.push({ row, col });
  }

  return cells;
}
