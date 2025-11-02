import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mapeia o tipo de notificação para um ícone e cor
const notificationTypes = {
  error: {
    icon: AlertCircle,
    color: 'text-error-500',
  },
  delayed: {
    icon: Clock,
    color: 'text-warning-500',
  },
  success: {
    icon: CheckCircle,
    color: 'text-success-500',
  },
};

const NotificationPanel = ({ notifications }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Notificações</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notif) => {
              const typeInfo = notificationTypes[notif.type] || notificationTypes.error;
              const Icon = typeInfo.icon;
              return (
                <li key={notif.id} className={`p-4 hover:bg-gray-50 border-b ${!notif.read ? 'bg-primary-50' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <Icon className={`${typeInfo.color} h-5 w-5 mt-0.5`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-8 text-center text-sm text-gray-500">Nenhuma notificação nova.</p>
        )}
      </div>
      <div className="p-2 bg-gray-50 text-center rounded-b-lg">
        <Link to="/alerts" className="text-sm font-medium text-primary-600 hover:underline">
          Ver todas as configurações
        </Link>
      </div>
    </div>
  );
};

NotificationPanel.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['error', 'delayed', 'success']).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
    })
  ).isRequired,
};

export default NotificationPanel;