import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // 1. Importar PropTypes
import { useAuthStore } from '../../../store/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // 1. Não está logado, manda para o login
    return <Navigate to="/login" replace />;
  }

  // Verificação de 'role' (camelCase)
  if (user?.role !== 'Admin') { 
    // 2. Está logado, MAS NÃO É ADMIN, manda para o dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Está logado E É ADMIN
  return children;
};

// 2. Adicionar bloco de validação para 'children' para corrigir o erro do ESLint
AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;