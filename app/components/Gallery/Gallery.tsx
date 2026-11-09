'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import styles from './Gallery.module.css';
import ProjectCard from './ProjectCard';
import NewProjectModal from './NewProjectModal';
import ImageToPixelModal from './ImageToPixelModal';
import YarnStashDialog from './YarnStashDialog';
import FiletPanel from './FiletPanel';
import Scatter from './FiletPanel/Scatter';
import Welcome from './Welcome';
import Logo from '../shared/Logo';
import ConfirmDialog, { useConfirmDialog } from '../shared/ConfirmDialog';
import useProjectStore from '../../store/useProjectStore';
import { useElementSize } from '../../hooks/useElementSize';
import { FILET_SQUARE } from '../../utils/filet';
import type { Project } from '../../types';

const WELCOMED_KEY = 'pps:welcomed';
const PANEL_WIDTH = 440;
const NARROW_WIDTH = 900;

function readWelcomed(): boolean {
  try {
    return window.sessionStorage.getItem(WELCOMED_KEY) !== null;
  } catch {
    return true;
  }
}

function markWelcomed() {
  try {
    window.sessionStorage.setItem(WELCOMED_KEY, '1');
  } catch {}
}

interface Props {
  onOpenProject: (id: string) => void;
}

export default function Gallery({ onOpenProject }: Props) {
  const projects = useProjectStore(state => state.projects);
  const deleteProject = useProjectStore(state => state.deleteProject);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isYarnOpen, setIsYarnOpen] = useState(false);
  const { requestConfirm, dialogProps } = useConfirmDialog();

  const [showWelcome] = useState(() => !readWelcomed());
  const [entered, setEntered] = useState(!showWelcome);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const size = useElementSize(rootRef);

  const narrow = size.width > 0 && size.width <= NARROW_WIDTH;
  const artWidth = showWelcome || narrow ? size.width : PANEL_WIDTH;
  const artCols = Math.ceil(artWidth / FILET_SQUARE);
  const artRows = Math.ceil(size.height / FILET_SQUARE);

  const handleStart = useCallback(() => {
    markWelcomed();
    setEntered(true);
  }, []);

  useEffect(() => {
    if (showWelcome && entered) headingRef.current?.focus({ preventScroll: true });
  }, [showWelcome, entered]);

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
    <div ref={rootRef} className={`${styles.root} ${entered ? styles.entered : styles.welcome}`}>
      <aside className={styles.panel} aria-label="Pixel Pattern Studio">
        <FiletPanel cols={artCols} rows={artRows} animate={showWelcome} />

        {showWelcome && <Welcome visible={!entered} onStart={handleStart} />}

        <div className={styles.plates} aria-hidden={!entered}>
          <div className={styles.plate}>
            <Logo />
          </div>
          <p className={`${styles.plate} ${styles.tagline}`}>
            Design it square by square.
            <br />
            Crochet it row by row.
          </p>
        </div>
      </aside>

      <Scatter rows={artRows} className={styles.scatter} />

      <main className={styles.main} inert={!entered}>
        <div className={styles.content}>
          <header className={styles.header}>
            <Typography
              ref={headingRef}
              tabIndex={-1}
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700 }}
              className={styles.title}
            >
              My patterns
            </Typography>
            <Button
              color="inherit"
              startIcon={<PaletteOutlinedIcon />}
              onClick={() => setIsYarnOpen(true)}
            >
              My yarn
            </Button>
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
        </div>
      </main>

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

      {isYarnOpen && <YarnStashDialog onClose={() => setIsYarnOpen(false)} />}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
