'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Button from '@mui/material/Button';
import styles from './Gallery.module.css';
import ProjectCard from './ProjectCard';
import NewProjectModal from './NewProjectModal';
import ImageToPixelModal from './ImageToPixelModal';
import YarnStashDialog from './YarnStashDialog';
import FiletPanel from './FiletPanel';
import Scatter from './FiletPanel/Scatter';
import Welcome from './Welcome';
import HomeHeader from './HomeHeader';
import YarnStrip from './YarnStrip';
import Icon from '../shared/Icon';
import Logo from '../shared/Logo';
import ConfirmDialog, { useConfirmDialog } from '../shared/ConfirmDialog';
import useProjectStore from '../../store/useProjectStore';
import { useElementSize } from '../../hooks/useElementSize';
import { FILET_SQUARE } from '../../utils/filet';
import { projectStatus } from '../../utils/projectStatus';
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

  const inProgress = useMemo(
    () => projects.filter(project => projectStatus(project) === 'progress').length,
    [projects]
  );

  const handleStart = useCallback(() => {
    markWelcomed();
    setEntered(true);
  }, []);

  useEffect(() => {
    if (showWelcome && entered) headingRef.current?.focus({ preventScroll: true });
  }, [showWelcome, entered]);

  const handleOpenYarn = useCallback(() => {
    setIsYarnOpen(true);
  }, []);

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
          <HomeHeader
            headingRef={headingRef}
            total={projects.length}
            inProgress={inProgress}
            onNew={handleOpenModal}
            onImport={handleOpenImageModal}
          />

          <YarnStrip onOpen={handleOpenYarn} />

          {projects.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No patterns yet</p>
              <div className={styles.emptyActions}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Icon name="image" strokeWidth={1.8} />}
                  onClick={handleOpenImageModal}
                >
                  Image to pattern
                </Button>
                <Button variant="contained" startIcon={<Icon name="plus" />} onClick={handleOpenModal}>
                  New pattern
                </Button>
              </div>
            </div>
          ) : (
            <ul className={styles.grid}>
              {projects.map(project => (
                <li key={project.id} className={styles.gridItem}>
                  <ProjectCard
                    project={project}
                    onClick={() => onOpenProject(project.id)}
                    onDelete={() => handleDeleteProject(project)}
                  />
                </li>
              ))}
            </ul>
          )}
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
