import { cn, getStatusBadgeClass } from '../../utils';

const Badge = ({ children, className = '', variant, status }) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    success: 'bg-success-100 text-success-700 border-success-200',
    error: 'bg-error-100 text-error-700 border-error-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusClass = status ? getStatusBadgeClass(status) : '';
  const variantClass = !status && variant ? variantClasses[variant] : '';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusClass,
        variantClass,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;