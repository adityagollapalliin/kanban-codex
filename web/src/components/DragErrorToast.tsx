interface Props {
  readonly message: string | null;
  readonly onDismiss: () => void;
}

export function DragErrorToast({ message, onDismiss }: Props) {
  if (message === null) return null;
  return (
    <aside
      className="fixed right-5 bottom-5 z-50 flex max-w-sm items-start gap-3 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white shadow-xl"
      role="alert"
    >
      <span>{message}. Your board was restored.</span>
      <button
        aria-label="Dismiss move error"
        className="rounded px-1 hover:bg-white/15"
        onClick={onDismiss}
        type="button"
      >
        ×
      </button>
    </aside>
  );
}
