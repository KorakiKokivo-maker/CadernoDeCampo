import React, { useState, useEffect, useMemo } from 'react';
import { Benfeitoria, Usuario } from '../types';
import { getBenfeitoriasByUsuario, addBenfeitoria } from '../services/database';
import ScreenWrapper from '../components/ScreenWrapper';
import { formatDate, formatCurrency } from '../utils/calculations';
import Icon from '../components/Icon';

const BenfeitoriaForm: React.FC<{
    currentUser: Usuario;
    onClose: () => void;
    onSave: () => void;
}> = ({ currentUser, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Benfeitoria, 'id'>>({
        usuario_id: currentUser.id,
        nome: '',
        descricao: '',
        valor_total: 0,
        num_parcelas: 1,
        data_inicio_pagamento: new Date().toISOString().split('T')[0],
        parcelas_pagas: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addBenfeitoria(formData);
        onSave();
    }
    
    const { valorParcela, saldoPagar } = useMemo(() => {
        const vp = formData.num_parcelas && formData.num_parcelas > 0 ? formData.valor_total / formData.num_parcelas : formData.valor_total;
        const sp = formData.valor_total - (vp * formData.parcelas_pagas);
        return { valorParcela: vp, saldoPagar: sp };
    }, [formData]);

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Adicionar Benfeitoria</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="text" name="nome" placeholder="Nome da Benfeitoria (ex: Silo, Galpão)" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <textarea name="descricao" placeholder="Descrição (opcional)" value={formData.descricao} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <input type="number" name="valor_total" placeholder="Valor Total (R$)" value={formData.valor_total} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="num_parcelas" placeholder="Nº de Parcelas" value={formData.num_parcelas} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                        <input type="number" name="parcelas_pagas" placeholder="Parcelas Pagas" value={formData.parcelas_pagas} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     </div>
                     <input type="date" name="data_inicio_pagamento" value={formData.data_inicio_pagamento} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     
                     <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                        <h4 className="font-semibold">Cálculos:</h4>
                        <p>Valor da Parcela: <span className="font-bold">{formatCurrency(valorParcela)}</span></p>
                        <p>Saldo a Pagar: <span className="font-bold">{formatCurrency(saldoPagar)}</span></p>
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

const BenfeitoriasScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, showToast }) => {
    const [benfeitorias, setBenfeitorias] = useState<Benfeitoria[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const refreshBenfeitorias = () => setBenfeitorias(getBenfeitoriasByUsuario(currentUser));
    useEffect(refreshBenfeitorias, [currentUser]);

    const handleSave = () => {
        showToast("Benfeitoria adicionada com sucesso!", "success");
        setIsFormOpen(false);
        refreshBenfeitorias();
    }

    return (
        <ScreenWrapper title="Benfeitorias e Estruturas" onNavigateBack={onNavigateBack}>
            {isFormOpen && <BenfeitoriaForm currentUser={currentUser} onClose={() => setIsFormOpen(false)} onSave={handleSave} />}
             <div className="mb-6 flex justify-end">
                <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-epagri-red text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700">
                    <Icon name="plus" className="w-5 h-5"/> Adicionar Benfeitoria
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b dark:border-gray-600"><th className="py-2">Nome</th><th>Parcelas</th><th>Início Pgto.</th><th className="text-right">Valor Total</th></tr></thead>
                        <tbody>
                            {benfeitorias.length > 0 ? benfeitorias.map(b => 
                                <tr key={b.id} className="border-b dark:border-gray-700">
                                    <td className="py-2">{b.nome}</td>
                                    <td>{b.parcelas_pagas} / {b.num_parcelas || 1}</td>
                                    <td>{formatDate(b.data_inicio_pagamento)}</td>
                                    <td className="text-right">{formatCurrency(b.valor_total)}</td>
                                </tr>
                            ) : (
                                <tr><td colSpan={4} className="text-center py-4">Nenhuma benfeitoria registrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScreenWrapper>
    );
};

export default BenfeitoriasScreen;