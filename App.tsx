import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import SafrasScreen from './screens/SafrasScreen';
import OperacoesScreen from './screens/OperacoesScreen';
import CustosScreen from './screens/CustosScreen';
import ColheitasScreen from './screens/ColheitasScreen';
import ResultadosScreen from './screens/ResultadosScreen';
import RelatoriosScreen from './screens/RelatoriosScreen';
import MaquinarioScreen from './screens/MaquinarioScreen';
import BenfeitoriasScreen from './screens/BenfeitoriasScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';
import CadastroScreen from './screens/CadastroScreen';
import Toast from './components/Toast';
import { Usuario } from './types';

export type Screen = 
  | 'login' 
  | 'cadastro'
  | 'menu' 
  | 'safras' 
  | 'operacoes' 
  | 'custos' 
  | 'colheitas' 
  | 'resultados'
  | 'relatorios'
  | 'maquinario'
  | 'benfeitorias'
  | 'configuracoes';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(localStorage.getItem('theme') as 'light' | 'dark' || 'light');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentScreen('menu');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = (user: Usuario, remember: boolean) => {
    setCurrentUser(user);
    setCurrentScreen('menu');
    if (remember) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
    localStorage.removeItem('currentUser');
    showToast('Logout realizado com sucesso!', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };
  
  const renderScreen = () => {
    if (!currentUser) {
        switch (currentScreen) {
            case 'cadastro':
                return <CadastroScreen onNavigateToLogin={() => setCurrentScreen('login')} onRegister={showToast} />;
            default:
                return <LoginScreen onLogin={handleLogin} onNavigateToCadastro={() => setCurrentScreen('cadastro')} />;
        }
    }

    switch (currentScreen) {
      case 'menu':
        return <MainMenuScreen currentUser={currentUser} onNavigate={setCurrentScreen} onLogout={handleLogout} />;
      case 'safras':
        return <SafrasScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} showToast={showToast} />;
      case 'operacoes':
        return <OperacoesScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} showToast={showToast} />;
      case 'custos':
        return <CustosScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} showToast={showToast} />;
      case 'colheitas':
        return <ColheitasScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} showToast={showToast} />;
      case 'resultados':
        return <ResultadosScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} />;
      case 'relatorios':
        return <RelatoriosScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} showToast={showToast} />;
      case 'maquinario':
        return <MaquinarioScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} showToast={showToast} />;
      case 'benfeitorias':
        return <BenfeitoriasScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} showToast={showToast}/>;
      case 'configuracoes':
        return <ConfiguracoesScreen currentUser={currentUser} onNavigateBack={() => setCurrentScreen('menu')} theme={theme} setTheme={setTheme} showToast={showToast} />;
      default:
        return <LoginScreen onLogin={handleLogin} onNavigateToCadastro={() => setCurrentScreen('cadastro')} />;
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-epagri-dark min-h-screen text-gray-900 dark:text-gray-100">
      {renderScreen()}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;