'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './ProjectCard.module.css';
import type { Project } from '../../../types';
import { createThumbnail } from '../../../utils/exportUtils';

interface Props {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  onClick,
  onDelete,
}: Props) {
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const thumbnail = useMemo(() => createThumbnail(project.grid, 150), [project.grid]);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card variant="outlined" className={styles.card} onContextMenu={handleContextMenu}>
      <CardActionArea onClick={onClick}>
        <div className={styles.preview}>
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt={project.name} className={styles.thumbnail} />
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>

        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            {project.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {project.cols} × {project.rows} pixels
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {formatDate(project.updatedAt)}
          </Typography>
        </CardContent>
      </CardActionArea>

      <IconButton
        size="small"
        className={styles.menuButton}
        onClick={handleMenuButtonClick}
        aria-label="More options"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        open={menuPosition !== null}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition ?? undefined}
      >
        <MenuItem onClick={handleDeleteClick} className={styles.deleteItem}>
          <ListItemIcon className={styles.deleteItem}>
            <DeleteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
});

export default ProjectCard;
