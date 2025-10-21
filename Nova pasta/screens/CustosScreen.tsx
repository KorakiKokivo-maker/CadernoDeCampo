import React, { useState, useEffect, useMemo } from 'react';
import { Safra, Usuario, CustoVariavel, CustoFixo, TipoCustoVariavel, TipoCustoFixo } from '../types';
import { getSafrasByUsuario, getCustosVariaveisBySafra, addCustoVariavel, getCustosFixosByUsuario, addCustoFixo, getMaquinariosByUsuario, getBenfeitoriasByUsuario } from '../services/database';
import ScreenWrapper from '../components/ScreenWrapper';
import { formatDate, formatCurrency, calculateDepreciacaoAnualMaquinario, calculateCustoAnualBenfeitorias } from '../utils/calculations';
import Icon from '../components/Icon';

// --- Custo Variavel Form ---
const CustoVariavelForm: React.FC<{ safraId: number; onClose: () => void; onSave: () => void; }> = ({ safraId, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<CustoVariavel, 'id'>>({ safra_id: safraId, data: new Date().toISOString().split('T')[0], tipo: 'Mão de Obra', descricao: '', valor: 0 });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'valor' ? parseFloat(value) : value }));
    }
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addCustoVariavel(formData); onSave(); }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold mb-4">Registrar Custo Variável</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="date" name="data" value={formData.data} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <select name="tipo" value={formData.tipo} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700">
                        {['Mão de Obra', 'Transporte', 'Armazenamento', 'Diesel', 'Manutenção', 'Outro'].map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <input type="text" name="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <input type="number" step="0.01" name="valor" placeholder="Valor (R$)" value={formData.valor} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-epagri-red text-white rounded-md">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

// --- Custo Fixo Form ---
const CustoFixoForm: React.FC<{ userId: number; onClose: () => void; onSave: () => void; }> = ({ userId, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<CustoFixo, 'id'>>({ usuario_id: userId, data: new Date().toISOString().split('T')[0], categoria: 'Seguro', descricao: '', valor: 0 });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'valor' ? parseFloat(value) : value }));
    }
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addCustoFixo(formData); onSave(); }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold mb-4">Registrar Custo Fixo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <input type="date" name="data" value={formData.data} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <select name="categoria" value={formData.categoria} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700">
                        {['Seguro', 'Juros', 'Impostos', 'Outro'].map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <input type="text" name="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                     <input type="number" step="0.01" name="valor" placeholder="Valor (R$)" value={formData.valor} onChange={handleChange} required className="mt-1 block w-full rounded-md dark:bg-gray-700"/>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-epagri-red text-white rounded-md">Salvar</button></div>
                </form>
            </div>
        </div>
    );
};

const CustosScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, showToast }) => {
    const [activeTab, setActiveTab] = useState<'variaveis' | 'fixos'>('variaveis');
    const [safras, setSafras] = useState<Safra[]>([]);
    const [selectedSafraId, setSelectedSafraId] = useState<number | null>(null);
    
    // Variaveis
    const [custosVariaveis, setCustosVariaveis] = useState<CustoVariavel[]>([]);
    const [isVariavelFormOpen, setIsVariavelFormOpen] = useState(false);
    
    // Fixos
    const [custosFixos, setCustosFixos] = useState<CustoFixo[]>([]);
    const [isFixoFormOpen, setIsFixoFormOpen] = useState(false);
    const custosFixosCalculados = useMemo(() => {
        const maquinarios = getMaquinariosByUsuario(currentUser);
        const benfeitorias = getBenfeitoriasByUsuario(currentUser);
        // FIX: Add a 'descricao' property to the mapped maquinario object for type consistency.
        const depreciacao = maquinarios.map(m => ({ ...m, valor: calculateDepreciacaoAnualMaquinario(m), categoria: 'Depreciação', data: new Date().toISOString(), descricao: m.nome }));
        const custoBenfeitorias = { valor: calculateCustoAnualBenfeitorias(benfeitorias) / 12, categoria: 'Benfeitoria', data: new Date().toISOString(), descricao: 'Parcela mensal consolidada' }; // Exemplo mensal
        return [...depreciacao, custoBenfeitorias];
    }, [currentUser]);


    useEffect(() => {
        const userSafras = getSafrasByUsuario(currentUser).filter(s => s.ativa);
        setSafras(userSafras);
        if (userSafras.length > 0 && !selectedSafraId) {
            setSelectedSafraId(userSafras[0].id);
        }
    }, [currentUser, selectedSafraId]);

    useEffect(() => {
        if(selectedSafraId) setCustosVariaveis(getCustosVariaveisBySafra(selectedSafraId));
        setCustosFixos(getCustosFixosByUsuario(currentUser.id));
    }, [selectedSafraId, currentUser]);
    
    const handleSave = (type: 'variavel' | 'fixo') => {
        showToast("Custo registrado com sucesso!", "success");
        if (type === 'variavel') {
            setIsVariavelFormOpen(false);
            if(selectedSafraId) setCustosVariaveis(getCustosVariaveisBySafra(selectedSafraId));
        } else {
            setIsFixoFormOpen(false);
            setCustosFixos(getCustosFixosByUsuario(currentUser.id));
        }
    };

    return (
        <ScreenWrapper title="Gerenciamento de Custos" onNavigateBack={onNavigateBack}>
            {isVariavelFormOpen && selectedSafraId && <CustoVariavelForm safraId={selectedSafraId} onClose={() => setIsVariavelFormOpen(false)} onSave={() => handleSave('variavel')} />}
            {isFixoFormOpen && <CustoFixoForm userId={currentUser.id} onClose={() => setIsFixoFormOpen(false)} onSave={() => handleSave('fixo')} />}
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('variaveis')} className={`${activeTab === 'variaveis' ? 'border-epagri-red text-epagri-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Custos Variáveis</button>
                    <button onClick={() => setActiveTab('fixos')} className={`${activeTab === 'fixos' ? 'border-epagri-red text-epagri-red' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Custos Fixos</button>
                </nav>
            </div>

            {activeTab === 'variaveis' && (
            <>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Selecione a Safra</label>
                    <select className="block w-full rounded-md dark:bg-gray-700" value={selectedSafraId ?? ''} onChange={(e) => setSelectedSafraId(Number(e.target.value))}>
                        {safras.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                </div>
                <div className="mb-6 flex justify-end">
                    <button disabled={!selectedSafraId} onClick={() => setIsVariavelFormOpen(true)} className="flex items-center gap-2 bg-epagri-red text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400"><Icon name="plus" className="w-5 h-5"/> Registrar Custo Variável</button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <table className="w-full text-left"><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th className="text-right">Valor</th></tr></thead>
                        <tbody>
                            {custosVariaveis.length > 0 ? custosVariaveis.map(c => <tr key={c.id}><td>{formatDate(c.data)}</td><td>{c.tipo}</td><td>{c.descricao}</td><td className="text-right">{formatCurrency(c.valor)}</td></tr>)
                             : (<tr><td colSpan={4} className="text-center py-4">Nenhum custo variável registrado para esta safra.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </>
            )}

            {activeTab === 'fixos' && (
            <>
                <div className="mb-6 flex justify-end">
                    <button onClick={() => setIsFixoFormOpen(true)} className="flex items-center gap-2 bg-epagri-red text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700"><Icon name="plus" className="w-5 h-5"/> Registrar Custo Fixo</button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                     <h3 className="text-lg font-semibold mb-2">Custos Fixos da Propriedade</h3>
                     <table className="w-full text-left"><thead><tr><th>Data</th><th>Categoria</th><th>Descrição</th><th className="text-right">Valor (Anual/Total)</th></tr></thead>
                        <tbody>
                            {custosFixos.map(c => <tr key={`m-${c.id}`}><td>{formatDate(c.data)}</td><td>{c.categoria}</td><td>{c.descricao}</td><td className="text-right">{formatCurrency(c.valor)}</td></tr>)}
                            {custosFixosCalculados.map((c, i) => <tr key={`c-${i}`} className="bg-gray-50 dark:bg-gray-700/50"><td className="italic">{formatDate(c.data)}</td><td className="italic">{c.categoria}</td><td className="italic">{c.descricao || (c as any).nome} (Automático)</td><td className="text-right italic">{formatCurrency(c.valor)}</td></tr>)}
                            {custosFixos.length === 0 && custosFixosCalculados.length === 0 && (<tr><td colSpan={4} className="text-center py-4">Nenhum custo fixo registrado.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </>
            )}
        </ScreenWrapper>
    );
};

export default CustosScreen;