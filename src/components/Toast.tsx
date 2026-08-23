import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  const { isRTL } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'error':
        return <XCircle className='h-5 w-5 text-red-500' />;
      case 'warning':
        return <AlertCircle className='h-5 w-5 text-yellow-500' />;
      case 'info':
        return <Info className='h-5 w-5 text-blue-500' />;
      default:
        return <Info className='h-5 w-5 text-blue-500' />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'toast toast-success bg-green-50 border-green-200';
      case 'error':
        return 'toast toast-error bg-red-50 border-red-200';
      case 'warning':
        return 'toast toast-warning bg-yellow-50 border-yellow-200';
      case 'info':
        return 'toast toast-info bg-blue-50 border-blue-200';
      default:
        return 'toast toast-info bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg max-w-sm w-full transform transition-all duration-300 ease-in-out ${isRTL ? 'mr-4' : 'ml-4'}`}
      role='alert'
    >
      <div
        className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}
      >
        <div className='flex-shrink-0'>{getIcon()}</div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-gray-900'>{message}</p>
        </div>
        <div className='flex-shrink-0'>
          <button
            onClick={() => onClose(id)}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
