import { useBoardQuery } from '../../api/board.js';
import { BoardSkeleton } from '../../components/BoardSkeleton.js';
import { Column } from './Column.js';

export function BoardView() {
  const query = useBoardQuery();
  if (!query.data) return <BoardSkeleton />;
  const { board, columns, labels } = query.data;
  const labelsById = new Map(labels.map((label) => [label.id, label]));
  return (
    <main
      aria-labelledby="board-title"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="px-6 pb-4">
        <h1
          className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white"
          id="board-title"
        >
          {board.name}
        </h1>
      </div>
      {columns.length === 0 ? (
        <section className="mx-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          This board has no columns yet.
        </section>
      ) : (
        <div
          aria-label="Board columns"
          className="flex min-h-0 flex-1 gap-4 overflow-x-auto px-6 pb-6"
        >
          {columns.map((column) => (
            <Column column={column} key={column.id} labelsById={labelsById} />
          ))}
        </div>
      )}
    </main>
  );
}
