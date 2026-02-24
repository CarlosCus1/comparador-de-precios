import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary: Uncaught error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // Report to external service if needed
    if (import.meta.env.PROD) {
      // Here you could send to error reporting service
      console.log('Reporting error to external service...', error);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-grey-50 dark:bg-grey-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-grey-800 rounded-lg shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-grey-900 dark:text-white mb-2">
                ¡Oops! Algo salió mal
              </h1>
              <p className="text-grey-600 dark:text-grey-400">
                Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-3 bg-grey-100 dark:bg-grey-700 rounded-md">
                <p className="text-sm text-grey-800 dark:text-grey-200 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2 bg-grey-600 text-white rounded-md hover:bg-grey-700 transition-colors"
              >
                Recargar Página
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.href = '/'}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar ErrorBoundary fácilmente
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    console.error('Application error:', error, errorInfo);
    
    // Log to external service in production
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error);
    }
  };
};