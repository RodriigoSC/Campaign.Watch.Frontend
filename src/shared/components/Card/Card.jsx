// src/shared/components/Card/Card.jsx
import PropTypes from 'prop-types';
import { cn } from '../../utils';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

CardTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 bg-gray-50 border-t border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};