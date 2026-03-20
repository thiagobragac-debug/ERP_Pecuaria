import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  X, 
  Package, 
  User, 
  Calendar,
  DollarSign,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  List,
  ArrowRight,
  Building2,
  Hash,
  Activity,
  Info
} from 'lucide-react';
import './SolicitacaoCompra.css';
import { INITIAL_CATEGORIES, INITIAL_UNIDADES, INITIAL_COMPANIES } from '../../data/initialData';
import { Subcategoria, UnidadeMedida, Company } from '../../types/definitions';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { SolicitacaoCompra as SolicitacaoType, ItemSolicitacao, Insumo } from '../../types';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { StatusBadge } from '../../components/StatusBadge';


export const SolicitacaoCompraPage = () => {
  const { activeCompanyId } = useCompany();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoType | null>(null);

  const { currentOrg } = useAuth();
  const [formData, setFormData] = useState<Partial<SolicitacaoType>>({
    numero: '',
    data: new Date().toISOString().split('T')[0],
    solicitante: '',
    prioridade: 'Normal',
    status: 'Pendente',
    empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : '',
    itens: []
  });
  const [items, setItems] = useState<ItemSolicitacao[]>([]);

  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    data: '',
    solicitante: '',
    prioridade: 'Todos',
    status: 'Todos',
    valorTotal: ''
  });

  // Database Queries
  const allSolicitacoes = useLiveQuery(() => db.solicitacoes_compra.toArray()) || [];
  const solicitacoes = allSolicitacoes.filter(s => activeCompanyId === 'Todas' || (s as any).empresaId === activeCompanyId);
  const insumos = useLiveQuery(() => db.insumos.filter(i => i.paraCompra).toArray()) || [];
  const empresasList = useLiveQuery(() => db.empresas.toArray()) || [];

  const handleOpenModal = (sol: SolicitacaoType | null = null, viewOnly = false) => {
    if (sol) {
      setSelectedSolicitacao(sol);
      setFormData({ ...sol });
      setItems(sol.itens || []);
    } else {
      const defaultEmpresaId = activeCompanyId !== 'Todas' ? activeCompanyId : ((empresasList as any[]).filter((c: any) => c.status === 'Ativa')[0]?.id || '');
      setFormData({
        numero: `SC-${new Date().getFullYear()}-${String(solicitacoes.length + 1).padStart(3, '0')}`,
        data: new Date().toISOString().split('T')[0],
        solicitante: '',
        prioridade: 'Normal',
        status: 'Pendente',
        empresaId: defaultEmpresaId,
        itens: []
      });
      setItems([{ id: Date.now().toString(), insumoId: '', insumoNome: '', quantidade: 0, unidade: '', preco: 0, centroCustoId: '' }]);
      setSelectedSolicitacao(null);
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData) return;

    const totalValue = items.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);

    const solicitacaoToSave: SolicitacaoType = {
      ...formData,
      itens: items,
      valorTotal: totalValue,
      tenant_id: currentOrg?.id || 'default'
    } as SolicitacaoType;

    await dataService.saveItem('solicitacoes_compra', solicitacaoToSave);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta solicitação?')) {
      await dataService.deleteItem('solicitacoes_compra', id);
    }
  };

  const addItemRow = () => {
    setItems([...items, { id: Date.now().toString(), insumoId: '', insumoNome: '', quantidade: 0, unidade: '', preco: 0, centroCustoId: '' }]);
  };

  const removeItemRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ItemSolicitacao, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'insumoId') {
          const insumo = insumos.find(i => i.id === value);
          return { ...item, [field]: value, insumoNome: insumo?.nome || '', unidade: insumo?.unidade || '' };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
  };

  const filteredData = solicitacoes.filter(sol => {
    const matchesSearch =
      sol.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.prioridade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.valorTotal.toString().includes(searchTerm) ||
      sol.itens.some(it => it.insumoNome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesColumnFilters =
      (columnFilters.numero === '' || sol.numero.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.data === '' || sol.data.includes(columnFilters.data)) &&
      (columnFilters.solicitante === '' || sol.solicitante.toLowerCase().includes(columnFilters.solicitante.toLowerCase())) &&
      (columnFilters.prioridade === 'Todos' || sol.prioridade === columnFilters.prioridade) &&
      (columnFilters.status === 'Todos' || sol.status === columnFilters.status) &&
      (columnFilters.valorTotal === '' || sol.valorTotal.toString().includes(columnFilters.valorTotal));

    return matchesSearch && matchesColumnFilters;
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  const centroCustoCategory = INITIAL_CATEGORIES.find(c => c.nome === 'Centros de Custo');
  const centrosCusto = centroCustoCategory ? centroCustoCategory.subcategorias : [];

  useEscapeKey(() => {
    if (isModalOpen) setIsModalOpen(false);
  });

  const handleGenerateMap = (sol: SolicitacaoType) => {
    navigate('/compras/cotacoes', {
      state: {
        originSolicitacao: {
          numero: sol.numero,
          empresaId: sol.empresaId,
          valorTotal: sol.valorTotal,
          itens: sol.itens.map(it => ({
            id: `ci-${it.id}`,
            insumoId: it.insumoId,
            insumoNome: it.insumoNome,
            quantidade: it.quantidade,
            unidade: it.unidade,
            bids: []
          }))
        }
      }
    });
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Baixa': return 'priority-low';
      case 'Normal': return 'priority-medium';
      case 'Alta': return 'priority-high';
      case 'Urgente': return 'priority-urgent';
      default: return '';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'Pendente': return <Clock size={16} style={{ color: 'var(--warning)' }} />;
      case 'Em Cotação': return <TrendingUp size={16} style={{ color: 'var(--info)' }} />;
      case 'Aprovado': return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
      case 'Recusado': return <AlertCircle size={16} style={{ color: 'var(--danger)' }} />;
      default: return null;
    }
  };

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-premium-fade-up">
      {/* Floating Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-0 z-30 py-4 bg-slate-50/80 backdrop-blur-md -mx-10 px-10 border-b border-slate-200/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Solicitações de Compra</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest text-shadow-sm">Gestão de Necessidades & Suprimentos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Empresa:</span>
            <span className="text-xs font-black text-slate-700">{activeCompanyId === 'Todas' ? 'Visão Consolidada' : empresasList.find(e => e.id === activeCompanyId)?.razaoSocial || 'Unidade'}</span>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-premium-solid h-14 px-8 rounded-2xl indigo shadow-xl shadow-indigo-100/50"
          >
            <PlusCircle size={22} strokeWidth={3} />
            <span className="text-base">Nova Solicitação</span>
          </button>
        </div>
      </div>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard 
          label="Total Pendente"
          value={solicitacoes.filter(s => s.status === 'Pendente').length.toString().padStart(2, '0')}
          trend={{ value: 'Aguardando ação', type: 'neutral', icon: Clock }}
          icon={Clock}
          color="amber"
        />
        <SummaryCard 
          label="Valor Estimado"
          value={`R$ ${solicitacoes.reduce((acc, s) => acc + (s.valorTotal || 0), 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          trend={{ value: 'Total em SC', type: 'neutral', icon: DollarSign }}
          icon={DollarSign}
          color="emerald"
        />
        <SummaryCard 
          label="Prioridade Crítica"
          value={solicitacoes.filter(s => s.prioridade === 'Urgente' || s.prioridade === 'Alta').length.toString().padStart(2, '0')}
          trend={{ value: 'Atenção imediata', type: 'down', icon: AlertCircle }}
          icon={AlertCircle}
          color="rose"
        />
        <SummaryCard 
          label="Em Cotação"
          value={solicitacoes.filter(s => s.status === 'Em Cotação').length.toString().padStart(2, '0')}
          icon={TrendingUp}
          color="indigo"
          subtext="No mercado"
        />
      </div>

      {/* Main List Section */}
      <div className="glass-premium rounded-[40px] overflow-hidden shadow-soft-xl border border-white/40">
        <div className="p-8 border-b border-slate-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por número ou solicitante..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl border font-bold transition-all ${isFiltersOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
            >
              <Filter size={18} />
              <span>{isFiltersOpen ? 'Ocultar Filtros' : 'Filtros'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Número / Origem</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Solicitante</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Prioridade</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Est.</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'solicitante', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'prioridade', type: 'select', options: ['Todos', 'Baixa', 'Normal', 'Alta', 'Urgente'] },
                    { key: 'status', type: 'select', options: ['Todos', 'Pendente', 'Em Cotação', 'Aprovado', 'Recusado'] },
                    { key: 'valorTotal', type: 'text', placeholder: 'Valor...' }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-sm">
              {paginatedData.length > 0 ? (paginatedData as SolicitacaoType[]).map((reg) => (
                <tr key={reg.id} className="group hover:bg-slate-50/50 transition-all duration-300 transform hover:scale-[1.002]">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-base mb-1">{reg.numero}</span>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 w-fit px-2 py-0.5 rounded uppercase tracking-widest">{reg.data}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner overflow-hidden font-black text-[10px]">
                        {reg.solicitante.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-slate-700">{reg.solicitante}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      reg.prioridade === 'Urgente' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                      reg.prioridade === 'Alta' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {reg.prioridade}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-slate-700 text-lg tabular-nums tracking-tighter">
                      R$ {reg.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={reg.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                      <button 
                         onClick={() => handleGenerateMap(reg)}
                         className="action-btn-global btn-view" title="Gerar Mapa de Cotação"
                      >
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(reg, true)}
                        className="action-btn-global btn-view" title="Visualizar"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      
                      {reg.status === 'Pendente' && (
                        <>
                          <button 
                            onClick={() => handleOpenModal(reg)}
                            className="action-btn-global btn-edit" title="Editar"
                          >
                            <Edit size={18} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleDelete(reg.id)}
                            className="action-btn-global btn-delete" title="Excluir"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <FileText size={64} strokeWidth={1} />
                      <p className="text-lg font-bold text-slate-400">Nenhuma solicitação encontrada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
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
          />
        </div>
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Detalhes da Solicitação' : (selectedSolicitacao ? 'Editar Solicitação' : 'Nova Solicitação')}
        subtitle="Preencha os dados básicos e os itens necessários para cotação."
        icon={FileText}
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Total Estimado:</span>
              <span className="text-2xl font-black text-white tracking-tighter relative z-10 tabular-nums">
                R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                className="btn-premium-outline h-12 px-8"
                onClick={() => setIsModalOpen(false)}
              >
                {isViewMode ? 'Fechar' : 'Cancelar'}
              </button>
              {!isViewMode && (
                <button
                  type="button"
                  className="btn-premium-solid h-12 px-8 indigo shadow-lg shadow-indigo-100 min-w-[200px]"
                  onClick={handleSave}
                >
                  <CheckCircle2 size={18} />
                  <span>{selectedSolicitacao ? 'Salvar Alterações' : 'Confirmar Solicitação'}</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-12">
          {/* Form Header Info */}
          <div className="glass-card p-8 rounded-[32px] border border-white/60 bg-white/40">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                <Info size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.2em]">Informações Gerais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número</label>
                <div className="relative group">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    value={formData.numero || ''}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Solicitante</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    value={formData.solicitante || ''}
                    onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                    placeholder="Nome do colaborador requisitante"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                <div className="relative group">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridade</label>
                <div className="relative group">
                  <AlertCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none"
                    value={formData.prioridade || 'Normal'}
                    onChange={(e: any) => setFormData({ ...formData, prioridade: e.target.value })}
                    disabled={isViewMode}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <SearchableSelect
                  label="Unidade / Fazenda"
                  options={empresasList.map(e => ({ id: e.id, label: e.razaoSocial, sublabel: e.cidade }))}
                  value={formData.empresaId || ''}
                  onChange={(val) => setFormData({ ...formData, empresaId: val })}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <Package size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.2em]">Itens Requisitados</h3>
              </div>
              {!isViewMode && (
                <button 
                  type="button" 
                  onClick={addItemRow}
                  className="btn-premium-solid indigo btn-sm h-10 px-6 rounded-xl"
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>Adicionar</span>
                </button>
              )}
            </div>

            <div className="grid gap-4">
              {items.map((item, index) => (
                <div key={item.id} className="glass-card p-6 rounded-[24px] border border-white/60 bg-white/20 hover:bg-white/40 transition-all group animate-premium-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <div className="md:col-span-4">
                      <SearchableSelect
                        label="Insumo / Item"
                        options={insumos.map(i => ({ id: i.id, label: i.nome, sublabel: i.unidade }))}
                        value={item.insumoId}
                        onChange={(val) => updateItem(item.id, 'insumoId', val)}
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Centro de Custo</label>
                      <div className="relative group">
                        <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                          className="w-full bg-white/50 border border-slate-200 rounded-[18px] py-3 pl-10 pr-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none"
                          value={item.centroCustoId} 
                          onChange={(e) => updateItem(item.id, 'centroCustoId', e.target.value)}
                          disabled={isViewMode}
                        >
                          <option value="">Selecione...</option>
                          {centrosCusto.map(cc => (
                            <option key={cc.id} value={cc.id}>{cc.nome}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Quantidade</label>
                      <div className="relative group">
                        <input 
                          type="number" 
                          className="w-full bg-white/50 border border-slate-200 rounded-[18px] py-3 px-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                          value={item.quantidade} 
                          onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value))}
                          disabled={isViewMode}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{item.unidade || 'UN'}</span>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Preço Est.</label>
                       <div className="relative group">
                        <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number" 
                          className="w-full bg-white/50 border border-slate-200 rounded-[18px] py-3 pl-10 pr-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                          value={item.preco} 
                          onChange={(e) => updateItem(item.id, 'preco', parseFloat(e.target.value))}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      {!isViewMode && (
                        <button 
                          onClick={() => removeItemRow(item.id)}
                          className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModernModal>
    </div>
  );
};
