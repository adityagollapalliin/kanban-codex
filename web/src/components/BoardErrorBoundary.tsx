import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly onReset: () => void;
}
interface State {
  readonly hasError: boolean;
}

export class BoardErrorBoundary extends Component<Props, State> {
  public override state: State = { hasError: false };
  public static getDerivedStateFromError(_error: unknown): State {
    return { hasError: true };
  }
  public override componentDidCatch(_error: unknown, _info: ErrorInfo): void {
    // React diagnostics retain details; the user-facing fallback stays intentionally generic.
  }
  public override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <section
        className="mx-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        role="alert"
      >
        <h2 className="text-lg font-bold">The board could not be loaded</h2>
        <p className="mt-1 text-sm opacity-80">
          Check that the server is running, then try again.
        </p>
        <button
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          onClick={this.reset}
          type="button"
        >
          Retry
        </button>
      </section>
    );
  }
  private readonly reset = () => {
    this.props.onReset();
    this.setState({ hasError: false });
  };
}
