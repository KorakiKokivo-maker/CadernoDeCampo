import React from 'react';
import { Usuario } from '../types';
import Icon from '../components/Icon';
import { Screen } from '../App';

interface MainMenuScreenProps {
  currentUser: Usuario;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const menuItems = [
    { screen: 'safras', label: 'Minhas Safras', icon: 'leaf' },
    { screen: 'operacoes', label: 'Operações de Campo', icon: 'wrench-screwdriver' },
    { screen: 'custos', label: 'Custos', icon: 'currency-dollar' },
    { screen: 'colheitas', label: 'Colheitas', icon: 'archive-box' },
    { screen: 'maquinario', label: 'Maquinário', icon: 'truck' },
    { screen: 'benfeitorias', label: 'Benfeitorias', icon: 'building-office-2' },
    { screen: 'resultados', label: 'Resultados', icon: 'chart-pie' },
    { screen: 'relatorios', label: 'Relatórios', icon: 'document-text' },
    { screen: 'configuracoes', label: 'Configurações', icon: 'cog-6-tooth' },
];

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ currentUser, onNavigate, onLogout }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Caderno de Campo</h1>
                <p className="text-gray-600 dark:text-gray-300">Bem-vindo, {currentUser.nome}!</p>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Icon name="arrow-left-on-rectangle" className="w-6 h-6" />
                <span className="hidden sm:inline">Sair</span>
            </button>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {menuItems.map(item => (
                <button
                    key={item.screen}
                    onClick={() => onNavigate(item.screen as Screen)}
                    className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-200 ease-in-out"
                >
                    <div className="p-4 bg-epagri-red/10 rounded-full mb-4">
                        <Icon name={item.icon} className="w-8 h-8 text-epagri-red" />
                    </div>
                    <span className="text-center font-semibold text-gray-700 dark:text-gray-200">{item.label}</span>
                </button>
            ))}
        </div>
    </div>
  );
};

export default MainMenuScreen;