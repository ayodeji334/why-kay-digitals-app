import React from "react";
import RequestErrorState from "./RequestErrorState";

type Props = {
  children: React.ReactNode;
  /** Headline on the error screen. */
  title?: string;
  /** Shown under the headline. */
  message?: string;
};

type State = { error: Error | null };

/**
 * Catches errors thrown while rendering (e.g. reading a property of undefined
 * data) and shows an error screen with "Try again" instead of crashing the
 * whole app. "Try again" re-renders the children from scratch.
 *
 * Note: error boundaries only catch render/lifecycle errors. Errors in event
 * handlers and async code must still be handled where they happen.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Visible in debug builds (release builds strip console output).
    console.error("Screen crashed:", error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <RequestErrorState
        title={this.props.title ?? "Something went wrong"}
        message={
          this.props.message ??
          "This page ran into a problem and couldn't be displayed. Try again, or go back and continue using the app."
        }
        onRetry={this.reset}
      />
    );
  }
}
