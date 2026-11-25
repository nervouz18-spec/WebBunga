import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#1C211E] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E5E1D8] rounded-xl p-8 text-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-[#A35047] mx-auto" aria-hidden="true" />
            <h1 className="font-serif text-2xl text-[#1C211E]">Studio Session Interrupted</h1>
            <p className="text-xs text-[#5C615D] leading-relaxed break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reload Studio</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
