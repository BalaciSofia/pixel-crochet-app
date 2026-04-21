import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '../types';
import { DEFAULT_PALETTE } from '../types';

function createEmptyGrid(rows: number, cols: number): (string | null)[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  history: (string | null)[][][];  
  historyIndex: number;
  
  createProject: (name: string, cols: number, rows: number) => Project;
  openProject: (id: string) => void;
  closeProject: () => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateCell: (row: number, col: number, color: string | null) => void;
  updateGrid: (grid: (string | null)[][]) => void;
  renameProject: (id: string, name: string) => void;
  resizeProject: (id: string, newCols: number, newRows: number) => void;
  clearCanvas: () => void;
  getActiveProject: () => Project | null;
  pushHistory: (grid: (string | null)[][]) => void;
  undo: () => void;
  canUndo: () => boolean;
  addColorToPalette: (color: string) => void;
  removeColorFromPalette: (color: string) => void;
}

const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      history: [],
      historyIndex: -1,

      createProject: (name: string, cols: number, rows: number) => {
        const now = new Date().toISOString();
        const project: Project = {
          id: generateId(),
          name,
          cols,
          rows,
          grid: createEmptyGrid(rows, cols),
          palette: [...DEFAULT_PALETTE],
          createdAt: now,
          updatedAt: now,
        };

        set(state => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
          history: [],
          historyIndex: -1,
        }));

        return project;
      },

      openProject: (id: string) => {
        set({ activeProjectId: id, history: [], historyIndex: -1 });
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

      updateCell: (row: number, col: number, color: string | null) => {
        const { activeProjectId, projects } = get();
        if (!activeProjectId) return;

        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== activeProjectId) return p;
            if (row < 0 || row >= p.rows || col < 0 || col >= p.cols) return p;

            const newGrid = p.grid.map((r, ri) =>
              ri === row ? r.map((c, ci) => (ci === col ? color : c)) : r
            );

            return {
              ...p,
              grid: newGrid,
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
        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== id) return p;

            const newGrid: (string | null)[][] = [];
            for (let row = 0; row < newRows; row++) {
              const newRow: (string | null)[] = [];
              for (let col = 0; col < newCols; col++) {
                if (row < p.rows && col < p.cols) {
                  newRow.push(p.grid[row][col]);
                } else {
                  newRow.push(null);
                }
              }
              newGrid.push(newRow);
            }

            return {
              ...p,
              cols: newCols,
              rows: newRows,
              grid: newGrid,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      clearCanvas: () => {
        const { activeProjectId, projects } = get();
        if (!activeProjectId) return;

        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

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

      getActiveProject: () => {
        const { activeProjectId, projects } = get();
        return projects.find(p => p.id === activeProjectId) ?? null;
      },

      pushHistory: (grid: (string | null)[][]) => {
        const MAX_HISTORY = 50;
        set(state => {
          const gridCopy = grid.map(row => [...row]);
          const newHistory = [...state.history.slice(0, state.historyIndex + 1), gridCopy];
          if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
          }
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      undo: () => {
        const { historyIndex, history, activeProjectId } = get();
        if (historyIndex < 0 || !activeProjectId) return;

        const previousGrid = history[historyIndex];
        if (!previousGrid) return;

        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? { ...p, grid: previousGrid.map(row => [...row]), updatedAt: new Date().toISOString() }
              : p
          ),
          historyIndex: state.historyIndex - 1,
        }));
      },

      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex >= 0;
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
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'pps:projects',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);

export default useProjectStore;
