export interface CustoLancamento {
  id: string;
  data: string;
  categoria: 'Aquisi\u00e7\u00e3o' | 'Nutri\u00e7\u00e3o' | 'Sanidade' | 'Reprodu\u00e7\u00e3o' | 'Confinamento' | 'Operacional';
  descricao: string;
  valor: number;
  unidade?: string;
  quantidade?: number;
}

export interface Lote {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  pasto?: string;
  qtdAnimais?: number;
  pesoMedio?: number;
  dataCriacao?: string;
  status: 'Ativo' | 'Encerrado' | 'Vendido';
  cor?: string;
  empresaId?: string;
  tenant_id: string;
}

export interface Pasto {
  id: string;
  nome: string;
  area_ha: number;
  capacidade_ua: number;
  pasto_tipo?: string;
  status: 'Ocupado' | 'Vazio' | 'Descanso' | 'Reforma';
  data_ultima_adubacao?: string;
  empresaId?: string;
  tenant_id: string;
}

export interface Animal {
  id: string;
  brinco: string;
  sisbov?: string;
  idEletronico?: string;
  sexo: 'M' | 'F';
  raca: string;
  lote: string; // Keep for legacy/compat
  pasto: string; // Keep for legacy/compat
  lote_id?: string; // New FK
  pasto_id?: string; // New FK
  peso: number;
  dataNasc: string;
  categoria: string;
  pai?: string;
  mae?: string;
  status: 'Ativo' | 'Vendido' | 'Baixa';
  custoAquisicao: number;
  custoNutricao: number;
  custoSanidade: number;
  custoReproducao: number;
  custoConfinamento: number;
  custoOperacional: number;
  valorVenda?: number;
  historicoCustos: CustoLancamento[];
  statusEmAbate?: boolean;
  empresaId?: string;
  tenant_id?: string;
  created_at?: string;
}

export interface Ingrediente {
  id: string;
  nome: string;
  proporcao: number;
  custoUnitario: number;
}

export interface LogTrato {
  id: string;
  data: string;
  loteId: string;
  quantidadeEntregue: number;
  status: 'Entregue' | 'Pendente' | 'Parcial';
}

export interface Dieta {
  id: string;
  nome: string;
  categoria: string;
  loteId?: string;
  pesoMedioLote: number;
  cmsProjetado: number;
  custoPorCab: number;
  status: 'Ativa' | 'Ajuste Necess\u00e1rio' | 'Programada';
  ingredientes: Ingrediente[];
  historicoTrato: LogTrato[];
  empresaId?: string;
  tenant_id?: string;
}

export interface MedicamentoUsado {
  id: string;
  nome: string;
  dose: string;
  quantidade: number;
}

export interface RegistroSanitario {
  id: string;
  animal?: string;
  animal_id?: string;
  loteId?: string;
  lote_id?: string;
  tipo: 'Vacina\u00e7\u00e3o' | 'Tratamento' | 'Preven\u00e7\u00e3o';
  doenca_motivo: string;
  data: string;
  careencia_fim: string;
  status: 'Conclu\u00eddo' | 'Em Curso' | 'Agendado';
  medicamentos: MedicamentoUsado[];
  empresaId?: string;
  tenant_id?: string;
}
export interface SaaSPlan {
  id: string;
  nome: string;
  descricao: string;
  preco_mensal: number;
  preco_anual: number;
  limite_animais: number | null;
  limite_usuarios: number;
  features: string[];
}

export interface SaaSOrganization {
  id: string;
  nome: string;
  cnpj_cpf?: string;
  dono_id: string;
  created_at: string;
}

export interface SaasSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid';
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface SaasMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

export interface AccessRole {
  id: string;
  nome: string;
  descricao: string;
  permissoes: Record<string, 'nenhum' | 'visualizar' | 'total'>;
  tenant_id?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: 'USER' | 'ADMIN' | 'MASTER';
  is_active: boolean;
  email?: string;
  tenant_id?: string;
  created_at?: string;
}

export const USER_ROLES = [
  { id: 'USER', nome: 'Usuário' },
  { id: 'ADMIN', nome: 'Administrador' },
  { id: 'MASTER', nome: 'Proprietário Master' },
];

export interface SaasPixConfig {
  pix_key: string;
  merchant_name: string;
  merchant_city: string;
  is_active: boolean;
}

export interface Transacao {
  id: string;
  desc: string;
  valor: number;
  data: string; // Execution date
  vencimento?: string; // Due date
  tipo: 'in' | 'out';
  status: 'Pago' | 'Pendente' | 'Atrasado';
  categoria: string;
  banco_id?: string;
  fornecedor_id?: string;
  cliente_id?: string;
  forma_pagamento?: string;
  comprovante_url?: string;
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  nome: string;
  nomeFantasia: string;
  documento: string;
  inscricaoEstadual?: string;
  indIEDest?: '1' | '2' | '9'; 
  regimeTributario?: string;
  tipoLogradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cMun?: string; // Código do Município (IBGE)
  estado?: string;
  pais?: string;
  cPais?: string; // Código do País (1058 = Brasil)
  cep?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  condicaoPagamentoPadrao?: string;
  prazoEntregaMedio?: string;
  cnae?: string;
  status: 'Ativo' | 'Inativo' | 'Suspenso' | 'Bloqueado';
  tenant_id: string;
  created_at?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  nomeFantasia: string;
  documento: string;
  inscricaoEstadual?: string;
  indIEDest?: '1' | '2' | '9'; // 1: Contribuinte ICMS, 2: Isento, 9: Não Contribuinte
  regimeTributario?: string;
  tipoLogradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cMun?: string; // Código do Município (IBGE)
  estado?: string;
  pais?: string;
  cPais?: string; // Código do País (1058 = Brasil)
  cep?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  limiteCredito: number;
  condicaoPagamento?: string;
  cnae?: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  tenant_id: string;
  created_at?: string;
}

export interface BankAccount {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'Corrente' | 'Poupança' | 'Investimento' | 'Caixa';
  saldo: number;
  status: 'Ativa' | 'Inativa';
  color?: string;
  brandColor?: string;
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  valorUnitario: number;
  ultimaEntrada: string;
  status: 'Ok' | 'Baixo' | 'Crítico';
  estoquePorLocal: Record<string, number>;
  custoMedioPorLocal: Record<string, number>;
  controlaEstoque: boolean;
  paraVenda: boolean;
  paraCompra: boolean;
  tenant_id: string;
  created_at?: string;
}

export interface MovimentacaoEstoque {
  id: string;
  insumo_id: string;
  insumo_nome: string; // denormalized for easy listing
  local_origem: string;
  local_destino?: string;
  tipo: 'Entrada' | 'Saída' | 'Transferência';
  quantidade: number;
  unidade: string;
  motivo: string;
  data: string;
  responsavel: string;
  status: 'Processado' | 'Pendente' | 'Cancelado';
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface AssetFinancial {
  valorCompra: number;
  dataCompra: string;
  vidaUtilAnos: number;
  depreciacaoAnual: number;
}

export interface Asset {
  id: string;
  nome: string;
  categoria: string;
  marca: string;
  modelo: string;
  ano: number;
  placaOuSerie: string;
  status: 'Operacional' | 'Manutenção' | 'Inativo';
  usoAtual: number;
  tipoUso: 'Horas' | 'KM';
  empresaId: string;
  proximaRevisao: string;
  financeiro: AssetFinancial;
  tenant_id: string;
  created_at?: string;
}

export interface Abastecimento {
  id: string;
  ativo_id: string;
  ativo_nome: string;
  data: string;
  combustivel: 'Diesel' | 'Gasolina' | 'Etanol' | 'Arla' | 'Diesel S10' | 'Diesel S500';
  quantidade: number;
  valorUnitario?: number;
  valorTotal: number;
  odometroHorimetro: number;
  posto?: string;
  operador?: string;
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface Manutencao {
  id: string;
  ativo_id: string;
  ativo_nome: string;
  tipo: 'Preventiva' | 'Corretiva' | 'Preditiva';
  data: string;
  descricao: string;
  oficina?: string;
  valorTotal: number;
  maoDeObra?: number;
  odometroHorimetro: number;
  status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  prioridade?: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  responsavel?: string;
  itens?: any[];
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface Pesagem {
  id: string;
  animal_id: string;
  brinco: string;
  data: string;
  pesoAtual: number;
  pesoAnterior: number;
  gmd: number;
  lote_id?: string;
  manejo: string;
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface ItemInventario {
  id: string;
  insumo: string;
  estoqueSistema: number;
  estoqueFisico: number;
  unidade: string;
  divergencia: number;
  valorDivergencia: number;
}

export interface SessaoInventario {
  id: string;
  referencia: string;
  dataInicio: string;
  dataFim: string | null;
  responsavel: string;
  local: string;
  itensContados: number;
  acuracidade: number;
  status: 'Em Aberto' | 'Finalizado' | 'Cancelado';
  dados: ItemInventario[];
  tenant_id: string;
  created_at?: string;
}

export interface Abate {
  id: string;
  lote_id: string;
  data: string;
  quantidade: number;
  pesoMedioCampo: number;
  quebraEstimada: number;
  pesoLiquidoProjetado: number;
  frigorifico: string;
  status: 'Pendente' | 'Aguardando GTA' | 'Realizado';
  valorArroba?: number;
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface InsumoUsado {
  id: string;
  nome: string;
  quantidade: number;
}

export interface Reproducao {
  id: string;
  animal_id: string; // Changed from 'animal' string to 'animal_id' for consistency
  protocolo: string;
  dataInicio: string;
  previsaoDiagnostico: string;
  status: 'Em Protocolo' | 'Prenhe' | 'Vazia' | 'Parto Previsto';
  insumos: InsumoUsado[];
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface Confinamento {
  id: string;
  lote_id: string; // Changed from 'lote' string to 'lote_id'
  curral: string;
  qtdAnimais: number;
  dataEntrada: string;
  previsaoSaida: string;
  diasNoCochos: number;
  dieta: string;
  imgAnterior: number; // Ingestão Matéria Seca
  status: 'Em Engorda' | 'Finalizando' | 'Saída Programada';
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface SalesItem {
  id: string;
  brinco: string;
  raca: string;
  sexo: string;
  peso: number;
  valorKg: number;
  subtotal: number;
}

export interface SalesOrder {
  id: string;
  numero: string;
  data: string;
  cliente_id: string;
  qtdCabecas: number;
  pesoTotal: number;
  valorTotal: number;
  status: 'Pendente' | 'Confirmado' | 'Faturado' | 'Entregue' | 'Cancelado';
  itens: SalesItem[];
  empresaId?: string;
  tenant_id: string;
  created_at?: string;
}

export interface PurchaseItem {
  id: string;
  insumo_id: string;
  insumoNome: string;
  categoria: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  centroCustoId?: string;
  desconto?: number;
}

export interface PurchaseOrder {
  id: string;
  numero: string;
  data: string;
  fornecedor_id: string;
  fornecedorNome: string;
  mapaReferencia?: string;
  previsaoEntrega: string;
  condicaoPagamento: string;
  valorTotal: number;
  status: 'Pendente' | 'Confirmado' | 'Em Trânsito' | 'Entregue' | 'Cancelado';
  itens: PurchaseItem[];
  empresaId: string;
  tenant_id: string;
  created_at?: string;
}

export interface AccountingAccount {
  id: string;
  codigo: string;
  nome: string;
  nivel: number;
  tipo: 'Sint\u00e9tica' | 'Anal\u00edtica';
  flagCaixa: boolean;
  flagEstoque: boolean;
  flagControle: boolean;
  paiId: string | null;
  expanded?: boolean;
  tenant_id?: string;
}

export interface AccountingEntry {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  tipo: 'Entrada' | 'Sa\u00edda';
  valor: number;
  conta: string;
  empresaId?: string;
  tenant_id?: string;
}

export interface TaxApuracao {
  id: string;
  imposto: string;
  periodo: string;
  valor: number;
  vencimento: string;
  status: 'Pago' | 'Pendente' | 'Vencido';
  empresaId?: string;
  tenant_id?: string;
}

export interface Subcategoria {
  id: string;
  nome: string;
  descricao: string;
  status: 'Ativo' | 'Inativo';
  empresaCnpj?: string;
  contaContabilId?: string;
  tenant_id?: string;
}

export interface Categoria {
  id: string;
  id_cor: string;
  nome: string;
  subcategoriasCount: number;
  subcategorias: Subcategoria[];
  tenant_id?: string;
}

export interface UnidadeMedida {
  id: string;
  sigla: string;
  nome: string;
  tipo: string;
  tenant_id?: string;
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
  crt: '1' | '2' | '3'; // 1: Simples, 2: Simples Excesso, 3: Normal
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
  tenant_id?: string;
}

export interface ItemSolicitacao {
  id: string;
  insumoId: string;
  insumoNome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  centroCustoId?: string;
}

export interface SolicitacaoCompra {
  id: string;
  numero: string;
  data: string;
  solicitante: string;
  prioridade: 'Normal' | 'Alta' | 'Urgente' | 'Crítico';
  status: 'Pendente' | 'Em Cotação' | 'Aprovado' | 'Recusado';
  itens: ItemSolicitacao[];
  valorTotal: number;
  empresaId: string;
  tenant_id: string;
  created_at?: string;
}

export interface Bid {
  id: string;
  supplierId: string;
  supplierName: string;
  price: number;
  deliveryDays: number;
  paymentTerms: string;
  selected: boolean;
}

export interface CotacaoItem {
  id: string;
  insumoId: string;
  insumoNome: string;
  quantidade: number;
  unidade: string;
  bids: Bid[];
}

export interface MapaCotacao {
  id: string;
  numero: string;
  data: string;
  status: 'Em Aberto' | 'Finalizado' | 'Cancelado';
  empresaId: string;
  itens: CotacaoItem[];
  valorTotal: number;
  tenant_id: string;
  created_at?: string;
}

export interface ItemNota {
  id: string;
  insumoId: string;
  insumoNome: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
  // Fiscal
  ncm: string;
  cest?: string;
  cfop: string;
  origem: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
  // Impostos
  cst_icms: string;
  baseIcms: number;
  aliquotaIcms: number;
  valorIcms: number;
  cst_pis?: string;
  aliquotaPis?: number;
  valorPis?: number;
  cst_cofins?: string;
  aliquotaCofins?: number;
  valorCofins?: number;
  cst_ipi?: string;
}

export interface NotaEntrada {
  id: string;
  chaveAcesso: string;
  numero: string;
  serie: string;
  naturezaOperacao: string;
  indPres: '0' | '1' | '2' | '3' | '4' | '9';
  dataEmissao: string;
  dataEntrada: string;
  fornecedorId: string;
  fornecedorNome: string;
  status: 'Processada' | 'Pendente' | 'Cancelada';
  empresaId: string;
  // Fiscal snapshots
  inscricaoEstadual?: string;
  indIEDest?: string;
  cMun?: string;
  cPais?: string;
  itens: ItemNota[];
  // Totais
  valorProdutos: number;
  valorFrete: number;
  valorSeguro: number;
  valorDesconto: number;
  valorOutrasDespesas: number;
  valorIcmsTotal: number;
  valorIpiTotal?: number;
  valorTotal: number;
  // Transporte
  modFrete: '0' | '1' | '2' | '3' | '9';
  transportadoraId?: string;
  placaVeiculo?: string;
  ufVeiculo?: string;
  pesoBruto?: number;
  pesoLiquido?: number;
  // Metadata
  tenant_id: string;
  created_at?: string;
}

export interface InvoiceItem {
  id: string;
  produto_id: string;
  descricao: string;
  ncm: string;
  cest?: string;
  cfop: string;
  origem: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  // Impostos
  cst_icms: string; // Ex: 00, 10, 20... or 101, 102 for Simples
  baseIcms: number;
  aliquotaIcms: number;
  valorIcms: number;
  cst_ipi?: string;
  aliquotaIpi?: number;
  valorIpi?: number;
  cst_pis?: string;
  aliquotaPis?: number;
  valorPis?: number;
  cst_cofins?: string;
  aliquotaCofins?: number;
  valorCofins?: number;
}

export interface SalesInvoice {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso?: string;
  naturezaOperacao: string;
  indPres: '0' | '1' | '2' | '3' | '4' | '9'; // Indicador Presença
  dataEmissao: string;
  dataSaida: string;
  cliente_id: string;
  empresaId?: string; // Unidade emissora (Matriz ou Filial)
  // Fiscal snapshots
  nomeDestinatario?: string;
  documentoDestinatario?: string;
  inscricaoEstadualDestinatario?: string;
  indIEDest?: string;
  cMun?: string;
  cPais?: string;
  status: 'Pendente' | 'Processada' | 'Processado' | 'Rejeitada' | 'Cancelada' | 'Cancelado' | 'Contingência' | 'Confirmado' | 'Faturado' | 'Entregue';
  itens: InvoiceItem[] | any[];
  // Totais
  valorProdutos: number;
  valorFrete: number;
  valorSeguro: number;
  valorDesconto: number;
  valorOutrasDespesas: number;
  valorIpi: number;
  valorIcms: number;
  valorTotal: number;
  // Transporte
  modFrete: '0' | '1' | '2' | '3' | '9'; // 0: Emitente, 1: Destinatário, 2: Terceiros, 9: Sem Frete
  transportadora_id?: string;
  placa?: string;
  uf_placa?: string;
  pesoLiquido?: number;
  pesoBruto?: number;
  volumes?: number;
  // Cobrança / Pagamento
  meioPagamento: string; // Meio de pagamento SEFAZ
  // Livestock specific (backward compatibility)
  data?: string;
  qtdCabecas?: number;
  pesoTotal?: number;
  observacoes?: string;
  tenant_id: string;
  created_at?: string;
}

export type OpportunityStage = 'Novo' | 'Qualificacao' | 'Proposta' | 'Negociacao' | 'Fechado' | 'Perdido';

export interface Opportunity {
  id: string;
  titulo: string;
  valor: number;
  vencimento: string;
  cliente_id?: string;
  contato_nome: string;
  contato_tel?: string;
  contato_email?: string;
  estagio: OpportunityStage;
  probabilidade: number;
  origem: string;
  descricao?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  id: string;
  farmName: string;
  primaryColor: string;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    app: boolean;
    whatsapp: boolean;
  };
  tenant_id?: string;
  updated_at?: string;
}
