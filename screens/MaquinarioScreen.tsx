import React, { useState, useEffect, useMemo } from 'react';
import { Maquinario, Usuario } from '../types';
import { getMaquinariosByUsuario, addMaquinario } from '../services/database';
import ScreenWrapper from '../components/ScreenWrapper';
import { formatCurrency } from '../utils/calculations';
import Icon from '../components/Icon';

const MaquinarioForm: React.FC<{
    currentUser: Usuario;
    onClose: () => void;
    onSave: () => void;
}> = ({ currentUser, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Maquinario, 'id'>>({
        usuario_id: currentUser.id,
        nome: '',
        tipo: '',
        valor_inicial: 0,
        vida_util_anos: 10,
        vida_util_horas: 10000,
        valor_residual_percentual: 20,
        segurado: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value) }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMaquinario(formData);
        onSave();
    }
    
    const { valorResidual, depreciacaoAnual } = useMemo(() => {
        const vr = formData.valor_inicial * (formData.valor_residual_percentual / 100);
        const da = formData.vida_util_anos > 0 ? (formData.valor_inicial - vr) / formData.vida_util_anos : 0;
        return { valorResidual: vr, depreciacaoAnual: da };
    }, [formData.valor_inicial, formData.valor_residual_percentual, formData.vida_util_anos]);

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Adicionar Maquinário</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="text" name="nome" placeholder="Nome do Maquinário" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <input type="text" name="tipo" placeholder="Tipo (ex: Trator, Colheitadeira)" value={formData.tipo} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <input type="number" name="valor_inicial" placeholder="Valor de Aquisição (R$)" value={formData.valor_inicial} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="vida_util_anos" placeholder="Vida Útil (anos)" value={formData.vida_util_anos} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                        <input type="number" name="vida_util_horas" placeholder="Vida Útil (horas)" value={formData.vida_util_horas} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     </div>
                     <input type="number" name="valor_residual_percentual" placeholder="Valor Residual (%)" value={formData.valor_residual_percentual} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <div className="flex items-center gap-2"><input type="checkbox" name="segurado" id="segurado" checked={formData.segurado} onChange={handleChange} className="h-4 w-4 rounded" /><label htmlFor="segurado">Possui seguro?</label></div>
                     
                     <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                        <h4 className="font-semibold">Cálculos Automáticos:</h4>
                        <p>Valor Residual: <span className="font-bold">{formatCurrency(valorResidual)}</span></p>
                        <p>Depreciação Anual: <span className="font-bold">{formatCurrency(depreciacaoAnual)}</span></p>
                     </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-epagri-red text-white rounded-md">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MaquinarioScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, showToast }) => {
    const [maquinarios, setMaquinarios] = useState<Maquinario[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const refreshMaquinarios = () => setMaquinarios(getMaquinariosByUsuario(currentUser));
    useEffect(refreshMaquinarios, [currentUser]);
    
    const handleSave = () => {
        showToast("Maquinário adicionado com sucesso!", "success");
        setIsFormOpen(false);
        refreshMaquinarios();
    }

    return (
        <ScreenWrapper title="Maquinário" onNavigateBack={onNavigateBack}>
            {isFormOpen && <MaquinarioForm currentUser={currentUser} onClose={() => setIsFormOpen(false)} onSave={handleSave} />}
            <div className="mb-6 flex justify-end">
                <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-epagri-red text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700">
                    <Icon name="plus" className="w-5 h-5"/> Adicionar Maquinário
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b dark:border-gray-600"><th className="py-2">Nome</th><th>Tipo</th><th>Segurado</th><th className="text-right">Valor</th></tr></thead>
                        <tbody>
                            {maquinarios.length > 0 ? maquinarios.map(m => 
                                <tr key={m.id} className="border-b dark:border-gray-700">
                                    <td className="py-2">{m.nome}</td>
                                    <td>{m.tipo}</td>
                                    <td>{m.segurado ? 'Sim' : 'Não'}</td>
                                    <td className="text-right">{formatCurrency(m.valor_inicial)}</td>
                                </tr>
                            ) : (
                                <tr><td colSpan={4} className="text-center py-4">Nenhum maquinário registrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScreenWrapper>
    );
};

export default MaquinarioScreen;