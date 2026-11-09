export type Tool = 'draw' | 'erase' | 'fill';

export interface Project {
  id: string;
  name: string;
  cols: number;
  rows: number;
  grid: (string | null)[][];
  palette: string[];
  completedRows?: number[];
  cmPerStitch?: number;
  createdAt: string;
  updatedAt: string;
}

export const BASE_CELL_SIZE = 16;
