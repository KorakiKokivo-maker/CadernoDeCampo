import React from 'react';
import Icon from './Icon';

interface ScreenWrapperProps {
  title: string;
  onNavigateBack: () => void;
  children: React.ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ title, onNavigateBack, children }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center mb-6 gap-4">
        <button 
          onClick={onNavigateBack} 
          className="flex-shrink-0 flex items-center gap-2 text-gray-700 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
          aria-label="Voltar"
        >
          <Icon name="arrow-left" className="w-6 h-6" />
          <span className="hidden sm:inline font-semibold">Voltar</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white truncate">{title}</h1>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default ScreenWrapper;