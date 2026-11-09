import { useSyncExternalStore } from 'react';
import { isSaving, subscribeSaving } from '../store/idbStorage';

const getServerSnapshot = () => false;

export function useSaveStatus(): boolean {
  return useSyncExternalStore(subscribeSaving, isSaving, getServerSnapshot);
}
