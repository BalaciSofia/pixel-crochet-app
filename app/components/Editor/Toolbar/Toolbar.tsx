'use client';

import React, { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import styles from './Toolbar.module.css';
import Icon from '../../shared/Icon';
import Segmented, { type SegmentedOption } from '../../shared/Segmented';
import { useSaveStatus } from '../../../hooks/useSaveStatus';
import type { EditorMode } from '../../../store/useEditorStore';
import type { Tool } from '../../../types';

interface Props {
  projectName: string;
  onRename: (name: string) => void;
  cols: number;
  rows: number;
  nextRow: number | null;
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

const TOOL_OPTIONS: SegmentedOption<Tool>[] = [
  { value: 'draw', label: <span className="toolLabel">Draw</span>, ariaLabel: 'Draw', icon: <Icon name="draw" strokeWidth={1.9} />, tooltip: 'Draw' },
  { value: 'erase', label: <span className="toolLabel">Erase</span>, ariaLabel: 'Erase', icon: <Icon name="erase" strokeWidth={1.9} />, tooltip: 'Erase' },
  { value: 'fill', label: <span className="toolLabel">Fill</span>, ariaLabel: 'Fill', icon: <Icon name="fill" strokeWidth={1.9} />, tooltip: 'Fill bucket' },
];

const MODE_OPTIONS: SegmentedOption<EditorMode>[] = [
  { value: 'edit', label: <span className="modeLabel">Edit</span>, ariaLabel: 'Edit', icon: <Icon name="pencil" size={16} /> },
  { value: 'work', label: <span className="modeLabel">Work</span>, ariaLabel: 'Work', icon: <Icon name="work" size={16} /> },
];

export default function Toolbar({
  projectName,
  onRename,
  cols,
  rows,
  nextRow,
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
  const saving = useSaveStatus();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleModeChange = useCallback(
    (next: EditorMode) => {
      if (next !== mode) onToggleMode();
    },
    [mode, onToggleMode]
  );

  const showTools = mode === 'edit' && onToolChange && tool;

  return (
    <header className={`${styles.toolbar} ${compact ? styles.compact : ''}`}>
      {compact ? (
        <IconButton onClick={onBack} aria-label="Back to patterns" className={styles.iconButton}>
          <Icon name="arrowLeft" size={20} />
        </IconButton>
      ) : (
        <>
          <Button
            color="inherit"
            onClick={onBack}
            startIcon={<Icon name="arrowLeft" size={20} />}
            className={styles.back}
          >
            Patterns
          </Button>
          <span className={styles.divider} aria-hidden="true" />
        </>
      )}

      {showTools && (
        <div className={styles.tools}>
          <Segmented
            options={TOOL_OPTIONS}
            value={tool}
            onChange={onToolChange}
            ariaLabel="Drawing tool"
            small={phone}
            className={styles.toolGroup}
          />
          <div className={styles.history}>
            <Tooltip title="Undo (Ctrl+Z)">
              <span>
                <IconButton onClick={onUndo} disabled={!canUndo} aria-label="Undo" className={styles.iconButton}>
                  <Icon name="undo" size={20} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <span>
                <IconButton onClick={onRedo} disabled={!canRedo} aria-label="Redo" className={styles.iconButton}>
                  <Icon name="redo" size={20} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Clear canvas">
              <IconButton
                onClick={onClearCanvas}
                aria-label="Clear canvas"
                className={`${styles.iconButton} ${styles.danger}`}
              >
                <Icon name="trash" size={20} />
              </IconButton>
            </Tooltip>
            {compact && (
              <Tooltip title="Export PDF">
                <IconButton onClick={onExportPDF} aria-label="Export PDF" className={styles.iconButton}>
                  <Icon name="download" size={20} />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      <div className={styles.center}>
        {isEditingName ? (
          <input
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleNameKeyDown}
            autoFocus
            aria-label="Pattern name"
            className={styles.nameInput}
          />
        ) : (
          <button
            type="button"
            className={styles.nameButton}
            onClick={handleNameClick}
            title="Rename pattern"
          >
            <span className={styles.nameText}>{projectName}</span>
            <Icon name="chevronDown" size={14} color="var(--muted)" />
          </button>
        )}
        <span className={styles.subtitle}>
          {mode === 'edit' ? (
            <>
              <span className={styles.mono}>
                {cols} × {rows}
              </span>
              <span className={styles.hideNarrow}>stitches</span>
              <span aria-hidden="true">·</span>
              <span className={styles.saveState}>
                {saving ? (
                  'Saving…'
                ) : (
                  <>
                    <Icon name="check" size={12} strokeWidth={3} color="var(--success)" />
                    Saved
                  </>
                )}
              </span>
            </>
          ) : (
            <>{nextRow === null ? `All ${rows} rows finished` : `Working row ${nextRow} of ${rows}`}</>
          )}
        </span>
      </div>

      {!compact && (
        <Button
          variant="outlined"
          color="neutral"
          onClick={onExportPDF}
          startIcon={<Icon name="download" />}
          className={styles.export}
        >
          Export PDF
        </Button>
      )}

      {compact && mode === 'work' && (
        <Tooltip title="Export PDF">
          <IconButton onClick={onExportPDF} aria-label="Export PDF" className={styles.iconButton}>
            <Icon name="download" size={20} />
          </IconButton>
        </Tooltip>
      )}

      {!compact && <span className={styles.divider} aria-hidden="true" />}

      <Segmented
        options={MODE_OPTIONS}
        value={mode}
        onChange={handleModeChange}
        ariaLabel="Mode"
        strong
        small={phone}
        className={styles.modeGroup}
      />

      {compact && (
        <IconButton
          onClick={onOpenPanel}
          aria-label={mode === 'edit' ? 'Open colors and size' : 'Open rows and colors'}
          className={styles.iconButton}
        >
          <Icon name="menu" size={20} />
        </IconButton>
      )}
    </header>
  );
}
