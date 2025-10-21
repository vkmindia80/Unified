import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  headerAction,
  footer,
  padding = true,
  hover = false,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-primary-800 rounded-lg border border-gray-200 dark:border-primary-700 shadow-sm ${
        hover ? 'hover:shadow-medium transition-shadow duration-200' : ''
      } ${className}`}
      {...props}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-primary-700 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-primary-700 bg-gray-50 dark:bg-primary-900 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
