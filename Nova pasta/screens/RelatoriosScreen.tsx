import React, { useState, useEffect, useMemo } from 'react';
import { Safra, Usuario, Propriedade, OperacaoCampo, CustoVariavel, Colheita, RelatorioData } from '../types';
import { 
    getSafrasByUsuario, 
    getPropriedadeById, 
    getOperacoesBySafra, 
    getCustosVariaveisBySafra, 
    getColheitasBySafra,
    getProdutos,
    getCustosFixosByUsuario,
    getMaquinariosByUsuario,
    getBenfeitoriasByUsuario
} from '../services/database';
// FIX: Replaced non-existent 'calculateTotalCustos' with specific cost calculation functions.
import { 
    calculateTotalReceita, 
    calculateTotalCustosVariaveis,
    calculateTotalCustosFixos,
    calculateLucroBruto, 
    calculateROI, 
    calculateRentabilidadePorHa 
} from '../utils/calculations';
import { generatePdf } from '../utils/pdfGenerator';
import ScreenWrapper from '../components/ScreenWrapper';
import Icon from '../components/Icon';

const RelatoriosScreen: React.FC<{
  currentUser: Usuario;
  onNavigateBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ currentUser, onNavigateBack, showToast }) => {
    const [safras, setSafras] = useState<Safra[]>([]);
    const [selectedSafraId, setSelectedSafraId] = useState<number | null>(null);

    useEffect(() => {
        const userSafras = getSafrasByUsuario(currentUser);
        setSafras(userSafras);
        if (userSafras.length > 0 && !selectedSafraId) {
            setSelectedSafraId(userSafras[0].id);
        }
    }, [currentUser, selectedSafraId]);

    const reportData = useMemo<RelatorioData | null>(() => {
        if (!selectedSafraId) return null;
        
        const safra = safras.find(s => s.id === selectedSafraId);
        if(!safra) return null;

        const propriedade = getPropriedadeById(safra.propriedade_id);
        if(!propriedade) return null;

        const allProdutos = getProdutos();
        const operacoesRaw = getOperacoesBySafra(safra.id);
        const operacoes = operacoesRaw.map(op => ({
            ...op,
            nome_produto: op.produto_id ? allProdutos.find(p => p.id === op.produto_id)?.nome : undefined,
        }));
        const custosVariaveis = getCustosVariaveisBySafra(safra.id);
        const colheitas = getColheitasBySafra(safra.id);

        // FIX: Correctly calculate all costs and provide all required fields for the 'resultados' object.
        const totalReceita = calculateTotalReceita(colheitas);
        const totalCustosVariaveis = calculateTotalCustosVariaveis(operacoes, custosVariaveis);
        
        const custosFixosManuais = getCustosFixosByUsuario(currentUser.id);
        const maquinarios = getMaquinariosByUsuario(currentUser);
        const benfeitorias = getBenfeitoriasByUsuario(currentUser);
        const totalCustosFixosAnual = calculateTotalCustosFixos(custosFixosManuais, maquinarios, benfeitorias);

        const startDate = new Date(safra.data_inicio);
        const endDate = safra.data_fim ? new Date(safra.data_fim) : new Date();
        const durationDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const totalCustosFixos = (totalCustosFixosAnual / 365) * durationDays;

        const totalCustos = totalCustosVariaveis + totalCustosFixos;
        const lucroBruto = calculateLucroBruto(totalReceita, totalCustos);

        return {
            ...safra,
            propriedade,
            operacoes,
            custosVariaveis: custosVariaveis,
            colheitas,
            resultados: {
                totalReceita,
                totalCustos,
                totalCustosFixos,
                totalCustosVariaveis,
                lucroBruto,
                roi: calculateROI(lucroBruto, totalCustos),
                rentabilidadePorHa: calculateRentabilidadePorHa(totalReceita, safra.area_ha),
            }
        }
    }, [selectedSafraId, safras, currentUser]);
    
    const handleGenerateReport = () => {
        if (reportData) {
            try {
                generatePdf(reportData);
                showToast("Relatório PDF gerado com sucesso!", "success");
            } catch (error) {
                console.error("Erro ao gerar PDF:", error);
                showToast("Erro ao gerar PDF. Verifique os dados.", "error");
            }
        } else {
            showToast("Não foi possível gerar o relatório. Dados incompletos.", "error");
        }
    };

    return (
        <ScreenWrapper title="Relatórios" onNavigateBack={onNavigateBack}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Gerar Relatório de Safra</h2>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Selecione a Safra</label>
                    <select className="block w-full rounded-md dark:bg-gray-700" value={selectedSafraId ?? ''} onChange={(e) => setSelectedSafraId(Number(e.target.value))}>
                        {safras.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleGenerateReport}
                    disabled={!reportData}
                    className="w-full flex items-center justify-center gap-2 bg-epagri-red text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition text-lg disabled:bg-gray-400"
                >
                    <Icon name="document-arrow-down" className="w-6 h-6"/>
                    Gerar Relatório PDF
                </button>
            </div>
        </ScreenWrapper>
    );
};

export default RelatoriosScreen;