import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  headerAction,
  footer,
  padding = true,
  hover = false,
  gradient = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white dark:bg-primary-800 rounded-xl border border-gray-200 dark:border-primary-700 shadow-soft';
  const hoverClasses = hover ? 'hover:shadow-large hover:-translate-y-1 transition-all duration-300 hover-lift' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-primary-800 dark:to-primary-900' : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}
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
        <div className="px-6 py-4 border-t border-gray-200 dark:border-primary-700 bg-gray-50 dark:bg-primary-900 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
