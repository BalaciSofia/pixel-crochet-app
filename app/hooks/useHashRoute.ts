import { useCallback, useSyncExternalStore } from 'react';

const PROJECT_PREFIX = '#/project/';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const getSnapshot = () => window.location.hash;
const getServerSnapshot = () => '';

export function redirectToGallery() {
  window.location.replace('#/');
}

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const projectId = hash.startsWith(PROJECT_PREFIX)
    ? decodeURIComponent(hash.slice(PROJECT_PREFIX.length))
    : null;

  const openProject = useCallback((id: string) => {
    window.location.hash = `/project/${encodeURIComponent(id)}`;
  }, []);

  const goToGallery = useCallback(() => {
    window.location.hash = '/';
  }, []);

  return { projectId, openProject, goToGallery };
}
