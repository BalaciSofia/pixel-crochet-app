import { useMemo } from 'react';
import type { Project } from '../types';

export function useCompletedRows(project: Project): Set<number> {
  return useMemo(() => new Set(project.completedRows ?? []), [project.completedRows]);
}
