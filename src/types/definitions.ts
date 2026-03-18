
export interface Subcategoria {
  id: string;
  nome: string;
  descricao: string;
  status: 'Ativo' | 'Inativo';
  empresaCnpj?: string; // Only for 'Locais de Estoque'
  contaContabilId?: string; // Only for 'Locais de Estoque' or 'Contas de Resultado'
}

export interface Categoria {
  id: string;
  id_cor: string;
  nome: string;
  subcategoriasCount: number;
  subcategorias: Subcategoria[];
}

export interface UnidadeMedida {
  id: string;
  sigla: string;
  nome: string;
  tipo: string;
}
export interface Company {
  id: string;
  isMatriz: boolean;
  parentId?: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  regimeTributario: string;
  logotipo?: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  cep: string;
  telefone: string;
  email: string;
  responsavel: string;
  incra?: string;
  nirf?: string;
  latitude?: string;
  longitude?: string;
  areaTotal?: number;
  areaPasto?: number;
  areaReserva?: number;
  areaApp?: number;
  cnae?: string;
  status: 'Ativa' | 'Inativa';
}
