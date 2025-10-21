import React from 'react';

const Select = ({ 
  label, 
  options = [], 
  error, 
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
      
      <select
        className={`block w-full rounded-lg border ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-primary-700 focus:ring-corporate-500 focus:border-corporate-500'
        } px-4 py-2.5 text-sm bg-white dark:bg-primary-800 text-primary-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
