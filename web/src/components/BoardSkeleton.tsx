export function BoardSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading board"
      className="flex gap-4 overflow-hidden px-6 pb-6"
    >
      {[0, 1, 2].map((column) => (
        <div
          aria-hidden="true"
          className="h-[34rem] w-80 shrink-0 animate-pulse rounded-2xl bg-slate-200/70 p-4 dark:bg-slate-800"
          key={column}
        >
          <div className="mb-5 h-5 w-32 rounded bg-slate-300 dark:bg-slate-700" />
          {[0, 1, 2].map((card) => (
            <div
              className="mb-3 h-24 rounded-xl bg-slate-100 dark:bg-slate-700/70"
              key={card}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
