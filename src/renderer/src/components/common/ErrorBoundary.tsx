import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../ui/Button'
import { Eyebrow } from '../editorial/Eyebrow'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Top-level error boundary. A rendering crash shows a calm editorial recovery
 * screen — never a white void or a raw stack trace.
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
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-surface-base px-10 text-center">
        <Eyebrow>Unexpected error</Eyebrow>
        <h1 className="display text-3xl text-content-primary">Something went wrong</h1>
        <p className="max-w-sm text-sm leading-relaxed text-content-secondary">
          EarthScope hit an unexpected error. Reloading usually resolves it.
        </p>
        <Button variant="primary" arrow onClick={this.handleReload}>
          Reload EarthScope
        </Button>
      </div>
    )
  }
}
