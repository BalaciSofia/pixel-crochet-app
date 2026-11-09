import React from 'react';
import styles from './StatusBadge.module.css';
import type { ProjectStatus } from '../../../utils/projectStatus';

const LABELS: Record<ProjectStatus, string> = {
  progress: 'In progress',
  finished: 'Finished',
  new: 'Not started',
};

interface Props {
  status: ProjectStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span className={`${styles.badge} ${styles[status]} ${className ?? ''}`}>
      {LABELS[status]}
    </span>
  );
}
