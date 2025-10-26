import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="mx-auto text-error-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Algo deu errado
              </h2>
              <p className="text-gray-600 mb-6">
                Desculpe, ocorreu um erro inesperado. Por favor, tente uma das opções abaixo.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-xs font-mono text-error-700 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  Voltar ao Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Recarregar Página
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;