import type { Project } from '../types';

export function colorsToBuy(
  project: Pick<Project, 'grid' | 'palette'>,
  owned: ReadonlySet<string>
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const consider = (color: string | null) => {
    if (!color) return;
    const hex = color.toUpperCase();
    if (seen.has(hex)) return;
    seen.add(hex);
    if (!owned.has(hex)) result.push(hex);
  };
  for (const color of project.palette ?? []) consider(color);
  for (const row of project.grid) for (const color of row) consider(color);
  return result;
}
