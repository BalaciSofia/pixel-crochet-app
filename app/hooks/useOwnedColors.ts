import { useMemo } from 'react';
import useYarnStore from '../store/useYarnStore';
import type { Project } from '../types';
import { colorsToBuy } from '../utils/toBuy';

export function useOwnedColors(): ReadonlySet<string> | null {
  const yarns = useYarnStore(state => state.yarns);
  return useMemo(
    () => (yarns.length === 0 ? null : new Set(yarns.map(yarn => yarn.color.toUpperCase()))),
    [yarns]
  );
}

export function useColorsToBuy(project: Pick<Project, 'grid' | 'palette'>): string[] {
  const owned = useOwnedColors();
  return useMemo(() => colorsToBuy(project, owned), [project, owned]);
}
