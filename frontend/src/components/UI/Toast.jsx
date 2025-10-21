import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      icon: FiCheckCircle,
      colors: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      iconColor: 'text-green-500',
    },
    error: {
      icon: FiXCircle,
      colors: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: FiAlertCircle,
      colors: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: FiInfo,
      colors: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-500',
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg border ${config.colors} shadow-lg animate-slide-up`}>
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
