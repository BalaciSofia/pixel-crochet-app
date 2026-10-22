'use client';

import React from 'react';
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
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UndoIcon from '@mui/icons-material/Undo';
import styles from './Toolbar.module.css';
import type { EditorMode } from '../../../store/useEditorStore';
import type { Tool } from '../../../types';

interface Props {
  projectName: string;
  isEditingName: boolean;
  onNameClick: () => void;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  onNameKeyDown: (e: React.KeyboardEvent) => void;
  onBack: () => void;
  onSave: () => void;
  mode: EditorMode;
  onToggleMode: () => void;
  tool?: Tool;
  onToolChange?: (tool: Tool) => void;
  canUndo?: boolean;
  onUndo?: () => void;
  onClearCanvas?: () => void;
  onExportPDF?: () => void;
}

export default function Toolbar({
  projectName,
  isEditingName,
  onNameClick,
  onNameChange,
  onNameBlur,
  onNameKeyDown,
  onBack,
  mode,
  onToggleMode,
  tool,
  onToolChange,
  canUndo,
  onUndo,
  onClearCanvas,
  onExportPDF,
}: Props) {
  return (
    <header className={styles.toolbar}>
      <Button
        color="inherit"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        aria-label="Back to gallery"
      >
        Back
      </Button>

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

          <Tooltip title="Undo">
            <span>
              <IconButton size="small" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
                <UndoIcon fontSize="small" />
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
            value={projectName}
            onChange={e => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            onKeyDown={onNameKeyDown}
            autoFocus
            slotProps={{
              htmlInput: {
                'aria-label': 'Pattern name',
                className: styles.nameInput,
              },
            }}
          />
        ) : (
          <Button color="inherit" className={styles.nameButton} onClick={onNameClick}>
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
          {mode === 'edit' ? 'Work Mode' : 'Edit Mode'}
        </Button>
      </div>
    </header>
  );
}
