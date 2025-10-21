import React, { useEffect, useState } from 'react';
import Icon from './Icon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out transition
    }, 2700);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const iconName = type === 'success' ? 'check-circle' : 'exclamation-circle';

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} transition-transform duration-300 transform ${visible ? 'translate-x-0' : 'translate-x-[calc(100%+20px)]'}`}
      role="alert"
    >
      <Icon name={iconName} className="w-6 h-6 mr-3" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/20" aria-label="Fechar">
         <Icon name="x-mark" className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
