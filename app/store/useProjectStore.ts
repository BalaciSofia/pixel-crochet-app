import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Project } from '../types';
import { DEFAULT_PALETTE } from '../types';
import { idbStorage } from './idbStorage';

function createEmptyGrid(rows: number, cols: number): (string | null)[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export interface CellPosition {
  row: number;
  col: number;
}

interface HistoryEntry {
  grid: (string | null)[][];
  cols: number;
  rows: number;
}

const MAX_HISTORY = 50;

function snapshot(project: Project): HistoryEntry {
  return { grid: project.grid, cols: project.cols, rows: project.rows };
}

function recordHistory(past: HistoryEntry[], project: Project) {
  const next = [...past, snapshot(project)];
  if (next.length > MAX_HISTORY) {
    next.shift();
  }
  return { past: next, future: [] as HistoryEntry[] };
}

function restore(project: Project, entry: HistoryEntry): Project {
  return {
    ...project,
    grid: entry.grid,
    cols: entry.cols,
    rows: entry.rows,
    completedRows: (project.completedRows ?? []).filter(r => r < entry.rows),
    updatedAt: new Date().toISOString(),
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  past: HistoryEntry[];
  future: HistoryEntry[];

  createProject: (name: string, cols: number, rows: number) => Project;
  openProject: (id: string) => void;
  closeProject: () => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateCells: (cells: CellPosition[], color: string | null) => void;
  updateGrid: (grid: (string | null)[][]) => void;
  renameProject: (id: string, name: string) => void;
  resizeProject: (id: string, newCols: number, newRows: number) => void;
  clearCanvas: () => void;
  pushHistory: () => void;
  toggleRowComplete: (id: string, row: number) => void;
  resetCompletedRows: (id: string) => void;
  undo: () => void;
  redo: () => void;
  addColorToPalette: (color: string) => void;
  removeColorFromPalette: (color: string) => void;
}

const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      past: [],
      future: [],

      createProject: (name: string, cols: number, rows: number) => {
        const now = new Date().toISOString();
        const project: Project = {
          id: generateId(),
          name,
          cols,
          rows,
          grid: createEmptyGrid(rows, cols),
          palette: [...DEFAULT_PALETTE],
          completedRows: [],
          createdAt: now,
          updatedAt: now,
        };

        set(state => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
          past: [],
          future: [],
        }));

        return project;
      },

      openProject: (id: string) => {
        set({ activeProjectId: id, past: [], future: [] });
      },

      closeProject: () => {
        set({ activeProjectId: null });
      },

      saveProject: (project: Project) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === project.id
              ? { ...project, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProject: (id: string) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      updateCells: (cells: CellPosition[], color: string | null) => {
        const { activeProjectId } = get();
        if (!activeProjectId || cells.length === 0) return;

        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== activeProjectId) return p;

            const touched = new Map<number, (string | null)[]>();
            for (const { row, col } of cells) {
              if (row < 0 || row >= p.rows || col < 0 || col >= p.cols) continue;
              let newRow = touched.get(row);
              if (!newRow) {
                newRow = [...p.grid[row]];
                touched.set(row, newRow);
              }
              newRow[col] = color;
            }
            if (touched.size === 0) return p;

            return {
              ...p,
              grid: p.grid.map((r, ri) => touched.get(ri) ?? r),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateGrid: (grid: (string | null)[][]) => {
        const { activeProjectId } = get();
        if (!activeProjectId) return;

        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? { ...p, grid, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      renameProject: (id: string, name: string) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, name, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      resizeProject: (id: string, newCols: number, newRows: number) => {
        set(state => {
          const target = state.projects.find(p => p.id === id);
          if (!target) return state;

          const newGrid: (string | null)[][] = [];
          for (let row = 0; row < newRows; row++) {
            const newRow: (string | null)[] = [];
            for (let col = 0; col < newCols; col++) {
              newRow.push(row < target.rows && col < target.cols ? target.grid[row][col] : null);
            }
            newGrid.push(newRow);
          }

          const resized: Project = {
            ...target,
            cols: newCols,
            rows: newRows,
            grid: newGrid,

            completedRows: (target.completedRows ?? []).filter(r => r < newRows),
            updatedAt: new Date().toISOString(),
          };

          return {
            projects: state.projects.map(p => (p.id === id ? resized : p)),

            ...(id === state.activeProjectId ? recordHistory(state.past, target) : {}),
          };
        });
      },

      clearCanvas: () => {
        const { activeProjectId } = get();
        if (!activeProjectId) return;

        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? {
                  ...p,
                  grid: createEmptyGrid(p.rows, p.cols),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      pushHistory: () => {
        set(state => {
          const project = state.projects.find(p => p.id === state.activeProjectId);
          if (!project) return state;
          return recordHistory(state.past, project);
        });
      },

      undo: () => {
        set(state => {
          const project = state.projects.find(p => p.id === state.activeProjectId);
          const entry = state.past[state.past.length - 1];
          if (!project || !entry) return state;

          return {
            projects: state.projects.map(p => (p.id === project.id ? restore(p, entry) : p)),
            past: state.past.slice(0, -1),
            future: [...state.future, snapshot(project)],
          };
        });
      },

      redo: () => {
        set(state => {
          const project = state.projects.find(p => p.id === state.activeProjectId);
          const entry = state.future[state.future.length - 1];
          if (!project || !entry) return state;

          return {
            projects: state.projects.map(p => (p.id === project.id ? restore(p, entry) : p)),
            past: [...state.past, snapshot(project)],
            future: state.future.slice(0, -1),
          };
        });
      },

      toggleRowComplete: (id: string, row: number) => {
        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== id) return p;
            const done = new Set(p.completedRows ?? []);
            if (done.has(row)) {
              done.delete(row);
            } else {
              done.add(row);
            }
            return {
              ...p,
              completedRows: Array.from(done).sort((a, b) => a - b),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      resetCompletedRows: (id: string) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, completedRows: [], updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      addColorToPalette: (color: string) => {
        const { activeProjectId } = get();
        if (!activeProjectId) return;

        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== activeProjectId) return p;
            const palette = p.palette || [];
            if (palette.some(c => c.toUpperCase() === color.toUpperCase())) {
              return p;
            }
            return {
              ...p,
              palette: [...palette, color.toUpperCase()],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeColorFromPalette: (color: string) => {
        const { activeProjectId } = get();
        if (!activeProjectId) return;

        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== activeProjectId) return p;
            const palette = p.palette || [];
            return {
              ...p,
              palette: palette.filter(c => c.toUpperCase() !== color.toUpperCase()),
              toBuy: p.toBuy?.filter(c => c.toUpperCase() !== color.toUpperCase()),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'pps:projects',
      storage: createJSONStorage(() => idbStorage),
      partialize: state => ({ projects: state.projects }),
    }
  )
);

export default useProjectStore;
