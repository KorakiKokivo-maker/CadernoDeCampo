import React, { useState, useEffect } from 'react';
import { Safra, Usuario, Propriedade } from '../types';
import { getSafrasByUsuario, addSafra, getPropriedadesByUsuario, inativateSafra } from '../services/database';
import ScreenWrapper from '../components/ScreenWrapper';
import { formatDate } from '../utils/calculations';
import Icon from '../components/Icon';

const SafraForm: React.FC<{
    currentUser: Usuario;
    onClose: () => void;
    onSave: () => void;
}> = ({ currentUser, onClose, onSave }) => {
    const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
    const [formData, setFormData] = useState({
        usuario_id: currentUser.id,
        propriedade_id: 0,
        nome: '',
        cultura: '',
        variedade: '',
        area_ha: 0,
        data_inicio: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const userPropriedades = getPropriedadesByUsuario(currentUser);
        setPropriedades(userPropriedades);
        if (userPropriedades.length > 0) {
            setFormData(prev => ({...prev, propriedade_id: userPropriedades[0].id}));
        }
    }, [currentUser]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'area_ha' || name === 'propriedade_id' ? parseFloat(value) : value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.propriedade_id === 0) {
            alert("Por favor, selecione uma propriedade.");
            return;
        }
        addSafra(formData);
        onSave();
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 overflow-y-auto max-h-screen">
                <h2 className="text-2xl font-bold mb-4">Nova Safra</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="nome" placeholder="Nome da Safra (ex: Soja Verão 23/24)" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    <select name="propriedade_id" value={formData.propriedade_id} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700">
                        {propriedades.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                    <input type="text" name="cultura" placeholder="Cultura" value={formData.cultura} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    <input type="text" name="variedade" placeholder="Variedade" value={formData.variedade} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    <input type="number" step="0.1" name="area_ha" placeholder="Área (ha)" value={formData.area_ha} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    <input type="date" name="data_inicio" value={formData.data_inicio} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-epagri-red text-white rounded-md">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SafrasScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, showToast }) => {
    const [safras, setSafras] = useState<Safra[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [safraToDelete, setSafraToDelete] = useState<Safra | null>(null);

    const refreshSafras = () => {
        setSafras(getSafrasByUsuario(currentUser));
    }

    useEffect(refreshSafras, [currentUser]);

    const handleSave = () => {
        showToast("Safra adicionada com sucesso!", "success");
        setIsFormOpen(false);
        refreshSafras();
    };
    
    const handleInactivate = () => {
        if (safraToDelete) {
            inativateSafra(safraToDelete.id);
            showToast("Safra inativada com sucesso!", "success");
            setSafraToDelete(null);
            refreshSafras();
        }
    };

    const activeSafras = safras.filter(s => s.ativa);
    const inactiveSafras = safras.filter(s => !s.ativa);

    return (
        <ScreenWrapper title="Minhas Safras" onNavigateBack={onNavigateBack}>
            {isFormOpen && <SafraForm currentUser={currentUser} onClose={() => setIsFormOpen(false)} onSave={handleSave} />}
            {safraToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
                        <h2 className="text-xl font-bold mb-4">Inativar Safra</h2>
                        <p>Tem certeza de que deseja inativar a safra "{safraToDelete.nome}"? Os dados ainda poderão ser consultados no histórico.</p>
                        <div className="flex justify-end gap-4 pt-4 mt-4">
                            <button onClick={() => setSafraToDelete(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
                            <button onClick={handleInactivate} className="px-4 py-2 bg-red-600 text-white rounded-md">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6 flex justify-end">
                <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-epagri-red text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700">
                    <Icon name="plus" className="w-5 h-5"/> Nova Safra
                </button>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Safras Ativas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSafras.length > 0 ? activeSafras.map(safra => (
                    <div key={safra.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative">
                        <h3 className="text-xl font-bold text-epagri-red mb-2">{safra.nome}</h3>
                        <p><strong>Cultura:</strong> {safra.cultura} ({safra.variedade})</p>
                        <p><strong>Área:</strong> {safra.area_ha} ha</p>
                        <p><strong>Início:</strong> {formatDate(safra.data_inicio)}</p>
                        <button onClick={() => setSafraToDelete(safra)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                            <Icon name="trash" className="w-5 h-5"/>
                        </button>
                    </div>
                )) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Nenhuma safra ativa cadastrada.</p>
                )}
            </div>

            {inactiveSafras.length > 0 && (
                <details className="mt-10">
                    <summary className="text-xl font-semibold cursor-pointer">Safras Inativas (Histórico)</summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 opacity-70">
                        {inactiveSafras.map(safra => (
                            <div key={safra.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">{safra.nome}</h3>
                                <p className="text-sm"><strong>Cultura:</strong> {safra.cultura} ({safra.variedade})</p>
                                <p className="text-sm"><strong>Área:</strong> {safra.area_ha} ha</p>
                                <p className="text-sm"><strong>Período:</strong> {formatDate(safra.data_inicio)} a {formatDate(safra.data_fim || '')}</p>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </ScreenWrapper>
    );
};

export default SafrasScreen;