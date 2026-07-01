import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Top-level error boundary. A rendering crash shows a calm recovery screen
 * rather than a white void or a raw stack trace (CLAUDE.md: "Never expose raw
 * stack traces ... provide meaningful recovery paths").
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Renderer crashed:', error, info.componentStack)
  }

  private handleReload = (): void => {
    this.setState({ error: null })
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-surface-base px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-event-volcano/15">
          <AlertTriangle className="h-6 w-6 text-event-volcano" strokeWidth={1.75} />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-base font-semibold text-content-primary">Something went wrong</h1>
          <p className="max-w-sm text-sm text-content-secondary">
            EarthScope hit an unexpected error. Reloading usually resolves it.
          </p>
        </div>
        <Button variant="primary" onClick={this.handleReload}>
          Reload EarthScope
        </Button>
      </div>
    )
  }
}
