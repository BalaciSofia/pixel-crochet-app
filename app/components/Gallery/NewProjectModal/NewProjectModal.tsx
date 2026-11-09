'use client';

import React, { useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import styles from './NewProjectModal.module.css';
import AppDialog from '../../shared/AppDialog';
import Field, { FieldInput } from '../../shared/Field';
import useProjectStore from '../../../store/useProjectStore';
import useYarnStore from '../../../store/useYarnStore';
import { DEFAULT_PALETTE, type Project } from '../../../types';

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export default function NewProjectModal({ onClose, onCreated }: Props) {
  const createProject = useProjectStore(state => state.createProject);
  const yarns = useYarnStore(state => state.yarns);
  const [name, setName] = useState('Untitled Pattern');
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(24);

  const startingColors = yarns.length > 0 ? yarns.map(yarn => yarn.color) : DEFAULT_PALETTE;

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

  return (
    <AppDialog
      onClose={onClose}
      title="New pattern"
      width={400}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="outlined" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Create pattern
          </Button>
        </>
      }
    >
      <Field label="Pattern name">
        <FieldInput
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter pattern name"
          autoFocus
        />
      </Field>

      <div className={styles.row}>
        <Field label="Width">
          <FieldInput
            type="number"
            mono
            suffix="sts"
            value={width}
            min={1}
            max={200}
            onChange={e => setWidth(Number(e.target.value))}
          />
        </Field>
        <Field label="Height">
          <FieldInput
            type="number"
            mono
            suffix="rows"
            value={height}
            min={1}
            max={200}
            onChange={e => setHeight(Number(e.target.value))}
          />
        </Field>
      </div>

      <div className={styles.summary}>
        <span className={styles.summaryLabel}>Total</span>
        <span className={styles.summaryValue}>
          {width} × {height} = {(width * height).toLocaleString('en-US')} stitches
        </span>
      </div>

      <div className={styles.palette}>
        <span className={styles.paletteLabel}>Starting palette</span>
        <div className={styles.paletteRow}>
          <div className={styles.swatches} aria-hidden="true">
            {startingColors.map(color => (
              <span key={color} className={styles.swatch} style={{ background: color }} />
            ))}
          </div>
          <span className={styles.paletteNote}>
            {yarns.length > 0
              ? `Your ${yarns.length} yarn ${yarns.length === 1 ? 'color' : 'colors'}`
              : 'Basic colors'}
          </span>
        </div>
      </div>
    </AppDialog>
  );
}
