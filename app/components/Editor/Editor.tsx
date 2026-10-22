'use client';

import React, { useState, useCallback, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './Editor.module.css';
import Sidebar from './Sidebar';
import WorkSidebar from './WorkSidebar';
import Canvas from './Canvas';
import WorkCanvas from './WorkCanvas';
import Toolbar from './Toolbar';
import ZoomBar from './ZoomBar';
import useProjectStore from '../../store/useProjectStore';
import useEditorStore from '../../store/useEditorStore';
import { useExport } from '../../hooks/useExport';
import ConfirmDialog, { useConfirmDialog } from '../shared/ConfirmDialog';

interface Props {
  projectId: string;
  onBack: () => void;
}

export default function Editor({ projectId, onBack }: Props) {
  const projects = useProjectStore(state => state.projects);
  const openProject = useProjectStore(state => state.openProject);
  const renameProject = useProjectStore(state => state.renameProject);
  const resizeProject = useProjectStore(state => state.resizeProject);
  const clearCanvas = useProjectStore(state => state.clearCanvas);
  const updateCell = useProjectStore(state => state.updateCell);
  const updateGrid = useProjectStore(state => state.updateGrid);
  const pushHistory = useProjectStore(state => state.pushHistory);
  const undo = useProjectStore(state => state.undo);
  const canUndo = useProjectStore(state => state.canUndo());
  const addColorToPalette = useProjectStore(state => state.addColorToPalette);
  const removeColorFromPalette = useProjectStore(state => state.removeColorFromPalette);

  const mode = useEditorStore(state => state.mode);
  const tool = useEditorStore(state => state.tool);
  const color = useEditorStore(state => state.color);
  const secondaryColor = useEditorStore(state => state.secondaryColor);
  const zoom = useEditorStore(state => state.zoom);
  const showGrid = useEditorStore(state => state.showGrid);
  const completedRows = useEditorStore(state => state.completedRows);
  const setMode = useEditorStore(state => state.setMode);
  const setTool = useEditorStore(state => state.setTool);
  const setColor = useEditorStore(state => state.setColor);
  const setSecondaryColor = useEditorStore(state => state.setSecondaryColor);
  const swapColors = useEditorStore(state => state.swapColors);
  const setZoom = useEditorStore(state => state.setZoom);
  const toggleGrid = useEditorStore(state => state.toggleGrid);
  const toggleRowComplete = useEditorStore(state => state.toggleRowComplete);
  const resetCompletedRows = useEditorStore(state => state.resetCompletedRows);

  const { exportPNG, exportPDF } = useExport();
  const { requestConfirm, dialogProps } = useConfirmDialog();

  const project = projects.find(p => p.id === projectId) ?? null;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project?.name ?? '');
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    openProject(projectId);
  }, [projectId, openProject]);

  useEffect(() => {
    if (project) {
      setEditedName(project.name);
    }
  }, [project?.name]);

  const handleNameClick = useCallback(() => {
    setIsEditingName(true);
  }, []);

  const handleNameBlur = useCallback(() => {
    if (project && editedName.trim()) {
      renameProject(project.id, editedName.trim());
    }
    setIsEditingName(false);
  }, [project, editedName, renameProject]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNameBlur();
      } else if (e.key === 'Escape') {
        setEditedName(project?.name ?? '');
        setIsEditingName(false);
      }
    },
    [handleNameBlur, project?.name]
  );

  const handleResize = useCallback(
    (newWidth: number, newHeight: number) => {
      if (!project) return;
      requestConfirm({
        title: 'Resize canvas?',
        message: `Resize from ${project.cols}×${project.rows} to ${newWidth}×${newHeight}? Pixels outside the new size are removed if the canvas gets smaller.`,
        confirmLabel: 'Resize',
        onConfirm: () => resizeProject(project.id, newWidth, newHeight),
      });
    },
    [project, resizeProject, requestConfirm]
  );

  const handleClearCanvas = useCallback(() => {
    if (!project) return;
    requestConfirm({
      title: 'Clear the canvas?',
      message: 'This erases every pixel on the canvas. You can bring it back with Undo.',
      confirmLabel: 'Clear',
      destructive: true,
      onConfirm: () => {
        pushHistory(project.grid);
        clearCanvas();
      },
    });
  }, [clearCanvas, pushHistory, project, requestConfirm]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleExportPNG = useCallback(() => {
    if (project) {
      exportPNG(project);
    }
  }, [project, exportPNG]);

  const handleExportPDF = useCallback(() => {
    if (project) {
      exportPDF(project);
    }
  }, [project, exportPDF]);

  const handleResetProgress = useCallback(() => {
    requestConfirm({
      title: 'Reset progress?',
      message: 'All completed rows will be unchecked. This cannot be undone.',
      confirmLabel: 'Reset',
      destructive: true,
      onConfirm: resetCompletedRows,
    });
  }, [resetCompletedRows, requestConfirm]);

  const handleToggleMode = useCallback(() => {
    setMode(mode === 'edit' ? 'work' : 'edit');
  }, [mode, setMode]);

  if (!project) {
    return (
      <div className={styles.loading}>
        <CircularProgress aria-label="Loading project" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toolbar
        projectName={isEditingName ? editedName : project.name}
        isEditingName={isEditingName}
        onNameClick={handleNameClick}
        onNameChange={setEditedName}
        onNameBlur={handleNameBlur}
        onNameKeyDown={handleNameKeyDown}
        onBack={onBack}
        onSave={() => {}}
        mode={mode}
        onToggleMode={handleToggleMode}
        tool={tool}
        onToolChange={setTool}
        canUndo={canUndo}
        onUndo={handleUndo}
        onClearCanvas={handleClearCanvas}
        onExportPDF={handleExportPDF}
      />

      <div className={styles.main}>
        {mode === 'edit' ? (
          <Sidebar
            project={project}
            color={color}
            onColorChange={setColor}
            onResize={handleResize}
            onAddColor={addColorToPalette}
            onRemoveColor={removeColorFromPalette}
          />
        ) : (
          <WorkSidebar
            project={project}
            completedRows={completedRows}
            onToggleRow={toggleRowComplete}
            onResetProgress={handleResetProgress}
          />
        )}

        <div className={styles.canvasArea}>
          {mode === 'edit' ? (
            <Canvas
              project={project}
              tool={tool}
              color={color}
              zoom={zoom}
              showGrid={showGrid}
              updateCell={updateCell}
              updateGrid={updateGrid}
              onHoveredCellChange={setHoveredCell}
              pushHistory={pushHistory}
            />
          ) : (
            <WorkCanvas
              project={project}
              zoom={zoom}
              showGrid={showGrid}
              completedRows={completedRows}
              onToggleRow={toggleRowComplete}
              onHoveredCellChange={setHoveredCell}
            />
          )}

          <ZoomBar
            zoom={zoom}
            onZoomChange={setZoom}
            showGrid={showGrid}
            onToggleGrid={toggleGrid}
          />

          {hoveredCell && (
            <div className={styles.positionIndicator}>
              col {mode === 'edit' ? hoveredCell.col + 1 : hoveredCell.col}, row {mode === 'edit' ? hoveredCell.row + 1 : hoveredCell.row}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
