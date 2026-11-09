import { useMemo } from 'react';
import useYarnStore from '../store/useYarnStore';
import type { Project } from '../types';
import { colorsToBuy } from '../utils/toBuy';

export function useOwnedColors(): ReadonlySet<string> {
  const yarns = useYarnStore(state => state.yarns);
  return useMemo(() => new Set(yarns.map(yarn => yarn.color.toUpperCase())), [yarns]);
}

export function useColorsToBuy(project: Pick<Project, 'grid' | 'palette'>): string[] {
  const owned = useOwnedColors();
  return useMemo(() => colorsToBuy(project, owned), [project, owned]);
}
