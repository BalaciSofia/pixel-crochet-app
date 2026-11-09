'use client';

import React, { useState, useMemo, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import styles from './ProjectCard.module.css';
import Icon from '../../shared/Icon';
import StatusBadge from '../../shared/StatusBadge';
import BuyBadge from '../../shared/BuyBadge';
import { useColorsToBuy } from '../../../hooks/useOwnedColors';
import type { Project } from '../../../types';
import { createThumbnail } from '../../../utils/exportUtils';
import { completedCount, editedLabel, projectStatus } from '../../../utils/projectStatus';

interface Props {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

const ProjectCard = React.memo(function ProjectCard({ project, onClick, onDelete }: Props) {
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const thumbnail = useMemo(() => createThumbnail(project.grid, 150), [project.grid]);

  const status = projectStatus(project);
  const done = completedCount(project);
  const percent = project.rows > 0 ? Math.round((done / project.rows) * 100) : 0;
  const toBuy = useColorsToBuy(project).length;
  const colorCount = project.palette?.length ?? 0;

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      onClick();
    },
    [onClick]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ top: e.clientY, left: e.clientX });
  }, []);

  const handleMenuButtonClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom, left: rect.left });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setMenuPosition(null);
    onDelete();
  }, [onDelete]);

  return (
    <article className={styles.card} onContextMenu={handleContextMenu}>
      <a
        href={`#/project/${encodeURIComponent(project.id)}`}
        className={styles.link}
        aria-label={`Open ${project.name}`}
        onClick={handleLinkClick}
      />

      <div className={styles.preview}>
        <div className={styles.thumbBox}>
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt="" className={styles.thumbnail} />
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>
        <StatusBadge status={status} className={styles.status} />
        {toBuy > 0 && <BuyBadge count={toBuy} className={styles.buy} />}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div className={styles.titles}>
            <h3 className={styles.name}>{project.name}</h3>
            <span className={styles.meta}>
              {project.cols} × {project.rows} · {colorCount} {colorCount === 1 ? 'color' : 'colors'}
            </span>
          </div>
          <IconButton
            className={styles.menuButton}
            onClick={handleMenuButtonClick}
            aria-label={`More options for ${project.name}`}
          >
            <Icon name="more" />
          </IconButton>
        </div>

        <div className={styles.progress}>
          <div className={styles.track} aria-hidden="true">
            <div
              className={`${styles.bar} ${status === 'finished' ? styles.barDone : ''}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className={styles.progressText}>
            <span>
              {done} / {project.rows} rows
            </span>
            <span className={styles.percent}>{percent}%</span>
          </div>
        </div>

        <span className={styles.edited}>{editedLabel(project.updatedAt)}</span>
      </div>

      <Menu
        open={menuPosition !== null}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition ?? undefined}
      >
        <MenuItem onClick={handleDeleteClick} className={styles.deleteItem}>
          <ListItemIcon className={styles.deleteItem}>
            <Icon name="trash" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </article>
  );
});

export default ProjectCard;
