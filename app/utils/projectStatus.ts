import type { Project } from '../types';

export type ProjectStatus = 'new' | 'progress' | 'finished';

export function completedCount(project: Project): number {
  return (project.completedRows ?? []).filter(row => row < project.rows).length;
}

export function projectStatus(project: Project): ProjectStatus {
  const done = completedCount(project);
  if (done === 0) return 'new';
  if (done >= project.rows) return 'finished';
  return 'progress';
}

export function projectProgress(project: Project): number {
  if (project.rows === 0) return 0;
  return completedCount(project) / project.rows;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function editedLabel(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Edited';

  const days = Math.max(0, Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS));
  if (days === 0) return 'Edited today';
  if (days === 1) return 'Edited yesterday';
  if (days < 7) return `Edited ${days} days ago`;
  if (days < 14) return 'Edited last week';
  if (days < 30) return `Edited ${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'Edited last month';
  if (days < 365) return `Edited ${Math.floor(days / 30)} months ago`;
  if (days < 730) return 'Edited last year';
  return `Edited ${Math.floor(days / 365)} years ago`;
}
