import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1c1c1a] border border-[#e5e3dc] dark:border-[#2d2d2a] rounded-2xl shadow-card text-center gap-4 max-w-lg mx-auto my-auto">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 text-[#b91c1c] dark:text-[#f87171] rounded-2xl border border-red-200 dark:border-red-900/40">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#141413] dark:text-[#faf9f5]">
              Ocurrió un problema al cargar esta sección
            </h3>
            <p className="text-xs text-[#73726c] dark:text-[#a3a199] mt-1 max-w-md">
              {this.state.error?.message || 'Error inesperado en el renderizado de la vista.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={this.handleRetry}
            icon={RefreshCw}
          >
            Reintentar Cargar Vista
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
