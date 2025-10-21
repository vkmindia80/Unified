import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  error, 
  helperText,
  icon: Icon,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={type}
          className={`block w-full rounded-lg border ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-primary-700 focus:ring-corporate-500 focus:border-corporate-500'
          } ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm bg-white dark:bg-primary-800 text-primary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${className}`}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${
          error ? 'text-red-600 dark:text-red-400' : 'text-primary-500 dark:text-primary-400'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
