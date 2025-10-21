import { Colheita, CustoVariavel, OperacaoCampo, Maquinario, Benfeitoria, CustoFixo } from '../types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const calculateTotalReceita = (colheitas: Colheita[]): number => {
  return colheitas.reduce((acc, colheita) => acc + colheita.quantidade * colheita.preco_unitario, 0);
};

export const calculateDepreciacaoAnualMaquinario = (maquinario: Maquinario): number => {
    const valorResidual = maquinario.valor_inicial * (maquinario.valor_residual_percentual / 100);
    if (maquinario.vida_util_anos <= 0) return 0;
    return (maquinario.valor_inicial - valorResidual) / maquinario.vida_util_anos;
}

export const calculateCustoAnualBenfeitorias = (benfeitorias: Benfeitoria[]): number => {
    return benfeitorias.reduce((acc, ben) => {
        if (!ben.num_parcelas || ben.num_parcelas <= 0) return acc;
        const valorParcela = ben.valor_total / ben.num_parcelas;
        // Considera o custo anual (12 parcelas)
        return acc + (valorParcela * 12);
    }, 0);
}

export const calculateTotalCustosFixos = (
    custosFixosManuais: CustoFixo[],
    maquinarios: Maquinario[],
    benfeitorias: Benfeitoria[]
): number => {
    const totalDepreciacao = maquinarios.reduce((acc, maq) => acc + calculateDepreciacaoAnualMaquinario(maq), 0);
    const totalBenfeitorias = calculateCustoAnualBenfeitorias(benfeitorias);
    const totalManual = custosFixosManuais.reduce((acc, c) => acc + c.valor, 0);
    
    // Simplificação: Assume que os custos fixos são por ano. Para uma safra, seria preciso ratear.
    // Por simplicidade aqui, somamos o valor anual.
    return totalDepreciacao + totalBenfeitorias + totalManual;
}


export const calculateTotalCustosVariaveis = (operacoes: OperacaoCampo[], custosVariaveis: CustoVariavel[]): number => {
  const custoOperacoes = operacoes.reduce((acc, op) => acc + op.custo, 0);
  const custoVariaveis = custosVariaveis.reduce((acc, custo) => acc + custo.valor, 0);
  return custoOperacoes + custoVariaveis;
};

export const calculateLucroBruto = (receita: number, custos: number): number => {
  return receita - custos;
};

export const calculateROI = (lucro: number, custos: number): number => {
  if (custos === 0) return 0;
  return (lucro / custos) * 100;
};

export const calculateRentabilidadePorHa = (receita: number, area: number): number => {
  if (area === 0) return 0;
  return receita / area;
};

export const aggregateCustosPorCategoria = (operacoes: OperacaoCampo[], custosVariaveis: CustoVariavel[]) => {
    const custosAgregados: { [key: string]: number } = {};

    operacoes.forEach(op => {
        const categoria = op.tipo;
        if (!custosAgregados[categoria]) {
            custosAgregados[categoria] = 0;
        }
        custosAgregados[categoria] += op.custo;
    });

    custosVariaveis.forEach(custo => {
        const categoria = custo.tipo;
        if (!custosAgregados[categoria]) {
            custosAgregados[categoria] = 0;
        }
        custosAgregados[categoria] += custo.valor;
    });

    return Object.entries(custosAgregados).map(([name, value]) => ({ name, value }));
};