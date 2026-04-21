import { create } from 'zustand';
import type { Tool } from '../types';

export type EditorMode = 'edit' | 'work';

interface EditorStore {
  mode: EditorMode;
  tool: Tool;
  color: string;
  secondaryColor: string;
  zoom: number;
  showGrid: boolean;
  completedRows: Set<number>;

  setMode: (mode: EditorMode) => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  swapColors: () => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleRowComplete: (row: number) => void;
  resetCompletedRows: () => void;
}

const useEditorStore = create<EditorStore>((set) => ({
  mode: 'edit',
  tool: 'draw',
  color: '#E8ACC3',
  secondaryColor: '#D48FAA',
  zoom: 1.0,
  showGrid: true,
  completedRows: new Set<number>(),

  setMode: (mode: EditorMode) => set({ mode }),

  setTool: (tool: Tool) => set({ tool }),

  setColor: (color: string) => set({ color }),

  setSecondaryColor: (color: string) => set({ secondaryColor: color }),

  swapColors: () =>
    set((state) => ({
      color: state.secondaryColor,
      secondaryColor: state.color,
    })),

  setZoom: (zoom: number) =>
    set({ zoom: Math.max(0.25, Math.min(4.0, zoom)) }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  toggleRowComplete: (row: number) =>
    set((state) => {
      const newSet = new Set(state.completedRows);
      if (newSet.has(row)) {
        newSet.delete(row);
      } else {
        newSet.add(row);
      }
      return { completedRows: newSet };
    }),

  resetCompletedRows: () => set({ completedRows: new Set<number>() }),
}));

export default useEditorStore;
