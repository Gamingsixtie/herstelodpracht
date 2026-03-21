import { useEffect } from 'react';

/** Sluit een modal/dialog bij Escape-toets */
export function useEscapeToets(onSluiten: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSluiten();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onSluiten]);
}
