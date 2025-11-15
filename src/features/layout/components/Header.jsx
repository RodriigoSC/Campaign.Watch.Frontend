// src/features/layout/components/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { LogOut, User, Bell, Menu, X } from 'lucide-react'; // Importado Menu e X
import PropTypes from 'prop-types'; // Importado PropTypes
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';
import { cn } from '../../../shared/utils'; // Importado cn

const mockNotifications = [
// ... (código existente ... )
  { id: 1, type: 'error', title: 'Falha na Campanha #104', message: 'A campanha "Black Friday Antecipada" encontrou um erro de integração.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
  { id: 2, type: 'delayed', title: 'Execução Atrasada', message: 'A campanha de Inverno está com 1 hora de atraso na execução.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false },
  { id: 3, type: 'success', title: 'Campanha #101 Concluída', message: 'A "Campanha de Verão 2024" foi monitorada com sucesso.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), read: true },
];

// ATUALIZADO: Recebendo props para controlar a sidebar
const Header = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuthStore();
// ... (código existente ... )
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
// ... (código existente ... )
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
// ... (código existente ... )
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* ATUALIZADO: padding py-3 para um header mais fino */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* --- NOVO: Botão de Toggle da Sidebar --- */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors",
                // Adiciona margem à direita apenas se a sidebar estiver recolhida
                isCollapsed ? "mr-2" : "mr-4" 
              )}
              aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {/* Animação de entrada/saída dos ícones */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Menu 
                  size={20} 
                  className={cn(
                    "transition-all duration-300 absolute",
                    isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  )}
                />
                <X 
                  size={20} 
                  className={cn(
                    "transition-all duration-300 absolute",
                    isCollapsed ? "opacity-0 scale-50" : "opacity-100 scale-100"
                  )}
                />
              </div>
            </button>
            
          </div>

          {/* --- Direita: Notificações, Perfil, Sair --- */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              {isPanelOpen && <NotificationPanel notifications={notifications} />}
            </div>

            {/* Separador visual */}
            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
              <span className="hidden xl:inline text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ATUALIZADO: Adicionando validação das novas props
Header.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Header;