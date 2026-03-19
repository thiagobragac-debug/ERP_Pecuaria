import { db } from './db';
import { 
  mockAnimals, 
  mockDietas, 
  mockRegistrosSanitarios, 
  mockLotes, 
  mockPastos 
} from '../data/mockData';
import { MOCK_BANKS } from '../data/bankData';
import { MOCK_SUPPLIERS } from '../data/supplierData';
import { Cliente } from '../types';

const MOCK_CLIENTES: Cliente[] = [
  { id: 'C1', nome: 'Frigorífico Estrela', nomeFantasia: 'Estrela', email: 'contato@estrela.com.br', telefone: '(67) 3344-5566', documento: '00.000.000/0001-00', status: 'Ativo', tenant_id: 'default', limiteCredito: 100000, indIEDest: '1' },
  { id: 'C2', nome: 'Pecuária Sul', nomeFantasia: 'Pecuária Sul', email: 'vendas@pcsul.com.br', telefone: '(51) 3222-1100', documento: '11.111.111/0001-11', status: 'Ativo', tenant_id: 'default', limiteCredito: 50000, indIEDest: '1' },
  { id: 'C3', nome: 'Recria Forte', nomeFantasia: 'Recria Forte', email: 'jose@recriaforte.com.br', telefone: '(62) 9988-7766', documento: '22.222.222/0001-22', status: 'Ativo', tenant_id: 'default', limiteCredito: 80000, indIEDest: '9' },
];

const MOCK_OPPORTUNITIES: any[] = [
  { id: 'O1', titulo: 'Venda de 200 Bezerros Nelore', valor: 450000, estagio: 'Negociacao', probabilidade: 75, contato_nome: 'Marcos Vinícius', contato_tel: '(67) 99222-3344', contato_email: 'marcos@agro.com', vencimento: '2024-04-15', tenant_id: 'default', created_at: new Date().toISOString() },
  { id: 'O2', titulo: 'Contrato de Fornecimento Semestral', valor: 1200000, estagio: 'Proposta', probabilidade: 50, contato_nome: 'Cláudio Estrela', contato_tel: '(67) 3322-1100', contato_email: 'claudio@frigorifico.com', vencimento: '2024-05-20', tenant_id: 'default', created_at: new Date().toISOString() },
  { id: 'O3', titulo: 'Venda Reprodutores PO', valor: 85000, estagio: 'Fechado', probabilidade: 100, contato_nome: 'Ricardo Sul', contato_tel: '(51) 98877-6655', contato_email: 'ricardo@sul.com', vencimento: '2024-03-10', tenant_id: 'default', created_at: new Date().toISOString() },
  { id: 'O4', titulo: 'Exportação Lote Premium', valor: 3500000, estagio: 'Qualificacao', probabilidade: 25, contato_nome: 'John Zhang', contato_tel: '+86 21 1234 5678', contato_email: 'zhang@export.cn', vencimento: '2024-06-30', tenant_id: 'default', created_at: new Date().toISOString() },
];

const MOCK_SALES: any[] = [
  { 
    id: 'S1', numero: '2501', serie: '1', naturezaOperacao: 'Venda de Produção', 
    indPres: '1', modFrete: '0', meioPagamento: '15',
    dataEmissao: new Date().toISOString().split('T')[0], dataSaida: new Date().toISOString().split('T')[0],
    cliente_id: 'C1', valorTotal: 345000, status: 'Processada', tenant_id: 'default',
    itens: [{ 
      id: 'I1', produto_id: 'PROD1', descricao: 'Bovino Nelore (Bezerro)', quantidade: 100, valorUnitario: 3450, valorTotal: 345000,
      ncm: '0102.29.90', cfop: '5.101', origem: '0', cst_icms: '101', aliquotaIcms: 12, valorIcms: 41400
    }]
  },
  { 
    id: 'S2', numero: '2502', serie: '1', naturezaOperacao: 'Venda de Produção', 
    indPres: '1', modFrete: '1', meioPagamento: '01',
    dataEmissao: new Date().toISOString().split('T')[0], dataSaida: new Date().toISOString().split('T')[0],
    cliente_id: 'C2', valorTotal: 125000, status: 'Pendente', tenant_id: 'default',
    itens: [{ 
      id: 'I2', produto_id: 'PROD2', descricao: 'Novilhas Nelore', quantidade: 40, valorUnitario: 3125, valorTotal: 125000,
      ncm: '0102.29.90', cfop: '5.101', origem: '0', cst_icms: '101', aliquotaIcms: 12, valorIcms: 15000
    }]
  }
];

const mockSolicitacoes: any[] = [
  {
    id: 'S1',
    numero: 'REQ-2024-001',
    data: '2024-03-20',
    solicitante: 'João Silva',
    prioridade: 'Normal',
    status: 'Pendente',
    itens: [
      { id: 'I1', insumoId: '1', insumoNome: 'Milho Grão', quantidade: 5000, unidade: 'kg', preco: 1.20 }
    ],
    valorTotal: 6000,
    empresaId: 'default',
    tenant_id: 'default'
  }
];

const mockMapas: any[] = [
  {
    id: 'M1',
    numero: 'MAP-2024-001',
    data: '2024-03-21',
    status: 'Em Aberto',
    empresaId: 'default',
    itens: [
      {
        id: 'CI1',
        insumoId: '1',
        insumoNome: 'Milho Grão',
        quantidade: 5000,
        unidade: 'kg',
        bids: [
          { id: 'B1', supplierId: 'S1', supplierName: 'Agro Campo', price: 1.15, deliveryDays: 3, paymentTerms: '30 dias', selected: true },
          { id: 'B2', supplierId: 'S2', supplierName: 'Cerealista Sul', price: 1.20, deliveryDays: 2, paymentTerms: 'A vista', selected: false }
        ]
      }
    ],
    valorTotal: 5750,
    tenant_id: 'default'
  }
];

const mockNotas: any[] = [
  {
    id: 'N1',
    chaveAcesso: '35240312345678000199550010000001231234567890',
    numero: '123',
    serie: '1',
    dataEmissao: '2024-03-22',
    dataEntrada: '2024-03-23',
    fornecedorId: 'S1',
    fornecedorNome: 'Agro Campo',
    valorTotal: 5750,
    valorIcmsTotal: 690,
    status: 'Processada',
    empresaId: 'default',
    itens: [
      { id: 'NI1', insumoId: '1', insumoNome: 'Milho Grão', quantidade: 5000, unidade: 'kg', precoUnitario: 1.15, subtotal: 5750, baseIcms: 5750, valorIcms: 690, aliquotaIcms: 12 }
    ],
    tenant_id: 'default'
  }
];
const MOCK_EMPRESAS: any[] = [
  {
    id: 'M1',
    isMatriz: true,
    razaoSocial: 'Agropecuária Horizonte LTDA',
    nomeFantasia: 'Fazenda Horizonte',
    cnpj: '00.123.456/0001-99',
    inscricaoEstadual: '123456789',
    inscricaoMunicipal: '987654',
    regimeTributario: 'Simples Nacional',
    crt: '1',
    tipoLogradouro: 'Rodovia',
    logradouro: 'BR-163, KM 450',
    numero: 'S/N',
    bairro: 'Zona Rural',
    cidade: 'Cuiabá',
    estado: 'MT',
    pais: 'Brasil',
    cep: '78000-000',
    telefone: '(65) 3621-1234',
    email: 'financeiro@horizonte.com.br',
    responsavel: 'Thiago Costa',
    status: 'Ativa',
    tenant_id: 'default'
  }
];

export const seedDatabase = async () => {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    
    console.log('Database version:', db.verno);
    
    // Pesagem / Sanidade / Herd (v10+)
    const animaisCount = await db.animais.count();
    if (animaisCount === 0) {
      console.log('Seeding Herd Data...');
      await Promise.all([
        db.lotes.bulkPut(mockLotes),
        db.pastos.bulkPut(mockPastos),
        db.animais.bulkPut(mockAnimals),
        db.dietas.bulkPut(mockDietas),
        db.registrosSanitarios.bulkPut(mockRegistrosSanitarios),
        db.bancos.bulkPut(MOCK_BANKS.map(b => ({ ...b, tenant_id: 'default' }))),
        db.fornecedores.bulkPut(MOCK_SUPPLIERS.map(s => ({ ...s, tenant_id: 'default' }))),
      ]);
    }

    // Vendas & CRM (v21+)
    try {
      const clientesCount = await db.clientes.count();
      if (clientesCount === 0) {
        console.log('Seeding Clientes...');
        await db.clientes.bulkPut(MOCK_CLIENTES);
      }
      
      const empresasCount = await db.empresas.count();
      if (empresasCount === 0) {
        console.log('Seeding Empresas...');
        await db.empresas.bulkPut(MOCK_EMPRESAS);
      }
    } catch (e) { console.warn('Seeding Clientes/Empresas skipped/failed:', e); }

    try {
      const oppsCount = await db.oportunidades.count();
      if (oppsCount === 0) {
        console.log('Seeding Oportunidades...');
        await db.oportunidades.bulkPut(MOCK_OPPORTUNITIES);
      }
    } catch (e) { console.warn('Seeding Oportunidades skipped/failed:', e); }

    try {
      const salesCount = await db.pedidos_venda.count();
      if (salesCount === 0) {
        console.log('Seeding Vendas...');
        await db.pedidos_venda.bulkPut(MOCK_SALES);
      }
    } catch (e) { console.warn('Seeding Vendas skipped/failed:', e); }

    // Suprimentos (v17+)
    const solCount = await db.solicitacoes_compra.count();
    if (solCount === 0) {
      const financialMocks = [
        {
          id: 'T1',
          desc: 'Compra de Insumos - NF 1234',
          valor: 5500.00,
          data: '2024-03-25',
          vencimento: '2024-03-25',
          tipo: 'out',
          status: 'Pendente',
          categoria: 'Insumos',
          tenant_id: 'default'
        },
        {
          id: 'T2',
          desc: 'Venda de Bezerras - Lote 05',
          valor: 15400.00,
          data: '2024-03-18',
          vencimento: '2024-03-18',
          tipo: 'in',
          status: 'Pago',
          categoria: 'Venda Animais',
          tenant_id: 'default'
        }
      ];

      await Promise.all([
        db.transacoes.bulkPut(financialMocks as any),
        db.solicitacoes_compra.bulkPut(mockSolicitacoes),
        db.mapas_cotacao.bulkPut(mockMapas),
        db.notas_entrada.bulkPut(mockNotas)
      ]);
    }
  } catch (err: any) {
    console.error('Seeding error (Detailed):', err.name, err.message, err.stack || err);
    if (err.name === 'VersionChangeError') {
       console.warn('Database version conflict detected. Attempting to recover...');
    }
  }
};
