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
  ArrowRight,
  Info,
  Activity
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { MOCK_SUPPLIERS } from '../../data/supplierData';
import { MOCK_BANKS } from '../../data/bankData';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useCompany } from '../../contexts/CompanyContext';
import { Transacao, BankAccount, Supplier, Company } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { StatusBadge } from '../../components/StatusBadge';
import './ContasPagar.css';
import './Settlement.css';

export const ContasPagar = () => {
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
    fornecedor: 'Todos',
    dataVenc: '',
    valor: '',
    status: 'Todos'
  });
  
  const { activeCompanyId: selectedEmpresaId, setActiveCompanyId, companies: empresasList } = useCompany();
  const { currentOrg } = useAuth();
  
  const [formData, setFormData] = useState<Partial<Transacao>>({
    desc: '',
    fornecedor_id: '',
    valor: 0,
    vencimento: new Date().toISOString().split('T')[0],
    categoria: '',
    empresaId: selectedEmpresaId !== 'Todas' ? selectedEmpresaId : 'M1',
    status: 'Pendente'
  });

  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankAccountId, setBankAccountId] = useState('B1');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [interest, setInterest] = useState(0);
  const [discount, setDiscount] = useState(0);

  const isOnline = useOnlineStatus();
  const { data: allTransactions = [], isLoading } = useOfflineQuery<Transacao>(['transacoes'], 'transacoes');
  const { data: banks = [] } = useOfflineQuery<BankAccount>(['bancos'], 'bancos');
  const { data: suppliers = [] } = useOfflineQuery<Supplier>(['fornecedores'], 'fornecedores');

  const saveMutation = useOfflineMutation<Transacao>('transacoes', [['transacoes']]);
  const deleteMutation = useOfflineMutation<Transacao>('transacoes', [['transacoes']], 'delete');

  const contasPagar = useMemo(() => 
    allTransactions.filter(t => t.tipo === 'out'),
  [allTransactions]);

  const filteredData = useMemo(() => {
    return contasPagar.filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (c.fornecedor_id?.toLowerCase().includes(searchLower) || false) || 
                           c.desc.toLowerCase().includes(searchLower) ||
                           c.categoria.toLowerCase().includes(searchLower) ||
                           c.valor.toString().includes(searchLower) ||
                           c.status.toLowerCase().includes(searchLower) ||
                           (c.vencimento?.toLowerCase().includes(searchLower) || false);
      const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
      const matchesCategoria = filterCategoria === 'Todos' || c.categoria === filterCategoria;
      const matchesEmpresa = selectedEmpresaId === 'Todas' || c.empresaId === selectedEmpresaId;
      
      const matchesColumnFilters = 
        (columnFilters.descricao === '' || c.desc.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
        (columnFilters.dataVenc === '' || (c.vencimento?.includes(columnFilters.dataVenc) || false)) &&
        (columnFilters.valor === '' || c.valor.toString().includes(columnFilters.valor)) &&
        (columnFilters.status === 'Todos' || c.status === columnFilters.status);

      return matchesSearch && matchesStatus && matchesCategoria && matchesEmpresa && matchesColumnFilters;
    });
  }, [contasPagar, searchTerm, filterStatus, filterCategoria, columnFilters, selectedEmpresaId]);

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

  const summaryData = useMemo(() => {
    const pending = contasPagar.filter(c => c.status === 'Pendente');
    const overdue = contasPagar.filter(c => c.status === 'Atrasado');
    const paid = contasPagar.filter(c => c.status === 'Pago');
    
    return {
      pendingTotal: pending.reduce((acc, c) => acc + c.valor, 0),
      pendingCount: pending.length,
      overdueTotal: overdue.reduce((acc, c) => acc + c.valor, 0),
      overdueCount: overdue.length,
      paidTotal: paid.reduce((acc, c) => acc + c.valor, 0),
      paidCount: paid.length
    };
  }, [contasPagar]);

  useEscapeKey(() => {
    setIsModalOpen(false);
    setIsSettlementOpen(false);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getSelectedTotal = () => {
    return contasPagar
      .filter(c => selectedIds.includes(c.id))
      .reduce((acc, curr) => acc + curr.valor, 0);
  };

  const getSettlementItems = () => {
    return contasPagar.filter(c => selectedIds.includes(c.id));
  };

  const handleOpenModal = (conta: Transacao | null = null, view = false) => {
    if (conta) {
      setSelectedConta(conta);
      setFormData({ ...conta });
      setIsViewMode(view);
    } else {
      setSelectedConta(null);
      setFormData({
        desc: '',
        fornecedor_id: '',
        valor: 0,
        vencimento: new Date().toISOString().split('T')[0],
        categoria: '',
        empresaId: selectedEmpresaId !== 'Todas' ? selectedEmpresaId : 'M1',
        status: 'Pendente'
      });
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/financeiro/fluxo">Financeiro & Controle</Link>
        <ChevronRight size={14} />
        <span>Contas a Pagar</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <CreditCard size={32} />
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
        <SummaryCard 
          label="Total em Aberto"
          value={`R$ ${summaryData.pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={{ value: `${summaryData.pendingCount} pendentes`, type: 'neutral', icon: Clock }}
          icon={Wallet}
          color="indigo"
          delay="0s"
        />
        <SummaryCard 
          label="Vencidas / Urgente"
          value={`R$ ${summaryData.overdueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={{ value: summaryData.overdueCount > 0 ? 'Ação imediata' : 'Tudo em dia', type: summaryData.overdueCount > 0 ? 'down' : 'up', icon: AlertCircle }}
          icon={AlertCircle}
          color="rose"
          delay="0.1s"
        />
        <SummaryCard 
          label="Pagos (Total)"
          value={`R$ ${summaryData.paidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={{ value: `${summaryData.paidCount} liquidadas`, type: 'up', icon: CheckCircle2 }}
          icon={TrendingUp}
          color="emerald"
          delay="0.2s"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por descrição, fornecedor ou documento..."
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
                <div className={`custom-checkbox ${selectedIds.length > 0 && selectedIds.length === contasPagar.filter(c => c.status !== 'Pago').length ? 'active' : ''}`}
                     style={{ width: '28px', height: '28px', borderRadius: '8px', border: '2px solid #e2e8f0', background: selectedIds.length > 0 ? '#10b981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     onClick={() => setSelectedIds(selectedIds.length === 0 ? contasPagar.filter(c => c.status !== 'Pago').map(c => c.id) : [])}>
                  {selectedIds.length > 0 && <Check size={16} strokeWidth={4} color="white" />}
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
                    { key: 'fornecedor', type: 'select', options: Array.from(new Set(suppliers.map(s => s.nomeFantasia))) },
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
            {paginatedData.map((conta) => {
              const fornecedor = suppliers.find(s => s.id === conta.fornecedor_id);
              const fornecedorNome = fornecedor?.nomeFantasia || conta.fornecedor_id || 'N/A';
              
              return (
                <tr key={conta.id} className={selectedIds.includes(conta.id) ? 'selected' : ''}>
                  <td className="checkbox-cell">
                    {conta.status !== 'Pago' && (
                      <div className={`custom-checkbox ${selectedIds.includes(conta.id) ? 'active' : ''}`}
                           style={{ width: '28px', height: '28px', borderRadius: '8px', border: '2px solid #e2e8f0', background: selectedIds.includes(conta.id) ? '#10b981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                           onClick={() => toggleSelect(conta.id)}>
                        {selectedIds.includes(conta.id) && <Check size={16} strokeWidth={4} color="white" />}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2 py-2">
                       <span className="font-extrabold text-slate-800 text-lg leading-tight">{conta.desc}</span>
                       <span className="text-slate-300 font-medium">—</span>
                       <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-wider whitespace-nowrap border border-emerald-100/50">
                         {conta.categoria}
                       </span>
                    </div>
                  </td>
                  <td>
                    <div className="solicitante-cell">
                      <div className="avatar-circle indigo">
                        {fornecedorNome.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{fornecedorNome}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`flex items-center gap-3 font-black ${conta.status === 'Atrasado' ? 'text-red-600' : 'text-slate-500'}`}>
                      <Calendar size={18} strokeWidth={3} />
                      {conta.vencimento ? new Date(conta.vencimento).toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </td>
                  <td>
                    <span className="font-black text-slate-800 text-xl">R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td>
                    <StatusBadge status={conta.status === 'Atrasado' ? 'Vencida' : conta.status} />
                  </td>
                  <td className="text-center">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" onClick={() => handleOpenModal(conta as any, true)} title="Ver Detalhes">
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" onClick={() => handleOpenModal(conta as any)} title="Editar">
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => deleteMutation.mutate(conta)}>
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Detalhes da Conta' : (selectedConta ? 'Editar Conta' : 'Nova Conta a Pagar')}
        subtitle="Gestão de obrigações e pagamentos."
        icon={DollarSign}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            {!isViewMode && (
              <button 
                type="submit"
                className="btn-premium-solid rose" 
                form="contas-pagar-form"
              >
                <span>{selectedConta ? 'Salvar Alterações' : 'Confirmar Lançamento'}</span>
                <CheckCircle2 size={18} strokeWidth={3} />
              </button>
            )}
          </>
        }
      >
        <div className="modern-form-section">
          <form id="contas-pagar-form" onSubmit={(e) => {
            e.preventDefault();
            if (!formData.desc || !formData.valor || !formData.vencimento) {
              alert('Por favor, preencha todos os campos obrigatórios.');
              return;
            }

            const payload: Transacao = {
              ...selectedConta!,
              id: selectedConta?.id || Math.random().toString(36).substr(2, 9),
              desc: formData.desc!,
              valor: formData.valor!,
              data: selectedConta?.data || new Date().toISOString().split('T')[0],
              vencimento: formData.vencimento!,
              tipo: 'out',
              status: formData.status as any,
              categoria: formData.categoria!,
              fornecedor_id: formData.fornecedor_id,
              empresaId: formData.empresaId || 'M1',
              tenant_id: currentOrg?.id || 'default'
            };
            saveMutation.mutate(payload);
            setIsModalOpen(false);
          }}>
            <div className="modern-form-group full-width">
              <label>Descrição da Despesa</label>
              <div className="modern-input-wrapper">
                <input 
                  type="text" 
                  className="modern-input text-lg font-bold"
                  value={formData.desc || ''} 
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Ex: Pagamento NF 1234 - Fertilizantes"
                  disabled={isViewMode}
                  required
                />
                <FileText size={18} className="modern-field-icon" />
              </div>
            </div>

            <div className="modern-form-row three-cols mt-4">
              <div className="modern-form-group">
                <SearchableSelect
                  label="Fornecedor"
                  options={suppliers.map(s => ({ id: s.id, label: s.nomeFantasia, sublabel: s.documento }))}
                  value={formData.fornecedor_id || ''}
                  onChange={(val) => setFormData({ ...formData, fornecedor_id: val })}
                  disabled={isViewMode}
                  required
                />
              </div>

              <div className="modern-form-group">
                <SearchableSelect
                  label="Categoria / Plano de Contas"
                  options={[
                    { id: 'Insumos', label: 'Insumos' },
                    { id: 'Manutenção', label: 'Manutenção' },
                    { id: 'Utilidades', label: 'Utilidades' },
                    { id: 'Salários', label: 'Salários' }
                  ]}
                  value={formData.categoria || ''}
                  onChange={(val) => setFormData({ ...formData, categoria: val })}
                  disabled={isViewMode}
                  required
                />
              </div>

              <div className="modern-form-group">
                <label>Status</label>
                <div className="modern-input-wrapper">
                  <select className="modern-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} disabled={isViewMode}>
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                  <Activity size={18} className="modern-field-icon" />
                </div>
              </div>
            </div>

            <div className="modern-form-row three-cols mt-4">
              <div className="modern-form-group">
                <label>Valor (R$)</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="number" 
                    className="modern-input"
                    value={formData.valor || 0} 
                    onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} 
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
                    value={formData.vencimento || ''} 
                    onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })} 
                    disabled={isViewMode}
                    required
                  />
                  <Calendar size={18} className="modern-field-icon" />
                </div>
              </div>

              <div className="modern-form-group">
                <SearchableSelect
                  label="Empresa Responsável"
                  options={empresasList.filter(c => c.status === 'Ativa').map(c => ({ id: c.id, label: c.nomeFantasia }))}
                  value={formData.empresaId || ''}
                  onChange={(val) => setFormData({ ...formData, empresaId: val })}
                  disabled={isViewMode}
                  required
                />
              </div>
            </div>
          </form>
        </div>
      </ModernModal>

      <ModernModal
        isOpen={isSettlementOpen}
        onClose={() => setIsSettlementOpen(false)}
        title="Liquidação de Títulos"
        subtitle="Confirmação de pagamento e baixa financeira."
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
          <form id="liquidação-form" onSubmit={(e) => {
            e.preventDefault();
            const selectedItems = getSettlementItems();
            selectedItems.forEach(item => {
              saveMutation.mutate({
                ...item,
                status: 'Pago',
                data: settlementDate,
                banco_id: bankAccountId,
                forma_pagamento: paymentMethod
              });
            });
            setIsSettlementOpen(false);
            setSelectedIds([]);
          }}>
            <div className="form-section-title mb-4">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <span>Itens Selecionados ({selectedIds.length})</span>
            </div>
            
            <div className="selected-items-list mb-6">
              {getSettlementItems().map(item => (
                <div key={item.id} className="mini-item p-3 rounded-lg bg-slate-50 mb-2 flex justify-between">
                  <span className="font-bold text-slate-700">{item.desc}</span>
                  <span className="text-emerald-600 font-black">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div className="modern-form-row">
              <div className="modern-form-group">
                <label>Data do Pagamento</label>
                <div className="modern-input-wrapper">
                  <input type="date" className="modern-input" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} required />
                  <Calendar size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group">
                <SearchableSelect
                  label="Conta Bancária (Origem)"
                  options={banks.map(b => ({ id: b.id, label: b.banco, sublabel: `Saldo: R$ ${b.saldo.toLocaleString('pt-BR')}` }))}
                  value={bankAccountId}
                  onChange={(val) => setBankAccountId(val)}
                  required
                />
              </div>
            </div>

            <div className="modern-form-row mt-4">
              <div className="modern-form-group">
                <label>Forma de Pagamento</label>
                <div className="modern-input-wrapper">
                  <select className="modern-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="PIX">PIX</option>
                    <option value="TED">Transferência (TED)</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Cartão">Cartão de Crédito</option>
                    <option value="Dinheiro">Espécie / Dinheiro</option>
                  </select>
                  <PaymentIcon size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group">
                <label>Juros / Multas (+)</label>
                <div className="modern-input-wrapper">
                  <input type="number" className="modern-input" value={interest} onChange={(e) => setInterest(parseFloat(e.target.value) || 0)} step="0.01" />
                  <TrendingUp size={18} className="modern-field-icon" />
                </div>
              </div>
            </div>

            <div className="modern-form-group full-width mt-4">
              <label>Descontos / Abatimentos (-)</label>
              <div className="modern-input-wrapper">
                <input type="number" className="modern-input" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} step="0.01" />
                <ArrowRight size={18} className="modern-field-icon" />
              </div>
            </div>

            <div className="settlement-total-banner p-6 bg-slate-900 text-white rounded-2xl flex justify-between items-center mt-6">
              <div>
                <span className="text-slate-400 text-sm">Total Líquido Estimado</span>
                <p className="text-xs text-slate-500">Soma dos títulos + ajustes</p>
              </div>
              <div className="text-3xl font-black text-emerald-400">
                R$ {(getSelectedTotal() + interest - discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </form>
        </div>
      </ModernModal>
    </div>
  );
};
