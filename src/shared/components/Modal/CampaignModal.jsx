import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { cn } from '../../utils';

const CampaignModal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Fundo escuro cobrindo toda a tela */}
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true"></div>

      {/* Container do modal */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full flex flex-col overflow-hidden',
          sizes[size],
          'max-h-[calc(90vh-2rem)] mx-4 my-4' // Substitui m-4 por margens horizontais/verticais controladas
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

CampaignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl']),
};

export default CampaignModal;
