import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

const SAVE_DELAY_MS = 400;

function createProjectStorage(): StateStorage {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: { name: string; value: string } | null = null;

  const flush = async () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (!pending) return;

    const { name, value } = pending;
    pending = null;
    try {
      await set(name, value);
    } catch (error) {
      console.error('Could not save projects', error);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => {
      void flush();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        void flush();
      }
    });
  }

  return {
    getItem: async name => {
      if (typeof window === 'undefined') return null;
      try {
        await flush();
        const stored = await get<string>(name);
        if (stored != null) return stored;

        const legacy = window.localStorage.getItem(name);
        if (legacy != null) {
          await set(name, legacy);
          window.localStorage.removeItem(name);
        }
        return legacy;
      } catch (error) {
        console.error('Could not load projects', error);
        return null;
      }
    },

    setItem: (name, value) => {
      if (typeof window === 'undefined') return;
      pending = { name, value };
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        void flush();
      }, SAVE_DELAY_MS);
    },

    removeItem: async name => {
      pending = null;
      try {
        await del(name);
      } catch (error) {
        console.error('Could not remove projects', error);
      }
    },
  };
}

export const projectStorage = createProjectStorage();
