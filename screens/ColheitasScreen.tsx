import React, { useState, useEffect, useMemo } from 'react';
import { Safra, Usuario, Colheita } from '../types';
import { getSafrasByUsuario, getColheitasBySafra, addColheita } from '../services/database';
import ScreenWrapper from '../components/ScreenWrapper';
import { formatDate, formatCurrency } from '../utils/calculations';
import Icon from '../components/Icon';

const ColheitaForm: React.FC<{
    safraId: number;
    onClose: () => void;
    onSave: () => void;
}> = ({ safraId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        safra_id: safraId,
        data: new Date().toISOString().split('T')[0],
        quantidade: 0,
        unidade: 'kg' as 'kg' | 't' | 'saca',
        preco_unitario: 0,
        responsavel: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: (name === 'quantidade' || name === 'preco_unitario') ? parseFloat(value) : value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addColheita(formData);
        onSave();
    }
    
    const totalReceita = formData.quantidade * formData.preco_unitario;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold mb-4">Registrar Colheita</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="date" name="data" value={formData.data} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="quantidade" placeholder="Quantidade" value={formData.quantidade} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                        <select name="unidade" value={formData.unidade} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700">
                            <option value="kg">kg</option>
                            <option value="t">t</option>
                            <option value="saca">saca</option>
                        </select>
                     </div>
                     <input type="number" step="0.01" name="preco_unitario" placeholder="Preço Unitário (R$)" value={formData.preco_unitario} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <input type="text" name="responsavel" placeholder="Responsável" value={formData.responsavel} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     
                     <p className="text-right font-bold">Receita: {formatCurrency(totalReceita)}</p>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-epagri-red text-white rounded-md">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ColheitasScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, showToast }) => {
    const [safras, setSafras] = useState<Safra[]>([]);
    const [selectedSafraId, setSelectedSafraId] = useState<number | null>(null);
    const [colheitas, setColheitas] = useState<Colheita[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const userSafras = getSafrasByUsuario(currentUser);
        setSafras(userSafras);
        if (userSafras.length > 0 && !selectedSafraId) {
            setSelectedSafraId(userSafras[0].id);
        }
    }, [currentUser, selectedSafraId]);

    useEffect(() => {
        if(selectedSafraId) {
            setColheitas(getColheitasBySafra(selectedSafraId));
        }
    }, [selectedSafraId]);
    
    const handleSave = () => {
        showToast("Colheita registrada com sucesso!", "success");
        setIsFormOpen(false);
        if(selectedSafraId) {
            setColheitas(getColheitasBySafra(selectedSafraId));
        }
    };
    
    const totalReceitaSafra = useMemo(() => {
        return colheitas.reduce((acc, c) => acc + (c.quantidade * c.preco_unitario), 0);
    }, [colheitas]);

    return (
        <ScreenWrapper title="Colheitas" onNavigateBack={onNavigateBack}>
            {isFormOpen && selectedSafraId && <ColheitaForm safraId={selectedSafraId} onClose={() => setIsFormOpen(false)} onSave={handleSave} />}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Selecione a Safra</label>
                <select className="block w-full rounded-md dark:bg-gray-700" value={selectedSafraId ?? ''} onChange={(e) => setSelectedSafraId(Number(e.target.value))}>
                    {safras.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
            </div>
            
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Receita Total: {formatCurrency(totalReceitaSafra)}</h3>
                <button disabled={!selectedSafraId} onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-epagri-red text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400">
                    <Icon name="plus" className="w-5 h-5"/> Registrar Colheita
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr><th className="py-2">Data</th><th>Quantidade</th><th className="text-right">Preço Unit.</th><th className="text-right">Total</th></tr></thead>
                        <tbody>
                            {colheitas.length > 0 ? colheitas.map(c => 
                                <tr key={c.id}>
                                    <td>{formatDate(c.data)}</td>
                                    <td>{c.quantidade} {c.unidade}</td>
                                    <td className="text-right">{formatCurrency(c.preco_unitario)}</td>
                                    <td className="text-right">{formatCurrency(c.quantidade * c.preco_unitario)}</td>
                                </tr>
                            ) : (
                                <tr><td colSpan={4} className="text-center py-4">Nenhuma colheita registrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScreenWrapper>
    );
};

export default ColheitasScreen;
