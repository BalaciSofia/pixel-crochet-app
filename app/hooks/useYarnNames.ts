import { useMemo } from 'react';
import useYarnStore from '../store/useYarnStore';

export function useYarnNames(): Map<string, string> {
  const yarns = useYarnStore(state => state.yarns);
  return useMemo(() => {
    const names = new Map<string, string>();
    for (const yarn of yarns) {
      const name = yarn.name.trim();
      if (name) names.set(yarn.color.toUpperCase(), name);
    }
    return names;
  }, [yarns]);
}
