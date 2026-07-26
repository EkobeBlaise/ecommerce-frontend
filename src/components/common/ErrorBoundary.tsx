import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Something went wrong</h2>
            <p className="text-gray-500 mb-4">We're sorry, but there was an error loading this content.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
