export function floodFill(
  grid: (string | null)[][],
  row: number,
  col: number,
  targetColor: string | null,
  fillColor: string
): (string | null)[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  if (rows === 0 || cols === 0) return grid;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return grid;
  if (targetColor === fillColor) return grid;

  const newGrid = grid.map(r => [...r]);

  const stack: [number, number][] = [[row, col]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;

    if (visited.has(key)) continue;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (newGrid[r][c] !== targetColor) continue;

    visited.add(key);
    newGrid[r][c] = fillColor;

    stack.push([r - 1, c]); 
    stack.push([r + 1, c]); 
    stack.push([r, c - 1]); 
    stack.push([r, c + 1]); 
  }

  return newGrid;
}
