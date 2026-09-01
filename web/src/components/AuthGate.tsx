import {
  useEffect,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { loginResponseSchema } from '@kanban/shared';
import { useQueryClient } from '@tanstack/react-query';

import { boardQueryKey } from '../api/board.js';
import { sendJson } from '../api/client.js';
import { BoardSkeleton } from './BoardSkeleton.js';

interface Props {
  readonly children: ReactNode;
}

export function AuthGate({ children }: Props) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [required, setRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    void fetch('/api/board', { headers: { Accept: 'application/json' } })
      .then((response) => {
        setRequired(response.status === 401);
        setChecking(false);
      })
      .catch(() => {
        setChecking(false);
      });
  }, []);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await sendJson(
        '/api/auth/login',
        'POST',
        { password },
        loginResponseSchema,
      );
      setRequired(false);
      setPassword('');
      await queryClient.invalidateQueries({ queryKey: boardQueryKey });
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Login failed');
    }
  }
  if (checking) return <BoardSkeleton />;
  if (!required) return <>{children}</>;
  return (
    <main className="grid min-h-0 flex-1 place-items-center p-6">
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <h1 className="text-xl font-black">Sign in to Kanban</h1>
        <label className="block space-y-1 text-sm font-semibold">
          Password
          <input
            aria-label="Password"
            autoFocus
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            type="password"
            value={password}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          className="w-full rounded-lg bg-sky-600 px-4 py-2 font-bold text-white disabled:opacity-40"
          disabled={!password}
          type="submit"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
