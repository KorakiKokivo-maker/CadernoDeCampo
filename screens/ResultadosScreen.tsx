import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Safra, Usuario } from '../types';
// FIX: Corrected imports to use existing calculation functions and added imports for fixed cost calculations.
import { getSafrasByUsuario, getOperacoesBySafra, getCustosVariaveisBySafra, getColheitasBySafra, getCustosFixosByUsuario, getMaquinariosByUsuario, getBenfeitoriasByUsuario } from '../services/database';
import {
  calculateTotalReceita,
  calculateTotalCustosVariaveis,
  calculateTotalCustosFixos,
  calculateLucroBruto,
  calculateROI,
  calculateRentabilidadePorHa,
  aggregateCustosPorCategoria,
  formatCurrency,
} from '../utils/calculations';
import Icon from '../components/Icon';
import DashboardCard from '../components/DashboardCard';
import ScreenWrapper from '../components/ScreenWrapper';

interface ResultadosScreenProps {
  currentUser: Usuario;
  onNavigateBack: () => void;
}

const COLORS = ['#C8102E', '#000000', '#C0C0C0', '#8884d8', '#82ca9d', '#ffc658'];

const ResultadosScreen: React.FC<ResultadosScreenProps> = ({ currentUser, onNavigateBack }) => {
  const [safras, setSafras] = useState<Safra[]>([]);
  const [selectedSafraId, setSelectedSafraId] = useState<number | null>(null);

  useEffect(() => {
    const userSafras = getSafrasByUsuario(currentUser);
    setSafras(userSafras);
    if (userSafras.length > 0 && !selectedSafraId) {
      setSelectedSafraId(userSafras[0].id);
    }
  }, [currentUser, selectedSafraId]);
  
  const selectedSafra = useMemo(() => {
    return safras.find(s => s.id === selectedSafraId)
  }, [safras, selectedSafraId]);

  const {
      totalReceita,
      totalCustos,
      lucroBruto,
      roi,
      custosPorCategoria
  } = useMemo(() => {
    if (!selectedSafra) {
        return { totalReceita: 0, totalCustos: 0, lucroBruto: 0, roi: 0, custosPorCategoria: [] };
    }
    const operacoes = getOperacoesBySafra(selectedSafra.id);
    const custosVariaveis = getCustosVariaveisBySafra(selectedSafra.id);
    const colheitas = getColheitasBySafra(selectedSafra.id);

    const receita = calculateTotalReceita(colheitas);
    // FIX: Replaced non-existent 'calculateTotalCustos' with proper calculation for both variable and fixed costs.
    const totalCustosVariaveis = calculateTotalCustosVariaveis(operacoes, custosVariaveis);

    const custosFixosManuais = getCustosFixosByUsuario(currentUser.id);
    const maquinarios = getMaquinariosByUsuario(currentUser);
    const benfeitorias = getBenfeitoriasByUsuario(currentUser);
    const totalCustosFixosAnual = calculateTotalCustosFixos(custosFixosManuais, maquinarios, benfeitorias);

    const startDate = new Date(selectedSafra.data_inicio);
    const endDate = selectedSafra.data_fim ? new Date(selectedSafra.data_fim) : new Date();
    const durationDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const proratedCustosFixos = (totalCustosFixosAnual / 365) * durationDays;

    const custos = totalCustosVariaveis + proratedCustosFixos;
    const lucro = calculateLucroBruto(receita, custos);

    const aggregatedVariableCosts = aggregateCustosPorCategoria(operacoes, custosVariaveis);
    const custosParaGrafico = [...aggregatedVariableCosts, { name: 'Custos Fixos (Rateado)', value: proratedCustosFixos }];
    
    return {
        totalReceita: receita,
        totalCustos: custos,
        lucroBruto: lucro,
        roi: calculateROI(lucro, custos),
        rentabilidadePorHa: calculateRentabilidadePorHa(receita, selectedSafra.area_ha),
        custosPorCategoria: custosParaGrafico
    };
  }, [selectedSafra, currentUser]);


  return (
    <ScreenWrapper title="Resultados da Safra" onNavigateBack={onNavigateBack}>
      <div className="mb-6">
        <label htmlFor="safra-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Selecione a Safra
        </label>
        <select
          id="safra-select"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-epagri-red focus:border-epagri-red sm:text-sm rounded-md"
          value={selectedSafraId ?? ''}
          onChange={(e) => setSelectedSafraId(Number(e.target.value))}
        >
          {safras.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </div>

      {selectedSafra ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard title="Receita Total" value={formatCurrency(totalReceita)} icon="arrow-trending-up" color="bg-green-500" />
                <DashboardCard title="Custo Total" value={formatCurrency(totalCustos)} icon="arrow-trending-down" color="bg-epagri-red" />
                <DashboardCard title="Lucro Bruto" value={formatCurrency(lucroBruto)} icon="banknotes" color="bg-blue-500" />
                <DashboardCard title="ROI" value={`${roi.toFixed(2)}%`} icon="receipt-percent" color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Distribuição de Custos</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={custosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {custosPorCategoria.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Custos por Categoria</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={custosPorCategoria} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs" />
                            <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{ fill: 'currentColor' }} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="value" fill="#C8102E" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          Nenhuma safra disponível. Crie uma safra na tela 'Minhas Safras' para ver os resultados.
        </p>
      )}

    </ScreenWrapper>
  );
};

export default ResultadosScreen;