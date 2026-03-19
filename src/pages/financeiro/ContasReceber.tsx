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
  Download,
  Check
} from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { StandardModal } from '../../components/StandardModal';
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
      setEmpresaId('default');
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
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
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
            <span className="summary-value">R$ {totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <p className="mt-3 text-indigo-600 font-bold flex items-center gap-2">
              <Building2 size={16} strokeWidth={3} /> {contasReceber.filter(c => c.status === 'Pendente').length} pendentes
            </p>
          </div>
          <div className="summary-icon" style={{ '--accent-rgb': '99, 102, 241' } as any}>
            <DollarSign size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card overdue animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Em Atraso</span>
            <span className="summary-value">R$ {totals.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
        <button className="btn-premium-solid" onClick={() => setIsSettlementOpen(true)}>
          <Check size={18} strokeWidth={3} />
          <span>Confirmar Recebimento</span>
        </button>
        <button className="view-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8' }} onClick={() => setSelectedIds([])}>
          Cancelar
        </button>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Detalhes' : (selectedConta ? 'Editar' : 'Novo')}
        subtitle="Controle de faturamentos."
        icon={TrendingUp}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={handleSave}>
                <Check size={18} strokeWidth={3} />
                <span>Salvar</span>
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
                <label>Descrição</label>
                <input value={descricao} onChange={e => setDescricao(e.target.value)} disabled={isViewMode} />
              </div>
              <div className="form-group col-4">
                <label>Cliente</label>
                <select value={clienteId} onChange={e => setClienteId(e.target.value)} disabled={isViewMode}>
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="form-group col-4">
                <label>Categoria</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)} disabled={isViewMode}>
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Venda Gado">Venda Gado</option>
                  <option value="Serviços">Serviços</option>
                </select>
              </div>
              <div className="form-group col-4">
                <label>Empresa</label>
                <select value={empresaId} onChange={e => setEmpresaId(e.target.value)} disabled={isViewMode}>
                   <option value="">Selecione a empresa...</option>
                   {empresasList.filter(c => c.status === 'Ativa').map(c => (
                     <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                   ))}
                </select>
              </div>
              <div className="form-group col-6">
                <label>Valor (R$)</label>
                <input type="number" value={valor} onChange={e => setValor(parseFloat(e.target.value))} disabled={isViewMode} />
              </div>
              <div className="form-group col-6">
                <label>Vencimento</label>
                <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} disabled={isViewMode} />
              </div>
            </div>
          </div>
        </div>
      </StandardModal>

      <StandardModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        title="Liquidação"
        subtitle="O total será somado ao saldo da conta escolhida."
        icon={CheckCircle2}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsSettlementOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo" onClick={() => { setIsSettlementOpen(false); setSelectedIds([]); }}>
              <span>Confirmar Baixa</span>
            </button>
          </div>
        }
        size="md"
      >
        <div className="form-grid">
           <div className="form-group col-12">
              <label>Conta de Destino</label>
              <select value={bankAccountId} onChange={e => setBankAccountId(e.target.value)}>
                 <option value="">Selecione a conta...</option>
                 {banks.map(b => <option key={b.id} value={b.id}>{b.banco} (R$ {b.saldo.toLocaleString()})</option>)}
              </select>
           </div>
           <div className="form-group col-12">
              <label>Total Líquido</label>
              <div className="text-2xl font-black text-indigo-600">R$ {getSelectedTotal().toLocaleString()}</div>
           </div>
        </div>
      </StandardModal>
    </div>
  );
};
