import { cn } from '../../utils';

// eslint-disable-next-line react/prop-types
const Input = ({ label, id, className = '', ...props }) => {
  const inputId = id || `input-${Math.random()}`;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;