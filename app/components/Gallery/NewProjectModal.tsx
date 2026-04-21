'use client';

import React, { useState, useCallback } from 'react';
import styles from './NewProjectModal.module.css';
import Button from '../shared/Button';
import useProjectStore from '../../store/useProjectStore';
import type { Project } from '../../types';

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export default function NewProjectModal({ onClose, onCreated }: Props) {
  const createProject = useProjectStore(state => state.createProject);
  const [name, setName] = useState('Untitled Pattern');
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(24);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const clampedWidth = Math.max(1, Math.min(200, width));
      const clampedHeight = Math.max(1, Math.min(200, height));
      const project = createProject(name.trim() || 'Untitled Pattern', clampedWidth, clampedHeight);
      onCreated(project);
    },
    [name, width, height, createProject, onCreated]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Create New Pattern</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Pattern Name</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter pattern name"
              autoFocus
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Width (pixels)</label>
              <input
                type="number"
                className={styles.input}
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                min={1}
                max={200}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Height (pixels)</label>
              <input
                type="number"
                className={styles.input}
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                min={1}
                max={200}
              />
            </div>
          </div>

          <div className={styles.preview}>
            {width} x {height} = {width * height} stitches
          </div>

          <div className={styles.actions}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Pattern
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
