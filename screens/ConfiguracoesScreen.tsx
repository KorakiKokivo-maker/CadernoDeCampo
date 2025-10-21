import React, { useState, useEffect } from 'react';
import { Usuario } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import Icon from '../components/Icon';
import { getDieselPrice, setDieselPrice } from '../services/database';

const ConfiguracoesScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, theme, setTheme, showToast }) => {
  const [dieselPrice, setLocalDieselPrice] = useState(0);

  useEffect(() => {
    setLocalDieselPrice(getDieselPrice());
  }, []);

  const handleSaveDieselPrice = () => {
    setDieselPrice(dieselPrice);
    showToast("Preço do diesel atualizado!", "success");
  }

  return (
    <ScreenWrapper title="Configurações" onNavigateBack={onNavigateBack}>
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Informações do Usuário</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label><p className="text-lg">{currentUser.nome}</p></div>
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Nome de Usuário</label><p className="text-lg">{currentUser.nome_de_usuario}</p></div>
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Perfil</label><p className="text-lg">{currentUser.perfil}</p></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Parâmetros Gerais</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="diesel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço atual do diesel (R$/L)</label>
              <div className="mt-1 flex gap-2">
                <input type="number" step="0.01" id="diesel" value={dieselPrice} onChange={e => setLocalDieselPrice(parseFloat(e.target.value))} className="block w-full max-w-xs rounded-md dark:bg-gray-700" />
                <button onClick={handleSaveDieselPrice} className="px-4 py-2 bg-epagri-red text-white rounded-md">Salvar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <h3 className="text-xl font-bold mb-4">Tema do Aplicativo</h3>
             <div className="flex items-center gap-4">
                <button onClick={() => setTheme('light')} className={`flex items-center gap-2 p-2 rounded-md border-2 ${theme === 'light' ? 'border-epagri-red bg-epagri-red/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <Icon name="sun" className="w-5 h-5"/> Claro
                </button>
                 <button onClick={() => setTheme('dark')} className={`flex items-center gap-2 p-2 rounded-md border-2 ${theme === 'dark' ? 'border-epagri-red bg-epagri-red/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <Icon name="moon" className="w-5 h-5"/> Escuro
                </button>
             </div>
        </div>

      </div>
    </ScreenWrapper>
  );
};

export default ConfiguracoesScreen;