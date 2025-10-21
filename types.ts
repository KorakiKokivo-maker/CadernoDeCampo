// types.ts

export type PerfilUsuario = 'Produtor' | 'Técnico';

export interface Usuario {
  id: number;
  nome: string;
  nome_de_usuario: string;
  senha?: string;
  perfil: PerfilUsuario;
}

export interface Propriedade {
    id: number;
    usuario_id: number;
    nome: string;
    localizacao: string;
}

export interface Safra {
    id: number;
    usuario_id: number;
    propriedade_id: number;
    nome: string;
    cultura: string;
    variedade: string;
    area_ha: number;
    data_inicio: string; // YYYY-MM-DD
    data_fim?: string; // YYYY-MM-DD
    ativa: boolean;
}

export type TipoOperacao = 'Defensivo' | 'Adubação e Correção' | 'Irrigação' | 'Preparo do Solo' | 'Tratamento Adicional' | 'Plantio' | 'Tratos Culturais' | 'Outra';

export interface OperacaoCampo {
    id: number;
    safra_id: number;
    data: string; // YYYY-MM-DD
    tipo: TipoOperacao;
    custo: number;
    observacoes?: string;
    aplicador?: string;
    condicoes_climaticas?: {
        temperatura?: number;
        umidade?: number;
        vento?: 'Leve' | 'Médio' | 'Forte';
        clima?: 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Outro';
    };
    // Campos dinâmicos
    produto_id?: number;
    nome_produto?: string;
    dose?: number;
    volume_calda?: number;
    ph_agua?: number;
    carencia_dias?: number;
    tipo_problema?: string;
    forma_aplicacao?: string;
    metodo_irrigacao?: string;
    origem_agua?: string;
    tempo_irrigacao?: number; // em horas
    operacoes_preparo?: string;
    praticas_conservacionistas?: string;
    finalidade_tratamento?: string;
    responsavel_tratamento?: string;
}

export type TipoCustoVariavel = 'Mão de Obra' | 'Transporte' | 'Armazenamento' | 'Diesel' | 'Manutenção' | 'Outro';

export interface CustoVariavel {
    id: number;
    safra_id: number;
    data: string; // YYYY-MM-DD
    descricao: string;
    tipo: TipoCustoVariavel;
    valor: number;
}

export type TipoCustoFixo = 'Depreciação' | 'Seguro' | 'Juros' | 'Benfeitoria' | 'Impostos' | 'Outro';

export interface CustoFixo {
    id: number;
    usuario_id: number;
    data: string;
    descricao: string;
    categoria: TipoCustoFixo;
    valor: number;
}


export interface Colheita {
    id: number;
    safra_id: number;
    data: string; // YYYY-MM-DD
    quantidade: number;
    unidade: 'kg' | 't' | 'saca';
    preco_unitario: number;
    responsavel: string;
}

export interface Maquinario {
    id: number;
    usuario_id: number;
    nome: string;
    tipo: string;
    valor_inicial: number;
    vida_util_anos: number;
    vida_util_horas: number;
    valor_residual_percentual: number;
    potencia?: number;
    segurado: boolean;
    foto_url?: string;
    observacoes?: string;
}

export interface Benfeitoria {
    id: number;
    usuario_id: number;
    nome: string;
    descricao?: string;
    valor_total: number;
    num_parcelas?: number;
    data_inicio_pagamento: string;
    parcelas_pagas: number;
}

export interface Produto {
    id: number;
    nome: string;
    unidade: string;
    preco_unitario: number;
}

export interface ResultadosFinanceiros {
    totalReceita: number;
    totalCustos: number;
    totalCustosFixos: number;
    totalCustosVariaveis: number;
    lucroBruto: number;
    roi: number;
    rentabilidadePorHa: number;
}

export interface RelatorioData extends Omit<Safra, 'ativa'> {
    propriedade: Propriedade;
    operacoes: OperacaoCampo[];
    custosVariaveis: CustoVariavel[];
    colheitas: Colheita[];
    resultados: ResultadosFinanceiros;
}