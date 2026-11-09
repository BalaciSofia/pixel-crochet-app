'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import styles from './Editor.module.css';
import Sidebar from './Sidebar';
import WorkSidebar from './WorkSidebar';
import Canvas from './Canvas';
import WorkCanvas from './WorkCanvas';
import Toolbar from './Toolbar';
import ZoomBar from './ZoomBar';
import PositionIndicator from './PositionIndicator';
import useProjectStore from '../../store/useProjectStore';
import useEditorStore from '../../store/useEditorStore';
import { useExport } from '../../hooks/useExport';
import { useCompletedRows } from '../../hooks/useCompletedRows';
import { useUndoRedoShortcuts } from '../../hooks/useUndoRedoShortcuts';
import ConfirmDialog, { useConfirmDialog } from '../shared/ConfirmDialog';
import LoadingScreen from '../shared/LoadingScreen';
import type { Project } from '../../types';
import { nextDisplayRow } from '../../utils/projectStatus';

interface Props {
  projectId: string;
  onBack: () => void;
}

export default function Editor({ projectId, onBack }: Props) {
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId) ?? null);
  const openProject = useProjectStore(state => state.openProject);
  const closeProject = useProjectStore(state => state.closeProject);

  useEffect(() => {
    openProject(projectId);
    return () => closeProject();
  }, [projectId, openProject, closeProject]);

  if (!project) {
    return <LoadingScreen label="Loading project" />;
  }

  return <EditorContent key={project.id} project={project} onBack={onBack} />;
}

interface ContentProps {
  project: Project;
  onBack: () => void;
}

function EditorContent({ project, onBack }: ContentProps) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [panelOpen, setPanelOpen] = useState(false);

  const renameProject = useProjectStore(state => state.renameProject);
  const resizeProject = useProjectStore(state => state.resizeProject);
  const clearCanvas = useProjectStore(state => state.clearCanvas);
  const pushHistory = useProjectStore(state => state.pushHistory);
  const undo = useProjectStore(state => state.undo);
  const redo = useProjectStore(state => state.redo);
  const canUndo = useProjectStore(state => state.past.length > 0);
  const canRedo = useProjectStore(state => state.future.length > 0);
  const addColorToPalette = useProjectStore(state => state.addColorToPalette);
  const removeColorFromPalette = useProjectStore(state => state.removeColorFromPalette);
  const toggleRowComplete = useProjectStore(state => state.toggleRowComplete);
  const resetCompletedRows = useProjectStore(state => state.resetCompletedRows);

  const mode = useEditorStore(state => state.mode);
  const tool = useEditorStore(state => state.tool);
  const color = useEditorStore(state => state.color);
  const setMode = useEditorStore(state => state.setMode);
  const setTool = useEditorStore(state => state.setTool);
  const setColor = useEditorStore(state => state.setColor);

  const { exportPDF } = useExport();
  const { requestConfirm, dialogProps } = useConfirmDialog();
  const completedRows = useCompletedRows(project);
  const nextRow = useMemo(
    () => nextDisplayRow(project.rows, completedRows),
    [project.rows, completedRows]
  );

  const projectId = project.id;

  const palette = project.palette;
  useEffect(() => {
    const current = useEditorStore.getState().color;
    if (palette.length > 0 && !palette.includes(current)) setColor(palette[0]);
  }, [palette, setColor]);

  const handleRename = useCallback(
    (name: string) => renameProject(projectId, name),
    [projectId, renameProject]
  );

  const handleResize = useCallback(
    (newWidth: number, newHeight: number) => {
      requestConfirm({
        title: 'Resize canvas?',
        message: `Resize from ${project.cols}×${project.rows} to ${newWidth}×${newHeight}? Pixels outside the new size are removed if the canvas gets smaller.`,
        confirmLabel: 'Resize',
        onConfirm: () => resizeProject(projectId, newWidth, newHeight),
      });
    },
    [project.cols, project.rows, projectId, resizeProject, requestConfirm]
  );

  const handleClearCanvas = useCallback(() => {
    requestConfirm({
      title: 'Clear the canvas?',
      message: 'This erases every pixel on the canvas. You can bring it back with Undo.',
      confirmLabel: 'Clear',
      destructive: true,
      onConfirm: () => {
        pushHistory();
        clearCanvas();
      },
    });
  }, [clearCanvas, pushHistory, requestConfirm]);

  useUndoRedoShortcuts({ enabled: mode === 'edit', onUndo: undo, onRedo: redo });

  const handleExportPDF = useCallback(() => exportPDF(project), [project, exportPDF]);

  const handleResetProgress = useCallback(() => {
    requestConfirm({
      title: 'Reset progress?',
      message: 'All completed rows will be unchecked. This cannot be undone.',
      confirmLabel: 'Reset',
      destructive: true,
      onConfirm: () => resetCompletedRows(projectId),
    });
  }, [projectId, resetCompletedRows, requestConfirm]);

  const handleToggleRow = useCallback(
    (row: number) => toggleRowComplete(projectId, row),
    [projectId, toggleRowComplete]
  );

  const handleToggleMode = useCallback(() => {
    setMode(mode === 'edit' ? 'work' : 'edit');
    setPanelOpen(false);
  }, [mode, setMode]);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const sidebar =
    mode === 'edit' ? (
      <Sidebar
        key={`${project.cols}x${project.rows}`}
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
        onToggleRow={handleToggleRow}
        onResetProgress={handleResetProgress}
      />
    );

  return (
    <div className={styles.container}>
      <Toolbar
        projectName={project.name}
        onRename={handleRename}
        cols={project.cols}
        rows={project.rows}
        nextRow={nextRow}
        compact={compact}
        onOpenPanel={openPanel}
        onBack={onBack}
        mode={mode}
        onToggleMode={handleToggleMode}
        tool={tool}
        onToolChange={setTool}
        canUndo={canUndo}
        onUndo={undo}
        canRedo={canRedo}
        onRedo={redo}
        onClearCanvas={handleClearCanvas}
        onExportPDF={handleExportPDF}
      />

      <div className={styles.main}>
        {compact && (
          <Drawer
            open={panelOpen}
            onClose={closePanel}
            slotProps={{ paper: { className: styles.drawerPaper } }}
          >
            <div className={styles.drawerContent}>{sidebar}</div>
          </Drawer>
        )}

        <div className={styles.canvasArea}>
          {mode === 'edit' ? (
            <Canvas project={project} />
          ) : (
            <WorkCanvas project={project} completedRows={completedRows} onToggleRow={handleToggleRow} />
          )}

          <ZoomBar />
          <PositionIndicator />
        </div>

        {!compact && sidebar}
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
