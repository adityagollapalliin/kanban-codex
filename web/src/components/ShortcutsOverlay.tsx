import { useEffect, useRef } from 'react';

interface Props {
  readonly onClose: () => void;
}

export function ShortcutsOverlay({ onClose }: Props) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5">
      <section
        aria-labelledby="shortcuts-heading"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        role="dialog"
      >
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-black" id="shortcuts-heading">
            Keyboard shortcuts
          </h2>
          <button
            aria-label="Close shortcuts"
            className="rounded px-2 py-1 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
            ref={close}
            type="button"
          >
            ×
          </button>
        </header>
        <dl className="mt-5 space-y-3 text-sm">
          <Shortcut
            keyName="n"
            description="Add a card to the focused column"
          />
          <Shortcut keyName="/" description="Focus card search" />
          <Shortcut keyName="Esc" description="Close drawer or overlay" />
          <Shortcut keyName="?" description="Show this reference" />
          <Shortcut
            keyName="Space"
            description="Pick up or drop a dragged item"
          />
          <Shortcut keyName="Arrow keys" description="Move a dragged item" />
        </dl>
      </section>
    </div>
  );
}

function Shortcut({
  description,
  keyName,
}: {
  description: string;
  keyName: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="rounded bg-slate-100 px-2 py-1 font-mono font-bold dark:bg-slate-800">
        {keyName}
      </dt>
      <dd className="text-right text-slate-600 dark:text-slate-300">
        {description}
      </dd>
    </div>
  );
}
