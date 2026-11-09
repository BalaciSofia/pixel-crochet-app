import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { idbStorage } from './idbStorage';

export interface Yarn {
  id: string;
  name: string;
  color: string;
}

interface YarnState {
  yarns: Yarn[];
  addYarn: (color: string, name: string) => boolean;
  renameYarn: (id: string, name: string) => void;
  removeYarn: (id: string) => void;
}

const useYarnStore = create<YarnState>()(
  persist(
    (set, get) => ({
      yarns: [],

      addYarn: (color, name) => {
        const normalized = color.toUpperCase();
        if (get().yarns.some(yarn => yarn.color === normalized)) return false;
        const yarn: Yarn = { id: crypto.randomUUID(), name: name.trim(), color: normalized };
        set(state => ({ yarns: [...state.yarns, yarn] }));
        return true;
      },

      renameYarn: (id, name) =>
        set(state => ({
          yarns: state.yarns.map(yarn => (yarn.id === id ? { ...yarn, name } : yarn)),
        })),

      removeYarn: id => set(state => ({ yarns: state.yarns.filter(yarn => yarn.id !== id) })),
    }),
    {
      name: 'pps:yarns',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);

export default useYarnStore;
