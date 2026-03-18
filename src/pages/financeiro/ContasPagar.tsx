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
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  FileText,
  CreditCard,
  Clock,
  ChevronRight,
  ChevronLeft,
  Download,
  Check,
  TrendingUp,
  CreditCard as PaymentIcon,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { MOCK_SUPPLIERS } from '../../data/supplierData';
import { MOCK_BANKS } from '../../data/bankData';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import './ContasPagar.css';
import './Settlement.css';

interface ContaPagar {
  id: string;
  descricao: string;
  fornecedorId: string;
  fornecedorNome: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  categoria: string;
  empresaId: string;
  formaPagamento?: string;
}

const mockContas: ContaPagar[] = [
  {
    id: '1',
    descricao: 'Compra de Insumos - NF 1234',
    fornecedorId: 'F1',
    fornecedorNome: 'AgroQuímica Brasil S.A.',
    valor: 5500.00,
    dataVencimento: '2024-03-25',
    status: 'Pendente',
    categoria: 'Insumos',
    empresaId: 'M1'
  },
  {
    id: '2',
    descricao: 'Manutenção de Trator - OS 445',
    fornecedorId: 'F3',
    fornecedorNome: 'Mecânica Diesel Sul',
    valor: 1200.00,
    dataVencimento: '2024-03-10',
    status: 'Atrasado',
    categoria: 'Manutenção',
    empresaId: 'M1'
  },
  {
    id: '3',
    descricao: 'Energia Elétrica - Março/24',
    fornecedorId: 'F4',
    fornecedorNome: 'Equatorial Energia',
    valor: 850.40,
    dataVencimento: '2024-03-05',
    dataPagamento: '2024-03-05',
    status: 'Pago',
    categoria: 'Utilidades',
    empresaId: 'F1',
    formaPagamento: 'Boleto'
  }
];

export const ContasPagar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState({
    descricao: '',
    fornecedor: 'Todos',
    dataVenc: '',
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
  const [fornecedorId, setFornecedorId] = useState('');
  const [valor, setValor] = useState(0);
  const [dataVencimento, setDataVencimento] = useState('');
  const [categoria, setCategoria] = useState('');
  const [empresaId, setEmpresaId] = useState('M1');
  const [status, setStatus] = useState<'Pendente' | 'Pago' | 'Atrasado'>('Pendente');

  const filteredData = mockContas.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = c.fornecedorNome.toLowerCase().includes(searchLower) || 
                         c.descricao.toLowerCase().includes(searchLower) ||
                         c.categoria.toLowerCase().includes(searchLower) ||
                         c.valor.toString().includes(searchLower) ||
                         c.status.toLowerCase().includes(searchLower) ||
                         c.dataVencimento.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
    const matchesCategoria = filterCategoria === 'Todos' || c.categoria === filterCategoria;
    
    const matchesColumnFilters = 
      (columnFilters.descricao === '' || c.descricao.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
      (columnFilters.fornecedor === 'Todos' || c.fornecedorNome === columnFilters.fornecedor) &&
      (columnFilters.dataVenc === '' || c.dataVencimento.includes(columnFilters.dataVenc)) &&
      (columnFilters.valor === '' || c.valor.toString().includes(columnFilters.valor)) &&
      (columnFilters.status === 'Todos' || c.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesCategoria && matchesColumnFilters;
  });

  const categorias = Array.from(new Set(mockContas.map(c => c.categoria)));

  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    itemsPerPage,
    goToPage, 
    nextPage, 
    prevPage, 
    setItemsPerPage,
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

  const handleOpenModal = (conta: ContaPagar | null = null, view = false) => {
    if (conta) {
      setSelectedConta(conta);
      setDescricao(conta.descricao);
      setFornecedorId(conta.fornecedorId);
      setValor(conta.valor);
      setDataVencimento(conta.dataVencimento);
      setCategoria(conta.categoria);
      setEmpresaId(conta.empresaId);
      setStatus(conta.status);
      setIsViewMode(view);
    } else {
      setSelectedConta(null);
      setDescricao('');
      setFornecedorId('');
      setValor(0);
      setDataVencimento(new Date().toISOString().split('T')[0]);
      setCategoria('');
      setEmpresaId('M1');
      setStatus('Pendente');
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <CreditCard size={24} />
          </div>
          <div>
            <h1>Contas a Pagar</h1>
            <p className="description">Controle de compromissos financeiros e fluxo de saída da sua fazenda.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card pending animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Total em Aberto</span>
            <span className="summary-value">R$ 6.350,40</span>
            <p className="mt-3 text-amber-600 font-bold flex items-center gap-2">
              <Clock size={16} strokeWidth={3} /> 02 contas pendentes
            </p>
          </div>
          <div className="summary-icon">
            <Wallet size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card overdue animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Vencidas / Urgente</span>
            <span className="summary-value">R$ 1.200,00</span>
            <p className="mt-3 text-red-600 font-black flex items-center gap-2">
              <AlertCircle size={16} strokeWidth={3} /> Ação imediata necessária
            </p>
          </div>
          <div className="summary-icon">
            <AlertCircle size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card paid animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Pagos (Mês)</span>
            <span className="summary-value">R$ 850,40</span>
            <p className="mt-3 text-emerald-600 font-bold flex items-center gap-2">
              <CheckCircle2 size={16} strokeWidth={3} /> 01 conta liquidada
            </p>
          </div>
          <div className="summary-icon">
            <TrendingUp size={36} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por descrição, fornecedor ou documento..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell" style={{ width: '80px' }}>
                <div className={`custom-checkbox ${selectedIds.length > 0 && selectedIds.length === mockContas.filter(c => c.status !== 'Pago').length ? 'active' : ''}`}
                     style={{ width: '28px', height: '28px', borderRadius: '8px', border: '2px solid #e2e8f0', background: selectedIds.length > 0 ? '#10b981' : 'transparent' }}
                     onClick={() => setSelectedIds(selectedIds.length === 0 ? mockContas.filter(c => c.status !== 'Pago').map(c => c.id) : [])}>
                  {selectedIds.length > 0 && <Check size={18} strokeWidth={4} className="text-white" />}
                </div>
              </th>
              <th>Descrição da Despesa</th>
              <th>Fornecedor</th>
              <th>Data Venc.</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th className="text-center">Ações</th>
            </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  showActionsPadding={true}
                  columns={[
                    { key: 'descricao', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'fornecedor', type: 'select', options: Array.from(new Set(mockContas.map(c => c.fornecedorNome))) },
                    { key: 'dataVenc', type: 'text', placeholder: 'Data...' },
                    { key: 'valor', type: 'text', placeholder: 'Valor...' },
                    { key: 'status', type: 'select', options: ['Pendente', 'Pago', 'Atrasado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((conta) => (
              <tr key={conta.id} className={selectedIds.includes(conta.id) ? 'selected' : ''}>
                <td className="checkbox-cell">
                  {conta.status !== 'Pago' && (
                    <div className={`custom-checkbox ${selectedIds.includes(conta.id) ? 'active' : ''}`}
                         style={{ width: '28px', height: '28px', borderRadius: '8px', border: '2px solid #e2e8f0', background: selectedIds.includes(conta.id) ? '#10b981' : 'transparent' }}
                         onClick={() => toggleSelect(conta.id)}>
                      {selectedIds.includes(conta.id) && <Check size={18} strokeWidth={4} className="text-white" />}
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2 py-2">
                    <span className="font-extrabold text-slate-800 text-lg leading-tight">{conta.descricao}</span>
                    <span className="text-slate-300 font-medium">—</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-wider whitespace-nowrap border border-emerald-100/50">
                      {conta.categoria}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="solicitante-cell">
                    <div className="avatar-circle indigo">
                      {conta.fornecedorNome.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700">{conta.fornecedorNome}</span>
                  </div>
                </td>
                <td>
                  <div className={`flex items-center gap-3 font-black ${conta.status === 'Atrasado' ? 'text-red-600' : 'text-slate-500'}`}>
                    <Calendar size={18} strokeWidth={3} />
                    {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td>
                  <span className="font-black text-slate-800 text-xl">R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </td>
                <td>
                  <span className={`status-badge ${conta.status.toLowerCase()}`}>
                    {conta.status === 'Pago' ? <CheckCircle2 size={16} strokeWidth={3} /> : (conta.status === 'Atrasado' ? <AlertCircle size={16} strokeWidth={3} /> : <Clock size={16} strokeWidth={3} />)}
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
          título(s) selecionado(s) — <span className="font-bold text-green-400">R$ {getSelectedTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <button className="btn-premium-solid" onClick={() => setIsSettlementOpen(true)}>
          <Check size={18} strokeWidth={3} />
          <span>Liquidar Selecionados</span>
        </button>
        <button className="view-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8' }} onClick={() => setSelectedIds([])}>
          Cancelar
        </button>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Detalhes da Conta' : (selectedConta ? 'Editar Conta' : 'Nova Conta a Pagar')}
        subtitle="Gestão de obrigações e pagamentos."
        icon={DollarSign}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={() => setIsModalOpen(false)}>
                <CheckCircle2 size={18} strokeWidth={3} />
                <span>{selectedConta ? 'Salvar Alterações' : 'Registrar Conta'}</span>
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
                <label>Descrição da Despesa</label>
                <input 
                  type="text" 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Pagamento NF 1234 - Fertilizantes"
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group col-4">
                <label>Fornecedor</label>
                <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} disabled={isViewMode}>
                  <option value="">Selecione o fornecedor...</option>
                  {MOCK_SUPPLIERS.map(s => (
                    <option key={s.id} value={s.id}>{s.nomeFantasia}</option>
                  ))}
                </select>
              </div>

              <div className="form-group col-4">
                <label>Categoria / Plano de Contas</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={isViewMode}>
                  <option value="">Selecione a categoria...</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Utilidades">Utilidades</option>
                  <option value="Salários">Salários</option>
                </select>
              </div>

              <div className="form-group col-4">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} disabled={isViewMode}>
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>

              <div className="form-group col-4">
                <label>Valor (R$)</label>
                <input 
                  type="number" 
                  value={valor} 
                  onChange={(e) => setValor(parseFloat(e.target.value))} 
                  disabled={isViewMode}
                  step="0.01"
                />
              </div>

              <div className="form-group col-4">
                <label>Data de Vencimento</label>
                <input 
                  type="date" 
                  value={dataVencimento} 
                  onChange={(e) => setDataVencimento(e.target.value)} 
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group col-4">
                <label>Empresa Responsável</label>
                <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} disabled={isViewMode}>
                  {INITIAL_COMPANIES.filter(c => c.status === 'Ativa').map(c => (
                    <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                  ))}
                </select>
              </div>

              {isViewMode && selectedConta?.status === 'Pago' && (
                <div className="form-group col-6">
                  <label>Data de Pagamento</label>
                  <input type="text" value={new Date(selectedConta.dataPagamento!).toLocaleDateString()} disabled />
                </div>
              )}
            </div>
          </div>
        </div>
      </StandardModal>

      {/* Settlement/Liquidation Modal */}
      <StandardModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        title="Liquidação de Títulos"
        subtitle="Confirmação de pagamento e baixa financeira."
        icon={CheckCircle2}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsSettlementOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo" onClick={() => {
              setIsSettlementOpen(false);
              setSelectedIds([]);
            }}>
              <Check size={18} strokeWidth={3} />
              <span>Confirmar Liquidação</span>
            </button>
          </div>
        }
        size="md"
      >
        <div className="settlement-modal-content">
          <div className="selected-items-summary">
            <h4>Títulos selecionados</h4>
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
              <label>Data do Pagamento</label>
              <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} />
            </div>
            <div className="form-group col-6">
              <label>Conta Bancária (Origem)</label>
              <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}>
                {MOCK_BANKS.map(b => (
                  <option key={b.id} value={b.id}>{b.banco} - Saldo: R${b.saldo.toLocaleString('pt-BR')}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-6">
              <label>Forma de Pagamento</label>
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

