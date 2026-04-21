'use client';

import { useState, useCallback } from 'react';
import Gallery from './components/Gallery/Gallery';
import Editor from './components/Editor/Editor';
import useProjectStore from './store/useProjectStore';

type Screen = 'gallery' | 'editor';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('gallery');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const openProject = useProjectStore(state => state.openProject);
  const closeProject = useProjectStore(state => state.closeProject);

  const handleOpenProject = useCallback(
    (id: string) => {
      openProject(id);
      setActiveProjectId(id);
      setScreen('editor');
    },
    [openProject]
  );

  const handleBackToGallery = useCallback(() => {
    closeProject();
    setActiveProjectId(null);
    setScreen('gallery');
  }, [closeProject]);

  if (screen === 'editor' && activeProjectId) {
    return <Editor projectId={activeProjectId} onBack={handleBackToGallery} />;
  }

  return <Gallery onOpenProject={handleOpenProject} />;
}
