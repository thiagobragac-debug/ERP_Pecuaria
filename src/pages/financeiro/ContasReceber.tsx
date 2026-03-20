import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Download,
  Check,
  X,
  Info,
  Activity,
  FileText
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { useCompany } from '../../contexts/CompanyContext';
import { Transacao, BankAccount, Cliente, Company } from '../../types';
import { SearchableSelect } from '../../components/SearchableSelect';
import './ContasReceber.css';
import './Settlement.css';

export const ContasReceber = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<Transacao | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState({
    descricao: '',
    cliente: 'Todos',
    vencimento: '',
    valor: '',
    status: 'Todos'
  });
  
  const { activeCompanyId: selectedEmpresaId, setActiveCompanyId, companies: empresasList } = useCompany();

  // Settlement Form State
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankAccountId, setBankAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [interest, setInterest] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Form State
  const [descricao, setDescricao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState(0);
  const [dataVencimento, setDataVencimento] = useState('');
  const [categoria, setCategoria] = useState('');
  const [empresaId, setEmpresaId] = useState('default');

  const isOnline = useOnlineStatus();
  const { data: allTransactions = [] } = useOfflineQuery<Transacao>(['transacoes'], 'transacoes');
  const { data: banks = [] } = useOfflineQuery<BankAccount>(['bancos'], 'bancos');
  const { data: clientes = [] } = useOfflineQuery<Cliente>(['clientes'], 'clientes');

  const saveMutation = useOfflineMutation<Transacao>('transacoes', [['transacoes']]);
  const deleteMutation = useOfflineMutation<Transacao>('transacoes', [['transacoes']], 'delete');

  const contasReceber = useMemo(() => 
    allTransactions.filter(t => t.tipo === 'in'),
  [allTransactions]);

  const filteredData = useMemo(() => {
    return contasReceber.filter(r => {
      const searchLower = searchTerm.toLowerCase();
      const clienteNome = clientes.find(c => c.id === r.cliente_id)?.nome || '';
      const matchesSearch = clienteNome.toLowerCase().includes(searchLower) || 
                           r.desc.toLowerCase().includes(searchLower) ||
                           r.categoria.toLowerCase().includes(searchLower) ||
                           r.valor.toString().includes(searchLower) ||
                           r.status.toLowerCase().includes(searchLower) ||
                           (r.vencimento?.toLowerCase().includes(searchLower) || false);
      const matchesStatus = filterStatus === 'Todos' || r.status === filterStatus;
      const matchesCategoria = filterCategoria === 'Todos' || r.categoria === filterCategoria;
      const matchesEmpresa = selectedEmpresaId === 'Todas' || r.empresaId === selectedEmpresaId;
      
      const matchesColumnFilters = 
        (columnFilters.descricao === '' || r.desc.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
        (columnFilters.cliente === 'Todos' || clienteNome === columnFilters.cliente) &&
        (columnFilters.vencimento === '' || (r.vencimento?.includes(columnFilters.vencimento) || false)) &&
        (columnFilters.valor === '' || r.valor.toString().includes(columnFilters.valor)) &&
        (columnFilters.status === 'Todos' || r.status === columnFilters.status);

      return matchesSearch && matchesStatus && matchesCategoria && matchesEmpresa && matchesColumnFilters;
    });
  }, [contasReceber, searchTerm, filterStatus, filterCategoria, columnFilters, clientes, selectedEmpresaId]);

  const categorias = useMemo(() => Array.from(new Set(contasReceber.map(r => r.categoria))), [contasReceber]);

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
    return contasReceber
      .filter(c => selectedIds.includes(c.id))
      .reduce((acc, curr) => acc + curr.valor, 0);
  };

  const totals = useMemo(() => {
    const pending = contasReceber.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + c.valor, 0);
    const overdue = contasReceber.filter(c => c.status === 'Atrasado').reduce((acc, c) => acc + c.valor, 0);
    const received = contasReceber.filter(c => c.status === 'Pago').reduce((acc, c) => acc + c.valor, 0);
    return { pending, overdue, received };
  }, [contasReceber]);

  const handleOpenModal = (conta: Transacao | null = null, view = false) => {
    if (conta) {
      setSelectedConta(conta);
      setDescricao(conta.desc);
      setClienteId(conta.cliente_id || '');
      setValor(conta.valor);
      setDataVencimento(conta.vencimento || '');
      setCategoria(conta.categoria);
      setEmpresaId(conta.empresaId || 'default');
      setIsViewMode(view);
    } else {
      setSelectedConta(null);
      setDescricao('');
      setClienteId('');
      setValor(0);
      setDataVencimento(new Date().toISOString().split('T')[0]);
      setCategoria('');
      setEmpresaId('default');
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const data: Transacao = {
      ...(selectedConta || {}),
      id: selectedConta?.id || crypto.randomUUID(),
      desc: descricao,
      cliente_id: clienteId,
      valor: valor,
      data: new Date().toISOString().split('T')[0],
      vencimento: dataVencimento,
      status: selectedConta?.status || 'Pendente',
      tipo: 'in',
      categoria: categoria,
      empresaId: empresaId,
      tenant_id: 'default'
    } as Transacao;
    
    await saveMutation.mutateAsync(data);
    setIsModalOpen(false);
  };

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/financeiro/fluxo">Financeiro & Controle</Link>
        <ChevronRight size={14} />
        <span>Contas a Receber</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <TrendingUp size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1>Contas a Receber</h1>
              <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <p className="description">Gestão de faturamentos e recebíveis previstos para sua fazenda.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid emerald" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Total a Receber</span>
            <span className="summary-value">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <p className="mt-3 text-indigo-600 font-bold flex items-center gap-2">
              <Building2 size={16} strokeWidth={3} /> {contasReceber.filter(c => c.status === 'Pendente').length} pendentes
            </p>
          </div>
          <div className="summary-icon sky">
            <DollarSign size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Em Atraso</span>
            <span className="summary-value">R$ {totals.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <p className="mt-3 text-red-500 font-black flex items-center gap-2">
              <AlertCircle size={16} /> Cobrança prioritária
            </p>
          </div>
          <div className="summary-icon rose">
            <Clock size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card received animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Recebidos (Mês)</span>
            <span className="summary-value">R$ {totals.received.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
        >
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Unidade:</span>
            <select 
              className="select-premium-minimal"
              value={selectedEmpresaId} 
              onChange={(e) => setActiveCompanyId(e.target.value)}
            >
              <option value="Todas">Todas as Unidades</option>
              {empresasList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nomeFantasia}</option>
              ))}
            </select>
          </div>
        </TableFilters>

        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell" style={{ width: '80px' }}>
                <div className={`custom-checkbox ${selectedIds.length > 0 && selectedIds.length === filteredData.filter(c => c.status !== 'Pago').length ? 'active' : ''}`}
                     onClick={() => setSelectedIds(selectedIds.length === 0 ? filteredData.filter(c => c.status !== 'Pago').map(c => c.id) : [])}>
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
                  { key: 'cliente', type: 'select', options: clientes.map(c => c.nome) },
                  { key: 'vencimento', type: 'text', placeholder: 'Data...' },
                  { key: 'valor', type: 'text', placeholder: 'Valor...' },
                  { key: 'status', type: 'select', options: ['Pendente', 'Pago', 'Atrasado'] }
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
                  {conta.status !== 'Pago' && (
                    <div className={`custom-checkbox ${selectedIds.includes(conta.id) ? 'active' : ''}`}
                         onClick={() => toggleSelect(conta.id)}>
                      {selectedIds.includes(conta.id) && <Check size={18} strokeWidth={4} className="text-white" />}
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2 py-2">
                    <span className="font-extrabold text-slate-800 text-lg leading-tight">{conta.desc}</span>
                    <span className="text-slate-300 font-medium">—</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-wider whitespace-nowrap border border-indigo-100/50">
                      {conta.categoria}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 border border-slate-200">
                      {(clientes.find(c => c.id === conta.cliente_id)?.nome || 'C').substring(0, 1)}
                    </div>
                    <span className="font-bold text-slate-700">{clientes.find(c => c.id === conta.cliente_id)?.nome || 'Cliente não identificado'}</span>
                  </div>
                </td>
                <td>
                  <div className={`flex items-center gap-3 font-black ${conta.status === 'Atrasado' ? 'text-red-400' : 'text-slate-300'}`}>
                    <Calendar size={18} strokeWidth={3} />
                    {conta.vencimento ? new Date(conta.vencimento).toLocaleDateString('pt-BR') : '-'}
                  </div>
                </td>
                <td>
                  <span className="font-black text-slate-900 text-xl">R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
                    <button className="action-btn-global btn-delete" title="Excluir" onClick={() => deleteMutation.mutate(conta)}>
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
          label="registros"
        />
      </div>

      <div className={`batch-action-bar ${selectedIds.length > 0 ? 'visible' : ''}`}>
        <div className="selection-info">
          <span className="count">{selectedIds.length}</span>
          selecionados — <span className="font-bold text-green-400">R$ {getSelectedTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <button className="btn-premium-solid emerald" onClick={() => setIsSettlementOpen(true)}>
          <Check size={18} strokeWidth={3} />
          <span>Confirmar Recebimento</span>
        </button>
        <button className="view-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8' }} onClick={() => setSelectedIds([])}>
          Cancelar
        </button>
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Detalhes' : (selectedConta ? 'Editar' : 'Novo Lançamento')}
        subtitle="Controle de faturamentos e recebíveis."
        icon={TrendingUp}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            {!isViewMode && (
              <button type="submit" className="btn-premium-solid emerald" form="contas-receber-form">
                <span>{selectedConta ? 'Salvar Alterações' : 'Confirmar Lançamento'}</span>
                <CheckCircle2 size={18} strokeWidth={3} />
              </button>
            )}
          </>
        }
      >
        <div className="modern-form-section">
          <form id="contas-receber-form" onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}>
            <div className="modern-form-group full-width">
              <label>Descrição do Recebível</label>
              <div className="modern-input-wrapper">
                <input 
                  className="modern-input text-lg font-bold"
                  value={descricao} 
                  onChange={e => setDescricao(e.target.value)} 
                  disabled={isViewMode} 
                  placeholder="Ex: Venda de gado - Lote 12"
                  required
                />
                <FileText size={18} className="modern-field-icon" />
              </div>
            </div>

            <div className="modern-form-row three-cols">
              <div className="modern-form-group">
                <SearchableSelect
                  label="Cliente / Parceiro"
                  options={clientes.map(c => ({ id: c.id, label: c.nome, sublabel: c.documento }))}
                  value={clienteId}
                  onChange={setClienteId}
                  disabled={isViewMode}
                  required
                />
              </div>

              <div className="modern-form-group">
                <SearchableSelect
                  label="Categoria"
                  options={[
                    { id: 'Venda Gado', label: 'Venda Gado' },
                    { id: 'Serviços', label: 'Serviços' },
                    { id: 'Outros', label: 'Outros' }
                  ]}
                  value={categoria}
                  onChange={setCategoria}
                  disabled={isViewMode}
                  required
                />
              </div>

              <div className="modern-form-group">
                <SearchableSelect
                  label="Empresa Responsável"
                  options={empresasList.filter(c => c.status === 'Ativa').map(c => ({ id: c.id, label: c.nomeFantasia }))}
                  value={empresaId}
                  onChange={setEmpresaId}
                  disabled={isViewMode}
                  required
                />
              </div>
            </div>

            <div className="modern-form-row">
              <div className="modern-form-group">
                <label>Valor Previsto (R$)</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="number" 
                    className="modern-input"
                    value={valor} 
                    onChange={e => setValor(parseFloat(e.target.value))} 
                    disabled={isViewMode} 
                    step="0.01"
                    required
                  />
                  <DollarSign size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group">
                <label>Data de Vencimento</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="date" 
                    className="modern-input"
                    value={dataVencimento} 
                    onChange={e => setDataVencimento(e.target.value)} 
                    disabled={isViewMode} 
                    required
                  />
                  <Calendar size={18} className="modern-field-icon" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </ModernModal>

      <ModernModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        title="Liquidação de Recebíveis"
        subtitle="Confirmação de entrada financeira no caixa."
        icon={CheckCircle2}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={() => setIsSettlementOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            <button type="submit" className="btn-premium-solid emerald" form="liquidação-form">
              <span>Confirmar Liquidação</span>
              <Check size={18} strokeWidth={3} />
            </button>
          </>
        }
      >
        <div className="modern-form-section">
          <form id="liquidação-recebivel-form" onSubmit={(e) => {
            e.preventDefault();
            setIsSettlementOpen(false);
            setSelectedIds([]);
          }}>
            <div className="selected-items-list mb-6">
              <div className="form-section-title mb-4">
                <Info size={20} className="text-indigo-500" />
                <span>Resumo da Operação ({selectedIds.length})</span>
              </div>
              {contasReceber.filter(c => selectedIds.includes(c.id)).map(item => (
                <div key={item.id} className="mini-item p-3 rounded-lg bg-slate-50 mb-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 block">{item.desc}</span>
                    <span className="text-xs text-slate-400">Vencimento: {item.vencimento}</span>
                  </div>
                  <span className="text-emerald-600 font-black">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div className="modern-form-row">
              <div className="modern-form-group">
                <SearchableSelect
                  label="Conta Bancária (Destino)"
                  options={banks.map(b => ({ id: b.id, label: b.banco, sublabel: `Saldo: R$ ${b.saldo.toLocaleString('pt-BR')}` }))}
                  value={bankAccountId}
                  onChange={setBankAccountId}
                  required
                />
              </div>
              <div className="modern-form-group">
                <label>Data do Recebimento</label>
                <div className="modern-input-wrapper">
                  <input type="date" className="modern-input" value={settlementDate} onChange={e => setSettlementDate(e.target.value)} required />
                  <Calendar size={18} className="modern-field-icon" />
                </div>
              </div>
            </div>

            <div className="modern-form-group full-width">
              <label>Forma de Recebimento</label>
              <div className="modern-input-wrapper">
                <select className="modern-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="PIX">PIX</option>
                  <option value="TED">Transferência (TED)</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Cartão">Cartão de Crédito</option>
                  <option value="Dinheiro">Espécie / Dinheiro</option>
                </select>
                <Activity size={18} className="modern-field-icon" />
              </div>
            </div>

            <div className="settlement-total-banner p-6 bg-slate-900 text-white rounded-2xl flex justify-between items-center mt-6">
              <div>
                <span className="text-slate-400 text-sm">Total a Liquidar</span>
                <p className="text-xs text-slate-500">{selectedIds.length} títulos selecionados</p>
              </div>
              <div className="text-3xl font-black text-emerald-400">
                R$ {getSelectedTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </form>
        </div>
      </ModernModal>
    </div>
  );
};
