import { useSyncExternalStore } from 'react';
import useProjectStore from '../store/useProjectStore';

const subscribe = (onChange: () => void) =>
  useProjectStore.persist.onFinishHydration(onChange);

const getSnapshot = () => useProjectStore.persist.hasHydrated();
const getServerSnapshot = () => false;

export function useProjectsHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
