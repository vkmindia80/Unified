import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
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
          type={inputType}
          className={`block w-full rounded-lg border ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-primary-700 focus:ring-corporate-500 focus:border-corporate-500'
          } ${Icon ? 'pl-10' : 'pl-4'} ${type === 'password' ? 'pr-10' : 'pr-4'} py-2.5 text-sm bg-white dark:bg-primary-800 text-primary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all shadow-sm hover:shadow-md ${className}`}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        )}
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
