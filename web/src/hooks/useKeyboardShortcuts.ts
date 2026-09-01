import { useEffect } from 'react';

interface Options {
  readonly onAdd: () => void;
  readonly onHelp: () => void;
  readonly onSearch: () => void;
}

export function useKeyboardShortcuts({ onAdd, onHelp, onSearch }: Options) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (event.key === 'n' && !editing) {
        event.preventDefault();
        onAdd();
      } else if (event.key === '/' && !editing) {
        event.preventDefault();
        onSearch();
      } else if (event.key === '?' && !editing) {
        event.preventDefault();
        onHelp();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onAdd, onHelp, onSearch]);
}
