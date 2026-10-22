'use client';

import React, { useState, useCallback } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import styles from './Gallery.module.css';
import ProjectCard from './ProjectCard';
import NewProjectModal from './NewProjectModal';
import ImageToPixelModal from './ImageToPixelModal';
import ConfirmDialog, { useConfirmDialog } from '../shared/ConfirmDialog';
import useProjectStore from '../../store/useProjectStore';
import type { Project } from '../../types';

interface Props {
  onOpenProject: (id: string) => void;
}

export default function Gallery({ onOpenProject }: Props) {
  const projects = useProjectStore(state => state.projects);
  const deleteProject = useProjectStore(state => state.deleteProject);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { requestConfirm, dialogProps } = useConfirmDialog();

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleOpenImageModal = useCallback(() => {
    setIsImageModalOpen(true);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setIsImageModalOpen(false);
  }, []);

  const handleProjectCreated = useCallback(
    (project: Project) => {
      setIsModalOpen(false);
      setIsImageModalOpen(false);
      onOpenProject(project.id);
    },
    [onOpenProject]
  );

  const handleDeleteProject = useCallback(
    (project: Project) => {
      requestConfirm({
        title: 'Delete project?',
        message: `"${project.name}" will be permanently deleted. This cannot be undone.`,
        confirmLabel: 'Delete',
        destructive: true,
        onConfirm: () => deleteProject(project.id),
      });
    },
    [deleteProject, requestConfirm]
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }} className={styles.title}>
          Pixel Pattern Studio
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400 }}>
          My patterns
        </Typography>
      </header>

      <div className={styles.grid}>
        <ButtonBase className={styles.newCard} onClick={handleOpenModal}>
          <span className={styles.newIcon}>
            <AddIcon fontSize="large" color="primary" />
          </span>
          <Typography variant="body2" sx={{ fontWeight: 500 }} color="text.secondary">
            New Pattern
          </Typography>
        </ButtonBase>

        <ButtonBase className={styles.newCard} onClick={handleOpenImageModal}>
          <span className={styles.newIcon}>
            <PhotoCameraIcon fontSize="large" color="primary" />
          </span>
          <Typography variant="body2" sx={{ fontWeight: 500 }} color="text.secondary">
            Image to Pixel
          </Typography>
        </ButtonBase>

        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onOpenProject(project.id)}
            onDelete={() => handleDeleteProject(project)}
          />
        ))}
      </div>

      {isModalOpen && (
        <NewProjectModal
          onClose={handleCloseModal}
          onCreated={handleProjectCreated}
        />
      )}

      {isImageModalOpen && (
        <ImageToPixelModal
          onClose={handleCloseImageModal}
          onCreated={handleProjectCreated}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
