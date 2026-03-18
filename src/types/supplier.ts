
export interface Supplier {
  id: string;
  nome: string;
  nomeFantasia: string;
  documento: string;
  inscricaoEstadual: string;
  regimeTributario: string;
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
  condicaoPagamentoPadrao: string;
  prazoEntregaMedio: string;
  cnae?: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
}
