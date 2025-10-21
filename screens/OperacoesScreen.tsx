import React, { useState, useEffect, useMemo } from 'react';
import { Safra, Usuario, OperacaoCampo, TipoOperacao, Produto } from '../types';
import { getSafrasByUsuario, getOperacoesBySafra, addOperacao, getProdutos } from '../services/database';
import ScreenWrapper from '../components/ScreenWrapper';
import { formatDate, formatCurrency } from '../utils/calculations';
import Icon from '../components/Icon';

const tiposOperacao: TipoOperacao[] = [
    'Plantio',
    'Defensivo',
    'Adubação e Correção',
    'Irrigação',
    'Preparo do Solo',
    'Tratamento Adicional',
    'Tratos Culturais',
    'Outra'
];

// Form Component
const OperacaoForm: React.FC<{
    safraId: number;
    onClose: () => void;
    onSave: () => void;
}> = ({ safraId, onClose, onSave }) => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [formData, setFormData] = useState<Omit<OperacaoCampo, 'id'>>({
        safra_id: safraId,
        data: new Date().toISOString().split('T')[0],
        tipo: 'Plantio',
        custo: 0,
    });

    useEffect(() => {
        setProdutos(getProdutos());
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = ['custo', 'dose', 'volume_calda', 'ph_agua', 'carencia_dias', 'produto_id', 'tempo_irrigacao'].includes(name);
        setFormData(prev => ({...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addOperacao(formData);
        onSave();
    }

    const renderDynamicFields = () => {
        switch (formData.tipo) {
            case 'Defensivo':
            case 'Adubação e Correção':
                return (
                    <>
                        <select name="produto_id" value={formData.produto_id || ''} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700">
                            <option value="">Selecione um Produto</option>
                            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                        <input type="number" step="0.01" name="dose" placeholder="Dose (unidade/ha)" value={formData.dose || ''} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                        <input type="number" step="0.01" name="volume_calda" placeholder="Volume de Calda (L/ha)" value={formData.volume_calda || ''} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    </>
                );
            case 'Irrigação':
                return (
                    <>
                        <input type="text" name="metodo_irrigacao" placeholder="Método de Irrigação" value={formData.metodo_irrigacao || ''} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                        <input type="number" step="0.1" name="tempo_irrigacao" placeholder="Tempo (horas)" value={formData.tempo_irrigacao || ''} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Registrar Operação de Campo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="date" name="data" value={formData.data} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <select name="tipo" value={formData.tipo} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700">
                        {tiposOperacao.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     
                     {renderDynamicFields()}
                     
                     <textarea name="observacoes" placeholder="Observações" value={formData.observacoes || ''} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <input type="number" step="0.01" name="custo" placeholder="Custo Total (R$)" value={formData.custo || 0} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-epagri-red text-white rounded-md">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Screen Component
const OperacoesScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, showToast }) => {
    const [safras, setSafras] = useState<Safra[]>([]);
    const [selectedSafraId, setSelectedSafraId] = useState<number | null>(null);
    const [operacoes, setOperacoes] = useState<OperacaoCampo[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [produtos, setProdutos] = useState<Produto[]>([]);

    const refreshOperacoes = () => {
        if(selectedSafraId) {
            const ops = getOperacoesBySafra(selectedSafraId);
            const opsComNomeProduto = ops.map(op => ({
                ...op,
                nome_produto: op.produto_id ? produtos.find(p => p.id === op.produto_id)?.nome : undefined
            }))
            setOperacoes(opsComNomeProduto);
        }
    };

    useEffect(() => {
        const userSafras = getSafrasByUsuario(currentUser);
        setSafras(userSafras);
        setProdutos(getProdutos());
        if (userSafras.length > 0 && !selectedSafraId) {
            setSelectedSafraId(userSafras[0].id);
        }
    }, [currentUser]);
    
    useEffect(() => {
        if (selectedSafraId) {
            refreshOperacoes();
        }
    }, [selectedSafraId, produtos]);
    
    const handleSave = () => {
        showToast("Operação registrada com sucesso!", "success");
        setIsFormOpen(false);
        refreshOperacoes();
    };
    
    const totalCustoOperacoes = useMemo(() => {
        return operacoes.reduce((acc, op) => acc + op.custo, 0);
    }, [operacoes]);

    return (
        <ScreenWrapper title="Operações de Campo" onNavigateBack={onNavigateBack}>
            {isFormOpen && selectedSafraId && <OperacaoForm safraId={selectedSafraId} onClose={() => setIsFormOpen(false)} onSave={handleSave} />}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Selecione a Safra</label>
                <select className="block w-full rounded-md dark:bg-gray-700" value={selectedSafraId ?? ''} onChange={(e) => setSelectedSafraId(Number(e.target.value))}>
                    {safras.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
            </div>
            
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Custo Total: {formatCurrency(totalCustoOperacoes)}</h3>
                <button disabled={!selectedSafraId} onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-epagri-red text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400">
                    <Icon name="plus" className="w-5 h-5"/> Registrar Operação
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr><th className="py-2">Data</th><th>Tipo</th><th>Detalhes</th><th className="text-right">Custo</th></tr></thead>
                        <tbody>
                            {operacoes.length > 0 ? operacoes.map(op => 
                                <tr key={op.id}>
                                    <td>{formatDate(op.data)}</td>
                                    <td>{op.tipo}</td>
                                    <td>{op.nome_produto || op.observacoes || '-'}</td>
                                    <td className="text-right">{formatCurrency(op.custo)}</td>
                                </tr>
                            ) : (
                                <tr><td colSpan={4} className="text-center py-4">Nenhuma operação registrada para esta safra.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScreenWrapper>
    );
};

export default OperacoesScreen;
