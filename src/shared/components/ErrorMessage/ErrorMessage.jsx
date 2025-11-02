// src/shared/components/ErrorMessage/ErrorMessage.jsx
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../Button/Button';
import { Card, CardContent } from '../Card/Card';

const ErrorMessage = ({ title = "Ocorreu um Erro", message, onRetry, className = '' }) => {
  return (
    <Card className={`border-error-200 bg-error-50 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-error-500 mb-4" />
          <h3 className="text-lg font-semibold text-error-800 mb-2">{title}</h3>
          {message && (
            <p className="text-sm text-error-700 mb-6 max-w-md">
              {typeof message === 'string' ? message : JSON.stringify(message)}
            </p>
          )}
          {onRetry && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRetry}
            >
              <RefreshCw size={16} className="mr-2" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

export default ErrorMessage;