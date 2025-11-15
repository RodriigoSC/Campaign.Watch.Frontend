import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // 1. Não está logado, manda para o login
    return <Navigate to="/login" replace />;
  }

  if (user?.Role !== 'Admin') { // Note: A API retorna 'Role' (PascalCase)
    // 2. Está logado, MAS NÃO É ADMIN, manda para o dashboard (ou "acesso negado")
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Está logado E É ADMIN
  return children;
};

export default AdminRoute;