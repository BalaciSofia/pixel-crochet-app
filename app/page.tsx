'use client';

import { useEffect } from 'react';
import Gallery from './components/Gallery';
import Editor from './components/Editor';
import LoadingScreen from './components/shared/LoadingScreen';
import { redirectToGallery, useHashRoute } from './hooks/useHashRoute';
import { useProjectsHydrated } from './hooks/useProjectsHydrated';
import useProjectStore from './store/useProjectStore';

export default function Home() {
  const { projectId, openProject, goToGallery } = useHashRoute();
  const hydrated = useProjectsHydrated();
  const projectExists = useProjectStore(state =>
    projectId !== null && state.projects.some(p => p.id === projectId)
  );

  useEffect(() => {
    if (hydrated && projectId && !projectExists) {
      redirectToGallery();
    }
  }, [hydrated, projectId, projectExists]);

  if (!hydrated) {
    return <LoadingScreen label="Loading projects" />;
  }

  if (projectId && projectExists) {
    return <Editor projectId={projectId} onBack={goToGallery} />;
  }

  return <Gallery onOpenProject={openProject} />;
}
