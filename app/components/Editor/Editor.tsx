'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Drawer from '@mui/material/Drawer';
import Snackbar from '@mui/material/Snackbar';
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
import MatchYarnDialog from './MatchYarnDialog';
import { useColorsToBuy } from '../../hooks/useOwnedColors';
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
  const [matchOpen, setMatchOpen] = useState(false);
  const [rowMessage, setRowMessage] = useState<string | null>(null);

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
  const replaceColors = useProjectStore(state => state.replaceColors);
  const setCmPerStitch = useProjectStore(state => state.setCmPerStitch);

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
  const toBuy = useColorsToBuy(project);

  const openMatch = useCallback(() => {
    setPanelOpen(false);
    setMatchOpen(true);
  }, []);

  const handleApplyMatches = useCallback(
    (replacements: Record<string, string>) => {
      replaceColors(projectId, replacements);
      const current = useEditorStore.getState().color.toUpperCase();
      if (replacements[current]) setColor(replacements[current]);
      setMatchOpen(false);
    },
    [projectId, replaceColors, setColor]
  );

  const handleCmPerStitch = useCallback(
    (value: number | undefined) => setCmPerStitch(projectId, value),
    [projectId, setCmPerStitch]
  );

  const palette = project.palette;
  useEffect(() => {
    const current = useEditorStore.getState().color.toUpperCase();
    if (palette.length > 0 && !palette.some(c => c.toUpperCase() === current)) setColor(palette[0]);
  }, [palette, setColor]);

  const handleRename = useCallback(
    (name: string) => renameProject(projectId, name),
    [projectId, renameProject]
  );

  const handleResize = useCallback(
    (newWidth: number, newHeight: number) => {
      requestConfirm({
        title: 'Resize canvas?',
        message:
          newWidth < project.cols || newHeight < project.rows
            ? `Going from ${project.cols} × ${project.rows} to ${newWidth} × ${newHeight} removes stitches outside the new size. You can undo this.`
            : `Going from ${project.cols} × ${project.rows} to ${newWidth} × ${newHeight} adds empty stitches. You can undo this.`,
        confirmLabel: 'Resize',
        onConfirm: () => resizeProject(projectId, newWidth, newHeight),
      });
    },
    [project.cols, project.rows, projectId, resizeProject, requestConfirm]
  );

  const handleClearCanvas = useCallback(() => {
    requestConfirm({
      title: 'Clear canvas?',
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
    (row: number) => {
      const displayRow = project.rows - row;
      const lastDone = (nextRow ?? project.rows + 1) - 1;
      if (completedRows.has(row)) {
        if (displayRow === lastDone) toggleRowComplete(projectId, row);
        else setRowMessage(`Only the last finished row (row ${lastDone}) can be unticked.`);
      } else if (displayRow === nextRow) {
        toggleRowComplete(projectId, row);
      } else {
        setRowMessage(`Finish row ${nextRow} first.`);
      }
    },
    [project.rows, nextRow, completedRows, projectId, toggleRowComplete]
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
        onMatchYarn={openMatch}
      />
    ) : (
      <WorkSidebar
        project={project}
        completedRows={completedRows}
        nextRow={nextRow}
        onToggleRow={handleToggleRow}
        onResetProgress={handleResetProgress}
        onMatchYarn={openMatch}
        onCmPerStitchChange={handleCmPerStitch}
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
            <WorkCanvas
              project={project}
              completedRows={completedRows}
              nextRow={nextRow}
              onToggleRow={handleToggleRow}
            />
          )}

          <ZoomBar />
          <PositionIndicator />
        </div>

        {!compact && sidebar}
      </div>

      {matchOpen && (
        <MatchYarnDialog
          colors={toBuy}
          onClose={() => setMatchOpen(false)}
          onApply={handleApplyMatches}
        />
      )}

      <Snackbar
        open={rowMessage !== null}
        message={rowMessage}
        autoHideDuration={2500}
        onClose={() => setRowMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
