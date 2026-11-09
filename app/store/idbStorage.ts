import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

const SAVE_DELAY_MS = 400;

interface IdbStorage {
  storage: StateStorage;
  subscribeSaving: (listener: () => void) => () => void;
  isSaving: () => boolean;
}

function createIdbStorage(): IdbStorage {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = new Map<string, string>();
  const listeners = new Set<() => void>();
  let saving = false;
  let writing = 0;

  const setSaving = (value: boolean) => {
    if (saving === value) return;
    saving = value;
    listeners.forEach(listener => listener());
  };

  const flush = async () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    const entries = Array.from(pending.entries());
    pending.clear();
    writing++;
    for (const [name, value] of entries) {
      try {
        await set(name, value);
      } catch (error) {
        console.error(`Could not save ${name}`, error);
      }
    }
    writing--;
    if (writing === 0 && pending.size === 0 && timer === undefined) setSaving(false);
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

  const storage: StateStorage = {
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
      setSaving(true);
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

  return {
    storage,
    subscribeSaving: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isSaving: () => saving,
  };
}

const idb = createIdbStorage();

export const idbStorage = idb.storage;
export const subscribeSaving = idb.subscribeSaving;
export const isSaving = idb.isSaving;
