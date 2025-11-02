import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Home, BarChart2, Users, Bell, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../../utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/campaigns', icon: BarChart2, label: 'Campanhas' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/alerts', icon: Bell, label: 'Alertas' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Seção do Logo */}
      <div className="flex items-center justify-center h-16 flex-shrink-0 border-b px-4">
        <div className={cn("flex items-center justify-center bg-primary-600 text-white font-bold rounded-lg transition-all w-10 h-10 text-xl")}>
          CW
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-grow px-2 py-4">
        <ul>
          {navItems.map((item) => (
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
                {/* Tooltip que aparece ao passar o mouse quando está recolhido */}
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

      {/* Botão para Recolher/Expandir */}
      <div className="border-t p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};

// Adicionando validação das props
Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;