import { create } from 'zustand';
import type { Tool } from '../types';

export type EditorMode = 'edit' | 'work';

export interface HoveredCell {
  row: number;
  col: number;
}

interface EditorStore {
  mode: EditorMode;
  tool: Tool;
  color: string;
  zoom: number;
  showGrid: boolean;
  hoveredCell: HoveredCell | null;

  setMode: (mode: EditorMode) => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setHoveredCell: (cell: HoveredCell | null) => void;
}

const useEditorStore = create<EditorStore>((set) => ({
  mode: 'edit',
  tool: 'draw',
  color: '#000000',
  zoom: 1.0,
  showGrid: true,
  hoveredCell: null,

  setMode: (mode: EditorMode) => set({ mode }),

  setTool: (tool: Tool) => set({ tool }),

  setColor: (color: string) => set({ color }),

  setZoom: (zoom: number) =>
    set({ zoom: Math.max(0.25, Math.min(4.0, zoom)) }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  setHoveredCell: (cell: HoveredCell | null) => set({ hoveredCell: cell }),
}));

export default useEditorStore;
