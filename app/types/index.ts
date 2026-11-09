export type Tool = 'draw' | 'erase' | 'fill';

export interface Project {
  id: string;
  name: string;
  cols: number;
  rows: number;
  grid: (string | null)[][];
  palette: string[];
  completedRows?: number[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PALETTE = [
  '#000000', '#4A4A4A', '#9E9E9E', '#FFFFFF',
  '#D32F2F', '#F57C00', '#FBC02D', '#388E3C',
  '#00838F', '#1976D2', '#5E35B1', '#E8ACC3',
  '#795548', '#F5E6CC',
];

export const BASE_CELL_SIZE = 16;
