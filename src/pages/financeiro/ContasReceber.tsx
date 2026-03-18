import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  FileText,
  CreditCard,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Check
} from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { MOCK_BANKS } from '../../data/bankData';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import './ContasReceber.css';
import './Settlement.css';

interface ClienteMock {
  id: string;
  nome: string;
}

const MOCK_CLIENTES: ClienteMock[] = [
  { id: 'C1', nome: 'Frigorífico Estrela' },
  { id: 'C2', nome: 'Leilão Regional' },
  { id: 'C3', nome: 'Agropecuária Vale Verde' }
];

interface ContaReceber {
  id: string;
  descricao: string;
  clienteId: string;
  clienteNome: string;
  valor: number;
  dataVencimento: string;
  dataRecebimento?: string;
  status: 'Pendente' | 'Recebido' | 'Atrasado';
  categoria: string;
  empresaId: string;
}

const mockContas: ContaReceber[] = [
  {
    id: '1',
    descricao: 'Venda de 50 Novilhas - Lote 22',
    clienteId: 'C1',
    clienteNome: 'Frigorífico Estrela',
    valor: 125000.00,
    dataVencimento: '2024-03-28',
    status: 'Pendente',
    categoria: 'Venda de Gado',
    empresaId: 'M1'
  },
  {
    id: '2',
    descricao: 'Serviço de Pastoreio - Fazenda Norte',
    clienteId: 'C3',
    clienteNome: 'Agropecuária Vale Verde',
    valor: 4500.00,
    dataVencimento: '2024-03-10',
    status: 'Atrasado',
    categoria: 'Serviços',
    empresaId: 'M1'
  },
  {
    id: '3',
    descricao: 'Adiantamento Venda Futura',
    clienteId: 'C2',
    clienteNome: 'Leilão Regional',
    valor: 25000.00,
    dataVencimento: '2024-03-01',
    dataRecebimento: '2024-03-01',
    status: 'Recebido',
    categoria: 'Venda de Gado',
    empresaId: 'F1'
  }
];

export const ContasReceber = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState({
    descricao: '',
    cliente: 'Todos',
    vencimento: '',
    valor: '',
    status: 'Todos'
  });

  // Settlement Form State
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankAccountId, setBankAccountId] = useState('B1');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [interest, setInterest] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Form State
  const [descricao, setDescricao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState(0);
  const [dataVencimento, setDataVencimento] = useState('');
  const [categoria, setCategoria] = useState('');
  const [empresaId, setEmpresaId] = useState('M1');

  const filteredData = mockContas.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = r.clienteNome.toLowerCase().includes(searchLower) || 
                         r.descricao.toLowerCase().includes(searchLower) ||
                         r.categoria.toLowerCase().includes(searchLower) ||
                         r.valor.toString().includes(searchLower) ||
                         r.status.toLowerCase().includes(searchLower) ||
                         r.dataVencimento.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || r.status === filterStatus;
    const matchesCategoria = filterCategoria === 'Todos' || r.categoria === filterCategoria;
    
    const matchesColumnFilters = 
      (columnFilters.descricao === '' || r.descricao.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
      (columnFilters.cliente === 'Todos' || r.clienteNome === columnFilters.cliente) &&
      (columnFilters.vencimento === '' || r.dataVencimento.toLowerCase().includes(columnFilters.vencimento.toLowerCase())) &&
      (columnFilters.valor === '' || r.valor.toString().includes(columnFilters.valor)) &&
      (columnFilters.status === 'Todos' || r.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesCategoria && matchesColumnFilters;
  });

  const categorias = Array.from(new Set(mockContas.map(r => r.categoria)));

  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    itemsPerPage,
    setItemsPerPage,
    goToPage, 
    nextPage, 
    prevPage, 
    startIndex, 
    endIndex, 
    totalItems 
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  useEscapeKey(() => {
    setIsModalOpen(false);
    setIsSettlementOpen(false);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getSelectedTotal = () => {
    return mockContas
      .filter(c => selectedIds.includes(c.id))
      .reduce((acc, curr) => acc + curr.valor, 0);
  };

  const getSettlementItems = () => {
    return mockContas.filter(c => selectedIds.includes(c.id));
  };

  const handleOpenModal = (conta: ContaReceber | null = null, view = false) => {
    if (conta) {
      setSelectedConta(conta);
      setDescricao(conta.descricao);
      setClienteId(conta.clienteId);
      setValor(conta.valor);
      setDataVencimento(conta.dataVencimento);
      setCategoria(conta.categoria);
      setEmpresaId(conta.empresaId);
      setIsViewMode(view);
    } else {
      setSelectedConta(null);
      setDescricao('');
      setClienteId('');
      setValor(0);
      setDataVencimento(new Date().toISOString().split('T')[0]);
      setCategoria('');
      setEmpresaId('M1');
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1>Contas a Receber</h1>
            <p className="description">Gestão de faturamentos e recebíveis previstos para sua fazenda.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card pending animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Total a Receber</span>
            <span className="summary-value">R$ 154.500,00</span>
            <p className="mt-3 text-indigo-600 font-bold flex items-center gap-2">
              <Building2 size={16} strokeWidth={3} /> Inclui R$ 45k de Vendas NF-e
            </p>
          </div>
          <div className="summary-icon" style={{ '--accent-rgb': '99, 102, 241' } as any}>
            <DollarSign size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card overdue animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Em Atraso</span>
            <span className="summary-value">R$ 4.500,00</span>
            <p className="mt-3 text-red-500 font-black flex items-center gap-2">
              <AlertCircle size={16} /> Cobrança prioritária
            </p>
          </div>
          <div className="summary-icon" style={{ '--accent-rgb': '239, 68, 68' } as any}>
            <Clock size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card received animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Recebidos (Mês)</span>
            <span className="summary-value">R$ 25.000,00</span>
            <p className="mt-3 text-emerald-500 font-bold flex items-center gap-2">
              <CheckCircle2 size={16} strokeWidth={3} /> Fluxo de caixa saudável
            </p>
          </div>
          <div className="summary-icon" style={{ '--accent-rgb': '16, 185, 129' } as any}>
            <Check size={40} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por descrição, cliente ou documento..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />


        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell" style={{ width: '80px' }}>
                <div className={`custom-checkbox ${selectedIds.length > 0 && selectedIds.length === filteredData.filter(c => c.status !== 'Recebido').length ? 'active' : ''}`}
                     onClick={() => setSelectedIds(selectedIds.length === 0 ? filteredData.filter(c => c.status !== 'Recebido').map(c => c.id) : [])}>
                  {selectedIds.length > 0 && <Check size={18} strokeWidth={4} />}
                </div>
              </th>
              <th>Descrição do Recebível</th>
              <th>Parceiro / Cliente</th>
              <th>Data Venc.</th>
              <th>Valor Previsto</th>
              <th>Status</th>
              <th className="text-center">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'checkbox', type: 'empty' },
                  { key: 'descricao', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'cliente', type: 'select', options: MOCK_CLIENTES.map(c => c.nome) },
                  { key: 'vencimento', type: 'text', placeholder: 'Data...' },
                  { key: 'valor', type: 'text', placeholder: 'Valor...' },
                  { key: 'status', type: 'select', options: ['Pendente', 'Recebido', 'Atrasado'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map(conta => (
              <tr key={conta.id} className={selectedIds.includes(conta.id) ? 'selected' : ''}>
                <td className="checkbox-cell">
                  {conta.status !== 'Recebido' && (
                    <div className={`custom-checkbox ${selectedIds.includes(conta.id) ? 'active' : ''}`}
                         onClick={() => toggleSelect(conta.id)}>
                      {selectedIds.includes(conta.id) && <Check size={18} strokeWidth={4} className="text-white" />}
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2 py-2">
                    <span className="font-extrabold text-slate-800 text-lg leading-tight">{conta.descricao}</span>
                    <span className="text-slate-300 font-medium">—</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-wider whitespace-nowrap border border-indigo-100/50">
                      {conta.categoria}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 border border-slate-200">
                      {conta.clienteNome.substring(0, 1)}
                    </div>
                    <span className="font-bold text-slate-700">{conta.clienteNome}</span>
                  </div>
                </td>
                <td>
                  <div className={`flex items-center gap-3 font-black ${conta.status === 'Atrasado' ? 'text-red-400' : 'text-slate-300'}`}>
                    <Calendar size={18} strokeWidth={3} />
                    {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td>
                  <span className="font-black text-slate-900 text-xl">R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </td>
                <td>
                  <span className={`status-badge ${conta.status.toLowerCase()}`}>
                    {conta.status === 'Recebido' ? <CheckCircle2 size={16} strokeWidth={3} /> : (conta.status === 'Atrasado' ? <AlertCircle size={16} strokeWidth={3} /> : <Clock size={16} strokeWidth={3} />)}
                    {conta.status === 'Atrasado' ? 'Vencida' : conta.status}
                  </span>
                </td>
                <td className="text-center">
                  <div className="actions-cell">
                    <button className="action-btn-global btn-view" onClick={() => handleOpenModal(conta, true)} title="Ver Detalhes">
                      <Eye size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-edit" onClick={() => handleOpenModal(conta)} title="Editar">
                      <Edit size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-delete" title="Excluir">
                      <Trash2 size={18} strokeWidth={3} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          onPageChange={goToPage}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onItemsPerPageChange={setItemsPerPage}
          label="registros financeiros"
        />
      </div>

      {/* Floating Batch Bar */}
      <div className={`batch-action-bar ${selectedIds.length > 0 ? 'visible' : ''}`}>
        <div className="selection-info">
          <span className="count">{selectedIds.length}</span>
          recebíveis selecionados — <span className="font-bold text-green-400">R$ {getSelectedTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <button className="btn-premium-solid" onClick={() => setIsSettlementOpen(true)}>
          <Check size={18} strokeWidth={3} />
          <span>Liquidar (Receber)</span>
        </button>
        <button className="view-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8' }} onClick={() => setSelectedIds([])}>
          Cancelar
        </button>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Detalhes do Recebível' : (selectedConta ? 'Editar Lançamento' : 'Novo Conta a Receber')}
        subtitle="Previsão e controle de entradas financeiras."
        icon={TrendingUp}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={() => setIsModalOpen(false)}>
                <CheckCircle2 size={18} strokeWidth={3} />
                <span>{selectedConta ? 'Salvar Alterações' : 'Registrar Recebível'}</span>
              </button>
            )}
          </div>
        }
        size="lg"
      >
        <div className="form-sections-grid">
          <div className="form-section">
            <div className="form-grid">
              <div className="form-group col-12">
                <label>Descrição da Receita</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Venda de Lote de Bezerras"
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group col-4">
                <label>Cliente</label>
                <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} disabled={isViewMode}>
                  <option value="">Selecione o cliente...</option>
                  {MOCK_CLIENTES.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="form-group col-4">
                <label>Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={isViewMode}>
                  <option value="">Selecione a categoria...</option>
                  <option value="Venda de Gado">Venda de Gado</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Produtos Agrícolas">Produtos Agrícolas</option>
                </select>
              </div>

              <div className="form-group col-4">
                <label>Empresa Destino</label>
                <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} disabled={isViewMode}>
                  {INITIAL_COMPANIES.filter(c => c.status === 'Ativa').map(c => (
                    <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                  ))}
                </select>
              </div>

              <div className="form-group col-6">
                <label>Valor Esperado (R$)</label>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(parseFloat(e.target.value))}
                  disabled={isViewMode}
                  step="0.01"
                />
              </div>

              <div className="form-group col-6">
                <label>Data de Vencimento</label>
                <input
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>
        </div>
      </StandardModal>

      {/* Settlement/Liquidation Modal */}
      <StandardModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        title="Liquidação de Recebíveis"
        subtitle="Registro de recebimento e baixa financeira."
        icon={CheckCircle2}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsSettlementOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo" onClick={() => {
              setIsSettlementOpen(false);
              setSelectedIds([]);
            }}>
              <Check size={18} strokeWidth={3} />
              <span>Confirmar Recebimento</span>
            </button>
          </div>
        }
        size="md"
      >
        <div className="settlement-modal-content">
          <div className="selected-items-summary">
            <h4>Recebíveis selecionados</h4>
            <div className="items-list">
              {getSettlementItems().map(item => (
                <div key={item.id} className="mini-item">
                  <span>{item.descricao}</span>
                  <span className="val">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="form-grid">
            <div className="form-group col-6">
              <label>Data do Recebimento</label>
              <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} />
            </div>
            <div className="form-group col-6">
              <label>Conta Bancária (Destino)</label>
              <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}>
                {MOCK_BANKS.map(b => (
                  <option key={b.id} value={b.id}>{b.banco} - Saldo: R${b.saldo.toLocaleString('pt-BR')}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-6">
              <label>Forma de Recebimento</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="PIX">PIX</option>
                <option value="TED">Transferência (TED)</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Cartão">Cartão de Crédito</option>
                <option value="Dinheiro">Espécie / Dinheiro</option>
              </select>
            </div>
            <div className="form-group col-6">
              <label>Juros / Multas (+)</label>
              <input type="number" value={interest} onChange={(e) => setInterest(parseFloat(e.target.value) || 0)} step="0.01" />
            </div>
            <div className="form-group col-12">
              <label>Descontos / Abatimentos (-)</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} step="0.01" />
            </div>
          </div>

          <div className="settlement-total-banner">
            <div className="info">
              <span className="label">Total Líquido Estimado</span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Soma dos títulos + ajustes financeiros</p>
            </div>
            <div className="value">
              R$ {(getSelectedTotal() + interest - discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

