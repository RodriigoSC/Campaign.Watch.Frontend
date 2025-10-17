import { useState, useEffect, useRef } from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';

// Dados de exemplo para as notificações
const mockNotifications = [
  { id: 1, type: 'error', title: 'Falha na Campanha #104', message: 'A campanha "Black Friday Antecipada" encontrou um erro de integração.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
  { id: 2, type: 'delayed', title: 'Execução Atrasada', message: 'A campanha de Inverno está com 1 hora de atraso na execução.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false },
  { id: 3, type: 'success', title: 'Campanha #101 Concluída', message: 'A "Campanha de Verão 2024" foi monitorada com sucesso.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), read: true },
];

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Lógica para fechar o painel ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verifica se o clique foi fora do elemento referenciado
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
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-1.5">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CW</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campaign Watch</h1>
                <p className="text-xs text-gray-500">Sistema de Monitoramento</p>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* --- Container das Notificações --- */}
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

            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden md:inline text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;