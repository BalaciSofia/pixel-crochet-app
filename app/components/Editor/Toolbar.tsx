'use client';

import React from 'react';
import styles from './Toolbar.module.css';
import type { EditorMode } from '../../store/useEditorStore';
import type { Tool } from '../../types';

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
  onSave,
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
      <button className={styles.backButton} onClick={onBack} aria-label="Back to gallery">
        <img src='/back-arrow.png' className={styles.backIcon} alt="Back"/>
        Back
      </button>

      {mode === 'edit' && onToolChange && (
        <div className={styles.toolGroup}>
          <button
            className={`${styles.toolBtn} ${tool === 'draw' ? styles.active : ''}`}
            onClick={() => onToolChange('draw')}
            title="Draw"
          >
            <img src='/pen-logo.png' alt="Draw" className={styles.toolLogo} />
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'erase' ? styles.active : ''}`}
            onClick={() => onToolChange('erase')}
            title="Erase"
          >
            <img src='/erase-logo.png' alt="Erase" className={styles.toolLogo} />
          </button>
          <button
            className={`${styles.toolBtn} ${tool === 'fill' ? styles.active : ''}`}
            onClick={() => onToolChange('fill')}
            title="Fill"
          >
            <img src='/bucket-logo.png' alt="Fill" className={styles.toolLogo} />
          </button>
          <div className={styles.divider} />
          <button
            className={styles.toolBtn}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <img src='/undo-logo.png' alt="Undo" className={styles.toolLogo} />
          </button>
          <button
            className={styles.toolBtn}
            onClick={onClearCanvas}
            title="Clear Canvas"
          >
            <img src='/bin-logo.png' alt="Clear Canvas" className={styles.toolLogo} />
          </button>
          <div className={styles.divider} />
          <button
            className={`${styles.toolBtn} ${styles.exportBtn}`}
            onClick={onExportPDF}
            title="Export PDF"
          >
            <img src='/pdf-logo.png' alt="Export PDF" className={styles.toolLogo} />
          </button>
        </div>
      )}

      <div className={styles.center}>
        {isEditingName ? (
          <input
            type="text"
            className={styles.nameInput}
            value={projectName}
            onChange={e => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            onKeyDown={onNameKeyDown}
            autoFocus
          />
        ) : (
          <button className={styles.nameButton} onClick={onNameClick}>
            {projectName}
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <button 
          className={`${styles.modeButton} ${mode === 'work' ? styles.workMode : ''}`}
          onClick={onToggleMode}
        >
          {mode === 'edit' ? 'Work Mode' : 'Edit Mode'}
        </button>
      </div>
    </header>
  );
}
