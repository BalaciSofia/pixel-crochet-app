export type Tool = 'draw' | 'erase' | 'fill';

export interface Project {
  id: string;
  name: string;
  cols: number;
  rows: number;
  grid: (string | null)[][];
  palette: string[];
  completedRows?: number[];
  toBuy?: string[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PALETTE = [
  '#FDE8F1', '#F7D2E3', '#EFB9CF', '#E8ACC3', '#D48FAA', '#C27D99'
];

export const BASE_CELL_SIZE = 16;
