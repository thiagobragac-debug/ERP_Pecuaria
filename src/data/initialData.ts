import { Categoria, UnidadeMedida, Company } from '../types/definitions';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'M1',
    isMatriz: true,
    razaoSocial: 'Agropecuária Horizonte S.A.',
    nomeFantasia: 'Grupo Horizonte',
    cnpj: '12.345.678/0001-90',
    inscricaoEstadual: '123.456.789-0',
    inscricaoMunicipal: '987654-3',
    regimeTributario: 'Lucro Real',
    tipoLogradouro: 'Avenida',
    logradouro: 'das Nações',
    numero: '1500',
    complemento: 'Andar 12',
    bairro: 'Centro',
    cidade: 'Cuiabá',
    estado: 'MT',
    pais: 'Brasil',
    cep: '78000-000',
    telefone: '(65) 3322-1100',
    email: 'admin@horizonte.com.br',
    responsavel: 'Ricardo Santos',
    status: 'Ativa'
  },
  {
    id: 'F1',
    isMatriz: false,
    parentId: 'M1',
    razaoSocial: 'Agropecuária Horizonte - Unidade Sinop',
    nomeFantasia: 'Horizonte Sinop',
    cnpj: '12.345.678/0002-71',
    inscricaoEstadual: '123.456.789-1',
    inscricaoMunicipal: '987654-4',
    regimeTributario: 'Lucro Real',
    tipoLogradouro: 'Rodovia',
    logradouro: 'BR-163',
    numero: 'KM 450',
    complemento: '',
    bairro: 'Setor Industrial',
    cidade: 'Sinop',
    estado: 'MT',
    pais: 'Brasil',
    cep: '78550-000',
    telefone: '(66) 3531-9900',
    email: 'sinop@horizonte.com.br',
    responsavel: 'Ana Paula Costa',
    status: 'Ativa'
  }
];

export const INITIAL_CATEGORIES: Categoria[] = [
  { 
    id: '1', 
    id_cor: 'text-green-600',
    nome: 'Animais', 
    subcategoriasCount: 5,
    subcategorias: [
      { id: 's1', nome: 'Matrizes', descricao: 'Fêmeas em idade reprodutiva', status: 'Ativo' },
      { id: 's2', nome: 'Touros', descricao: 'Machos reprodutores', status: 'Ativo' },
      { id: 's3', nome: 'Bezerros', descricao: 'Animais em fase de cria', status: 'Ativo' },
      { id: 's4', nome: 'Novilhas', descricao: 'Fêmeas jovens', status: 'Ativo' },
      { id: 's5', nome: 'Boi Gordo', descricao: 'Animais para abate', status: 'Ativo' }
    ]
  },
  { 
    id: '2', 
    id_cor: 'text-blue-600',
    nome: 'Insumos', 
    subcategoriasCount: 4,
    subcategorias: [
      { id: 's6', nome: 'Vacinas', descricao: 'Medicamentos preventivos', status: 'Ativo' },
      { id: 's7', nome: 'Sal Mineral', descricao: 'Suplementação mineral', status: 'Ativo' },
      { id: 's8', nome: 'Ração', descricao: 'Alimentação concentrada', status: 'Ativo' },
      { id: 's9', nome: 'Sêmen', descricao: 'Genética para reprodução', status: 'Ativo' }
    ]
  },
  { 
    id: '3', 
    id_cor: 'text-orange-600',
    nome: 'Lotes', 
    subcategoriasCount: 3,
    subcategorias: [
      { id: 's10', nome: 'Cria', descricao: 'Grupo de vacas e bezerros', status: 'Ativo' },
      { id: 's11', nome: 'Recria', descricao: 'Animais em crescimento', status: 'Ativo' },
      { id: 's12', nome: 'Engorda', descricao: 'Fase final de terminação', status: 'Ativo' }
    ]
  },
  { 
    id: '5', 
    id_cor: 'text-purple-600',
    nome: 'Locais de Estoque', 
    subcategoriasCount: 3,
    subcategorias: [
      { id: 'l1', nome: 'Depósito Central', descricao: 'Almoxarifado Principal de Insumos', status: 'Ativo', empresaCnpj: '12.345.678/0001-90' },
      { id: 'l2', nome: 'Farmácia Veterinária', descricao: 'Estoque de Medicamentos e Vacinas', status: 'Ativo', empresaCnpj: '12.345.678/0001-90' },
      { id: 'l3', nome: 'Galpão de Nutrição', descricao: 'Galpão de Mistura e Ração', status: 'Ativo', empresaCnpj: '98.765.432/0001-10' }
    ]
  },
  { 
    id: '6', 
    id_cor: 'text-indigo-600',
    nome: 'Contas de Resultado', 
    subcategoriasCount: 2,
    subcategorias: [
      { id: 'r1', nome: 'Compra de Insumos', descricao: 'Lançamentos de compras diretas', status: 'Ativo', contaContabilId: '14' },
      { id: 'r2', nome: 'Manutenção de Cercas', descricao: 'Custos operacionais de estrutura', status: 'Ativo', contaContabilId: '18' }
    ]
  },
  { 
    id: '7', 
    id_cor: 'text-rose-600',
    nome: 'Centros de Custo', 
    subcategoriasCount: 3,
    subcategorias: [
      { id: 'cc1', nome: 'Operacional Fazenda', descricao: 'Custos diretos de campo e manejo', status: 'Ativo', contaContabilId: '14' },
      { id: 'cc2', nome: 'Administrativo', descricao: 'Despesas de escritório e gestão', status: 'Ativo', contaContabilId: '17' },
      { id: 'cc3', nome: 'Logística', descricao: 'Fretes e transportes', status: 'Ativo' }
    ]
  }
];

export const INITIAL_UNIDADES: UnidadeMedida[] = [
  { id: 'u1', sigla: 'kg', nome: 'Quilograma', tipo: 'Peso' },
  { id: 'u2', sigla: 'ha', nome: 'Hectare', tipo: 'Área' },
  { id: 'u3', sigla: '@', nome: 'Arroba', tipo: 'Peso (Rural)' },
  { id: 'u4', sigla: 'L', nome: 'Litro', tipo: 'Volume' },
  { id: 'u5', sigla: 'un', nome: 'Unidade', tipo: 'Quantidade' }
];
