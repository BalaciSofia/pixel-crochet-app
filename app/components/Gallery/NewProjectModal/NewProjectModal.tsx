'use client';

import React, { useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import styles from './NewProjectModal.module.css';
import useProjectStore from '../../../store/useProjectStore';
import type { Project } from '../../../types';

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

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit } }}
    >
      <DialogTitle>Create New Pattern</DialogTitle>

      <DialogContent className={styles.content}>
        <TextField
          label="Pattern Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter pattern name"
          autoFocus
          fullWidth
        />

        <div className={styles.row}>
          <TextField
            label="Width (pixels)"
            type="number"
            value={width}
            onChange={e => setWidth(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: 200 } }}
          />
          <TextField
            label="Height (pixels)"
            type="number"
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: 200 } }}
          />
        </div>

        <Typography variant="body2" color="text.secondary" className={styles.preview}>
          {width} x {height} = {width * height} stitches
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          Create Pattern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
