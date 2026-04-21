'use client';

import React, { useState, useCallback } from 'react';
import styles from './Gallery.module.css';
import ProjectCard from './ProjectCard';
import NewProjectModal from './NewProjectModal';
import ImageToPixelModal from './ImageToPixelModal';
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
    (id: string) => {
      if (confirm('Are you sure you want to delete this project?')) {
        deleteProject(id);
      }
    },
    [deleteProject]
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pixel Pattern Studio</h1>
        <p className={styles.subtitle}>
          My patterns
        </p>
      </header>

      <div className={styles.grid}>
        <button className={styles.newCard} onClick={handleOpenModal}>
          <img className={styles.plusIcon} src="/plus-logo.png" alt="" aria-hidden="true" />
          <span className={styles.newLabel}>New Pattern</span>
        </button>

        <button className={styles.newCard} onClick={handleOpenImageModal}>
          <img className={styles.plusIcon} src="/camera-logo.png" alt="" aria-hidden="true" />
          <span className={styles.newLabel}>Image to Pixel</span>
        </button>

        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onOpenProject(project.id)}
            onDelete={() => handleDeleteProject(project.id)}
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
    </div>
  );
}
