// src/features/clients/components/ClientFilter.jsx

import { Search } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Um componente de input controlado para filtrar a lista de clientes.
 * Ele não gerencia estado local, apenas repassa as mudanças.
 */
const ClientFilter = ({ filter, onFilterChange }) => {
  return (
    <div className="relative w-full md:w-1/2 lg:w-1/3">
      {/* Ícone de busca dentro do input */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>

      {/* Input de filtro */}
      <input
        type="text"
        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
        placeholder="Filtrar por nome, ID ou Project ID..."
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
      />
    </div>
  );
};

// Validando as props
ClientFilter.propTypes = {
  /** O valor atual do campo de filtro (controlado pelo pai) */
  filter: PropTypes.string.isRequired,
  /** Função de callback chamada quando o valor do filtro muda */
  onFilterChange: PropTypes.func.isRequired,
};

export default ClientFilter;