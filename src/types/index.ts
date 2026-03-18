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
  tenant_id: string;
  created_at?: string;
}

export interface Pasto {
  id: string;
  nome: string;
  area_ha: number;
  capacidade_ua: number;
  pasto_tipo?: string;
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
  tenant_id?: string;
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
export interface SaasPixConfig {
  pix_key: string;
  merchant_name: string;
  merchant_city: string;
  is_active: boolean;
}
