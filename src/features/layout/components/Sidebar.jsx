import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Home, BarChart2, Users, Bell, Settings, Shield } from 'lucide-react'; // Removido Chevrons
import { cn } from '../../../shared/utils';
import { useAuthStore } from '../../../store/authStore';

const navItems = [
// ... (código existente ... )
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/campaigns', icon: BarChart2, label: 'Campanhas' },
  { to: '/clients', icon: Users, label: 'Clientes', adminOnly: true },
  { to: '/alerts', icon: Bell, label: 'Alertas' },
  { to: '/users', icon: Shield, label: 'Usuários', adminOnly: true },
  { to: '/settings', icon: Settings, label: 'Configurações', adminOnly: false },
];

// ATUALIZADO: A sidebar não controla mais o toggle
const Sidebar = ({ isCollapsed }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Seção do Logo ATUALIZADA */}
      <div className={cn(
        "flex items-center h-16 flex-shrink-0 border-b px-4",
        isCollapsed ? "justify-center" : "justify-start px-6"
      )}>
        {/* Ícone do Logo (Sempre visível) */}
        <div className="flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 text-white font-bold rounded-lg w-10 h-10 text-xl flex-shrink-0">
          CW
        </div>
        
        {/* Texto do Logo (Aparece/desaparece) */}
        <div 
          className={cn(
            "ml-3 transition-all duration-200 overflow-hidden",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Campaign Watch</h1>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-grow px-2 py-4">
        <ul>
          {navItems.filter(item => !item.adminOnly || (item.adminOnly && isAdmin)).map((item) => (
            <li key={item.to} className="relative">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 py-3 rounded-lg transition-colors mb-2 group',
                    isCollapsed ? 'justify-center' : 'px-4',
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  )
                }
              >
                <item.icon size={20} />
                <span
                  className={cn(
                    'whitespace-nowrap transition-opacity',
                    isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                  )}
                >
                  {item.label}
                </span>
                {/* Tooltip */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-10">
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botão para Recolher/Expandir FOI REMOVIDO DAQUI */}
    </aside>
  );
};

// ATUALIZADO: Validação das props
Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
};

export default Sidebar;