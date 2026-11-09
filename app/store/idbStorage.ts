import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

const SAVE_DELAY_MS = 400;

function createIdbStorage(): StateStorage {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = new Map<string, string>();

  const flush = async () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    const entries = Array.from(pending.entries());
    pending.clear();
    for (const [name, value] of entries) {
      try {
        await set(name, value);
      } catch (error) {
        console.error(`Could not save ${name}`, error);
      }
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
        console.error(`Could not load ${name}`, error);
        return null;
      }
    },

    setItem: (name, value) => {
      if (typeof window === 'undefined') return;
      pending.set(name, value);
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        void flush();
      }, SAVE_DELAY_MS);
    },

    removeItem: async name => {
      pending.delete(name);
      try {
        await del(name);
      } catch (error) {
        console.error(`Could not remove ${name}`, error);
      }
    },
  };
}

export const idbStorage = createIdbStorage();
