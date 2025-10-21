import { Usuario, Safra, Propriedade, OperacaoCampo, CustoVariavel, Colheita, Maquinario, Benfeitoria, Produto, CustoFixo } from '../types';

// --- Helper Functions for localStorage ---
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error loading ${key} from localStorage`, error);
    }
    return defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};


// --- Mock Data (as default values) ---
const defaultUsers: Usuario[] = [
  { id: 1, nome: 'João da Silva', nome_de_usuario: 'joao', senha: '123', perfil: 'Produtor' },
  { id: 2, nome: 'Ana Souza', nome_de_usuario: 'ana', senha: '123', perfil: 'Técnico' },
];
const defaultPropriedades: Propriedade[] = [
  { id: 1, usuario_id: 1, nome: 'Fazenda Boa Esperança', localizacao: 'Anitápolis, SC' },
  { id: 2, usuario_id: 2, nome: 'Sítio das Flores', localizacao: 'Urubici, SC' },
];
const defaultSafras: Safra[] = [
    { id: 1, usuario_id: 1, propriedade_id: 1, nome: 'Milho Verão 23/24', cultura: 'Milho', variedade: 'AG-7098', area_ha: 50, data_inicio: '2023-10-15', data_fim: '2024-03-20', ativa: true },
    { id: 2, usuario_id: 1, propriedade_id: 1, nome: 'Soja Safra 23/24', cultura: 'Soja', variedade: 'TMG-7062', area_ha: 75, data_inicio: '2023-11-01', data_fim: '2024-04-10', ativa: true },
    { id: 3, usuario_id: 2, propriedade_id: 2, nome: 'Maçã Fuji 2024', cultura: 'Maçã', variedade: 'Fuji', area_ha: 10, data_inicio: '2023-08-01', ativa: true },
    { id: 4, usuario_id: 1, propriedade_id: 1, nome: 'Trigo Inverno 23', cultura: 'Trigo', variedade: 'TBIO', area_ha: 50, data_inicio: '2023-06-01', data_fim: '2023-09-15', ativa: false },
];
const defaultOperacoes: OperacaoCampo[] = [
    { id: 1, safra_id: 1, data: '2023-10-16', tipo: 'Plantio', custo: 15000 },
    { id: 2, safra_id: 1, data: '2023-11-20', tipo: 'Adubação e Correção', custo: 25000, produto_id: 1, dose: 500 },
    { id: 3, safra_id: 1, data: '2024-01-15', tipo: 'Defensivo', custo: 8000, produto_id: 2, dose: 2 },
    { id: 4, safra_id: 2, data: '2023-11-02', tipo: 'Plantio', custo: 22000 },
];
const defaultCustosVariaveis: CustoVariavel[] = [
    { id: 1, safra_id: 1, data: '2024-03-20', tipo: 'Mão de Obra', descricao: 'Pagamento colheita', valor: 12000 },
    { id: 2, safra_id: 1, data: '2024-03-25', tipo: 'Transporte', descricao: 'Frete para o silo', valor: 7500 },
];
const defaultCustosFixos: CustoFixo[] = [
    { id: 1, usuario_id: 1, data: '2024-01-01', descricao: 'Seguro da propriedade', categoria: 'Seguro', valor: 5000 },
];
const defaultColheitas: Colheita[] = [
    { id: 1, safra_id: 1, data: '2024-03-18', quantidade: 4500, unidade: 'saca', preco_unitario: 55, responsavel: 'João da Silva' },
    { id: 2, safra_id: 2, data: '2024-04-08', quantidade: 4000, unidade: 'saca', preco_unitario: 120, responsavel: 'Equipe Fazenda' },
];
const defaultMaquinarios: Maquinario[] = [
    { id: 1, usuario_id: 1, nome: 'Trator Valtra A950', tipo: 'Trator', valor_inicial: 250000, vida_util_anos: 10, vida_util_horas: 10000, valor_residual_percentual: 20, segurado: true }
];
const defaultBenfeitorias: Benfeitoria[] = [
    { id: 1, usuario_id: 1, nome: 'Construção de Silo', valor_total: 150000, data_inicio_pagamento: '2021-07-20', num_parcelas: 60, parcelas_pagas: 30 }
];
const defaultProdutos: Produto[] = [
    { id: 1, nome: 'NPK 10-20-20', unidade: 'kg', preco_unitario: 2.5 },
    { id: 2, nome: 'Herbicida XPTO', unidade: 'L', preco_unitario: 80 },
    { id: 3, nome: 'Semente Milho AG-7098', unidade: 'saca', preco_unitario: 350 },
];
const defaultDieselPrice = 5.80;

// --- Load data from localStorage or use defaults ---
let users: Usuario[] = loadFromStorage('db_users', defaultUsers);
let propriedades: Propriedade[] = loadFromStorage('db_propriedades', defaultPropriedades);
let safras: Safra[] = loadFromStorage('db_safras', defaultSafras);
let operacoes: OperacaoCampo[] = loadFromStorage('db_operacoes', defaultOperacoes);
let custosVariaveis: CustoVariavel[] = loadFromStorage('db_custosVariaveis', defaultCustosVariaveis);
let custosFixos: CustoFixo[] = loadFromStorage('db_custosFixos', defaultCustosFixos);
let colheitas: Colheita[] = loadFromStorage('db_colheitas', defaultColheitas);
let maquinarios: Maquinario[] = loadFromStorage('db_maquinarios', defaultMaquinarios);
let benfeitorias: Benfeitoria[] = loadFromStorage('db_benfeitorias', defaultBenfeitorias);
let produtos: Produto[] = loadFromStorage('db_produtos', defaultProdutos);
let dieselPrice: number = loadFromStorage('db_dieselPrice', defaultDieselPrice);

// --- Auth ---
export const authenticate = (username: string, password: string): Usuario | null => {
  const user = users.find(u => u.nome_de_usuario === username && u.senha === password);
  if (user) {
    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};
export const addUser = (newUser: Omit<Usuario, 'id'>): Usuario | { error: string } => {
    if (users.some(u => u.nome_de_usuario === newUser.nome_de_usuario)) { return { error: "Nome de usuário já existe." }; }
    const userWithId = { ...newUser, id: (users.length > 0 ? Math.max(...users.map(u => u.id)) : 0) + 1 };
    users.push(userWithId);
    saveToStorage('db_users', users);
    const { senha, ...userWithoutPassword } = userWithId;
    return userWithoutPassword;
};

// --- Safra ---
export const getSafrasByUsuario = (user: Usuario): Safra[] => safras.filter(s => s.usuario_id === user.id);
export const getSafraById = (id: number): Safra | undefined => safras.find(s => s.id === id);
export const addSafra = (safra: Omit<Safra, 'id' | 'ativa'>): Safra => {
    const newSafra = { ...safra, id: (safras.length > 0 ? Math.max(...safras.map(s => s.id)) : 0) + 1, ativa: true };
    safras.push(newSafra);
    saveToStorage('db_safras', safras);
    return newSafra;
};
export const inativateSafra = (id: number): void => {
    const index = safras.findIndex(s => s.id === id);
    if (index !== -1) {
        safras[index].ativa = false;
        saveToStorage('db_safras', safras);
    }
};

// --- Propriedade ---
export const getPropriedadesByUsuario = (user: Usuario): Propriedade[] => propriedades.filter(p => p.usuario_id === user.id);
export const getPropriedadeById = (id: number): Propriedade | undefined => propriedades.find(p => p.id === id);

// --- Operacoes ---
export const getOperacoesBySafra = (safraId: number): OperacaoCampo[] => operacoes.filter(o => o.safra_id === safraId);
export const addOperacao = (operacao: Omit<OperacaoCampo, 'id'>): OperacaoCampo => {
    const newOp = { ...operacao, id: (operacoes.length > 0 ? Math.max(...operacoes.map(o => o.id)) : 0) + 1 };
    operacoes.push(newOp);
    saveToStorage('db_operacoes', operacoes);
    return newOp;
}

// --- Custos Variaveis ---
export const getCustosVariaveisBySafra = (safraId: number): CustoVariavel[] => custosVariaveis.filter(c => c.safra_id === safraId);
export const addCustoVariavel = (custo: Omit<CustoVariavel, 'id'>): CustoVariavel => {
    const newCusto = { ...custo, id: (custosVariaveis.length > 0 ? Math.max(...custosVariaveis.map(c => c.id)) : 0) + 1 };
    custosVariaveis.push(newCusto);
    saveToStorage('db_custosVariaveis', custosVariaveis);
    return newCusto;
}
// --- Custos Fixos ---
export const getCustosFixosByUsuario = (userId: number): CustoFixo[] => custosFixos.filter(c => c.usuario_id === userId);
export const addCustoFixo = (custo: Omit<CustoFixo, 'id'>): CustoFixo => {
    const newCusto = { ...custo, id: (custosFixos.length > 0 ? Math.max(...custosFixos.map(c => c.id)) : 0) + 1 };
    custosFixos.push(newCusto);
    saveToStorage('db_custosFixos', custosFixos);
    return newCusto;
}

// --- Colheitas ---
export const getColheitasBySafra = (safraId: number): Colheita[] => colheitas.filter(c => c.safra_id === safraId);
export const addColheita = (colheita: Omit<Colheita, 'id'>): Colheita => {
    const newColheita = { ...colheita, id: (colheitas.length > 0 ? Math.max(...colheitas.map(c => c.id)) : 0) + 1 };
    colheitas.push(newColheita);
    saveToStorage('db_colheitas', colheitas);
    return newColheita;
}

// --- Maquinario ---
export const getMaquinariosByUsuario = (user: Usuario): Maquinario[] => maquinarios.filter(m => m.usuario_id === user.id);
export const addMaquinario = (maquinario: Omit<Maquinario, 'id'>): Maquinario => {
    const newMaquinario = { ...maquinario, id: (maquinarios.length > 0 ? Math.max(...maquinarios.map(m => m.id)) : 0) + 1 };
    maquinarios.push(newMaquinario);
    saveToStorage('db_maquinarios', maquinarios);
    return newMaquinario;
}

// --- Benfeitorias ---
export const getBenfeitoriasByUsuario = (user: Usuario): Benfeitoria[] => benfeitorias.filter(b => b.usuario_id === user.id);
export const addBenfeitoria = (benfeitoria: Omit<Benfeitoria, 'id'>): Benfeitoria => {
    const newBenfeitoria = { ...benfeitoria, id: (benfeitorias.length > 0 ? Math.max(...benfeitorias.map(b => b.id)) : 0) + 1 };
    benfeitorias.push(newBenfeitoria);
    saveToStorage('db_benfeitorias', benfeitorias);
    return newBenfeitoria;
}

// --- Produtos ---
export const getProdutos = (): Produto[] => produtos;

// --- Configs ---
export const getDieselPrice = (): number => dieselPrice;
export const setDieselPrice = (newPrice: number): void => {
    dieselPrice = newPrice;
    saveToStorage('db_dieselPrice', dieselPrice);
};
