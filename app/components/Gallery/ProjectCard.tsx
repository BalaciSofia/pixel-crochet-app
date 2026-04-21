'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProjectCard.module.css';
import type { Project } from '../../types';
import { createThumbnail } from '../../utils/exportUtils';

interface Props {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  onClick,
  onDelete,
}: Props) {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const thumb = createThumbnail(project.grid, 150);
    setThumbnail(thumb);
  }, [project.grid]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  }, []);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu(false);
      onDelete();
    },
    [onDelete]
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className={styles.preview}>
        {thumbnail ? (
          <img src={thumbnail} alt={project.name} className={styles.thumbnail} />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{project.name}</h3>
        <p className={styles.dimensions}>
          {project.cols} × {project.rows} pixels
        </p>
        <p className={styles.date}>{formatDate(project.updatedAt)}</p>
      </div>

      <button
        className={styles.menuButton}
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        aria-label="More options"
      >
        ⋮
      </button>

      {showMenu && (
        <div className={styles.menu}>
          <button className={styles.menuItem} onClick={handleDeleteClick}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
});

export default ProjectCard;
