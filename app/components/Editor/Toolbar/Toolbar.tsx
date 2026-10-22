'use client';

import React, { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import MenuIcon from '@mui/icons-material/Menu';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import styles from './Toolbar.module.css';
import type { EditorMode } from '../../../store/useEditorStore';
import type { Tool } from '../../../types';

interface Props {
  projectName: string;
  onRename: (name: string) => void;
  compact: boolean;
  onOpenPanel: () => void;
  onBack: () => void;
  mode: EditorMode;
  onToggleMode: () => void;
  tool?: Tool;
  onToolChange?: (tool: Tool) => void;
  canUndo?: boolean;
  onUndo?: () => void;
  canRedo?: boolean;
  onRedo?: () => void;
  onClearCanvas?: () => void;
  onExportPDF?: () => void;
}

export default function Toolbar({
  projectName,
  onRename,
  compact,
  onOpenPanel,
  onBack,
  mode,
  onToggleMode,
  tool,
  onToolChange,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  onClearCanvas,
  onExportPDF,
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const handleNameClick = useCallback(() => {
    setEditedName(projectName);
    setIsEditingName(true);
  }, [projectName]);

  const commitName = useCallback(() => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== projectName) onRename(trimmed);
    setIsEditingName(false);
  }, [editedName, projectName, onRename]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitName();
      else if (e.key === 'Escape') setIsEditingName(false);
    },
    [commitName]
  );

  return (
    <header className={styles.toolbar}>
      {compact ? (
        <>
          <IconButton onClick={onBack} aria-label="Back to gallery" edge="start">
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={onOpenPanel} aria-label="Open side panel">
            <MenuIcon />
          </IconButton>
        </>
      ) : (
        <Button
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          aria-label="Back to gallery"
        >
          Back
        </Button>
      )}

      {mode === 'edit' && onToolChange && (
        <div className={styles.toolGroup}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={tool}
            aria-label="Drawing tool"
            onChange={(_event, value: Tool | null) => {
              if (value) onToolChange(value);
            }}
          >
            <ToggleButton value="draw" aria-label="Draw">
              <Tooltip title="Draw">
                <EditIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="erase" aria-label="Erase">
              <Tooltip title="Erase">
                <AutoFixNormalIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="fill" aria-label="Fill">
              <Tooltip title="Fill">
                <FormatColorFillIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />

          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <IconButton size="small" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Y)">
            <span>
              <IconButton size="small" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Clear canvas">
            <IconButton size="small" color="secondary" onClick={onClearCanvas} aria-label="Clear canvas">
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          <Tooltip title="Export PDF">
            <IconButton size="small" onClick={onExportPDF} aria-label="Export PDF">
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}

      <div className={styles.center}>
        {isEditingName ? (
          <TextField
            variant="standard"
            size="small"
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleNameKeyDown}
            autoFocus
            slotProps={{
              htmlInput: {
                'aria-label': 'Pattern name',
                className: styles.nameInput,
              },
            }}
          />
        ) : (
          <Button color="inherit" className={styles.nameButton} onClick={handleNameClick}>
            {projectName}
          </Button>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant={mode === 'work' ? 'contained' : 'outlined'}
          startIcon={mode === 'edit' ? <ChecklistIcon /> : <EditIcon />}
          onClick={onToggleMode}
        >
          {mode === 'edit' ? (compact ? 'Work' : 'Work Mode') : compact ? 'Edit' : 'Edit Mode'}
        </Button>
      </div>
    </header>
  );
}
