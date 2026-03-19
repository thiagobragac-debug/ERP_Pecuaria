import Dexie, { Table } from 'dexie';
import { 
  Animal, Dieta, RegistroSanitario, Lote, Pasto, Transacao, Insumo, 
  MovimentacaoEstoque, SessaoInventario, BankAccount, Supplier, Cliente, 
  Asset, Abastecimento, Manutencao, Pesagem, Abate, Reproducao, 
  Confinamento, SalesInvoice, PurchaseOrder, SolicitacaoCompra, 
  MapaCotacao, NotaEntrada, AccountingAccount, AccountingEntry, 
  TaxApuracao, Company, Categoria, UnidadeMedida, Profile, 
  AppSettings, Opportunity, AccessRole
} from '../types';

export interface SyncItem {
  id?: number;
  table: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

export class PecuariaDB extends Dexie {
  animais!: Table<Animal>;
  lotes!: Table<Lote>;
  pastos!: Table<Pasto>;
  dietas!: Table<Dieta>;
  registrosSanitarios!: Table<RegistroSanitario>;
  transacoes!: Table<Transacao>;
  insumos!: Table<Insumo>;
  movimentacoes_estoque!: Table<MovimentacaoEstoque>;
  sessoes_inventario!: Table<SessaoInventario>;
  bancos!: Table<BankAccount>;
  fornecedores!: Table<Supplier>;
  clientes!: Table<Cliente>;
  ativos!: Table<Asset>;
  abastecimentos!: Table<Abastecimento>;
  manutencoes!: Table<Manutencao>;
  pesagens!: Table<Pesagem>;
  abates!: Table<Abate>;
  reproducao!: Table<Reproducao>;
  confinamento!: Table<Confinamento>;
  pedidos_venda!: Table<SalesInvoice>;
  pedidos_compra!: Table<PurchaseOrder>;
  plano_contas!: Table<AccountingAccount>;
  lancamentos_contabeis!: Table<AccountingEntry>;
  apuracoes_impostos!: Table<TaxApuracao>;
  empresas!: Table<Company>;
  categorias_definicao!: Table<Categoria>;
  unidades_medida!: Table<UnidadeMedida>;
  solicitacoes_compra!: Table<SolicitacaoCompra>;
  mapas_cotacao!: Table<MapaCotacao>;
  notas_entrada!: Table<NotaEntrada>;
  profiles!: Table<Profile>;
  settings!: Table<AppSettings>;
  oportunidades!: Table<Opportunity>;
  sync_queue!: Table<SyncItem>;
  access_roles!: Table<AccessRole>;

  constructor() {
    super('PecuariaDB_ULTRA_V3');
    
    // Consolidated Schema for Version 23
    this.version(23).stores({
      animais: '++id, brinco, lote, pasto, status, empresaId, tenant_id',
      lotes: '++id, nome, status, empresaId, tenant_id',
      pastos: '++id, nome, status, empresaId, tenant_id',
      dietas: 'id, nome, status',
      registrosSanitarios: 'id, animal_id, lote_id, status, tenant_id',
      transacoes: 'id, tipo, status, categoria, empresaId, tenant_id',
      insumos: 'id, categoria, status, tenant_id',
      movimentacoes_estoque: 'id, insumo_id, tipo, status, empresaId, tenant_id',
      sessoes_inventario: 'id, data, status',
      bancos: 'id, nome, empresaId',
      fornecedores: 'id, nome',
      clientes: 'id, nome',
      ativos: 'id, nome, empresaId',
      abastecimentos: 'id, data, empresaId',
      manutencoes: 'id, data, empresaId',
      pesagens: 'id, animal_id, data',
      abates: 'id, data, lote',
      reproducao: 'id, data',
      confinamento: 'id, data',
      pedidos_venda: 'id, numero, cliente_id, status, empresaId',
      pedidos_compra: 'id, numero, fornecedorId, status, empresaId',
      plano_contas: 'id, codigo, nome',
      lancamentos_contabeis: 'id, data, descricao, empresaId',
      apuracoes_impostos: 'id, imposto, periodo, empresaId',
      empresas: 'id, razaoSocial, cnpj, parentId',
      categorias_definicao: 'id, nome',
      unidades_medida: 'id, sigla, nome',
      solicitacoes_compra: 'id, numero, status, solicitante, empresaId',
      mapas_cotacao: 'id, numero, status, empresaId',
      notas_entrada: 'id, numero, fornecedorId, status, empresaId',
      profiles: 'id, full_name, email, role',
      settings: '++id, farmName',
      oportunidades: 'id, titulo, cliente_id, estagio, empresaId, tenant_id',
      sync_queue: '++id, table, action, timestamp',
      access_roles: 'id, nome'
    });
  }
}

export const db = new PecuariaDB();
