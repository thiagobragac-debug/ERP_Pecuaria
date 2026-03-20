import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  Layers,
  MoreHorizontal,
  X,
  AlertTriangle,
  Activity,
  DollarSign,
  Tag,
  Boxes,
  Truck,
  FileText,
  Warehouse,
  Info,
  ThermometerSnowflake,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layout,
  Database,
  History,
  Settings,
  Shield,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { SummaryCard } from '../../components/SummaryCard';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchableSelect } from '../../components/SearchableSelect';
import { usePagination } from '../../hooks/usePagination';
import { INITIAL_CATEGORIES, INITIAL_UNIDADES } from '../../data/initialData';
import { Categoria, Subcategoria, UnidadeMedida } from '../../types/definitions';

import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Insumo as InsumoType } from '../../types';

export const Insumo = () => {
  const insumoCategories = INITIAL_CATEGORIES.find((c: Categoria) => c.nome === 'Insumos')?.subcategorias || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedInsumo, setSelectedInsumo] = useState<InsumoType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    categoria: 'Todos',
    estoque: '',
    minimo: '',
    valor: '',
    status: 'Todos'
  });
  const [activeTab, setActiveTab] = useState('geral');
  
  const isOnline = useOnlineStatus();
  const { user: currentUser, currentOrg } = useAuth();
  const { data: insumos = [], isLoading } = useOfflineQuery<InsumoType>(['insumos'], 'insumos');
  const saveInsumoMutation = useOfflineMutation<InsumoType>('insumos', [['insumos']]);

  const [formData, setFormData] = useState<Partial<InsumoType>>({
    nome: '',
    categoria: '',
    unidade: '',
    valorUnitario: 0,
    controlaEstoque: true,
    paraCompra: true,
    paraVenda: false,
    estoqueMinimo: 0,
    estoqueAtual: 0,
    status: 'Ok'
  });

  const handleOpenModal = (insumo: InsumoType | null = null, viewOnly = false) => {
    if (insumo) {
      setSelectedInsumo(insumo);
      setFormData({ ...insumo });
    } else {
      setSelectedInsumo(null);
      setFormData({
        nome: '',
        categoria: '',
        unidade: '',
        valorUnitario: 0,
        controlaEstoque: true,
        paraCompra: true,
        paraVenda: false,
        estoqueMinimo: 0,
        estoqueAtual: 0,
        status: 'Ok'
      });
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInsumo(null);
    setIsViewMode(false);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.categoria || !formData.unidade) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, Categoria, Unidade).');
      return;
    }

    try {
      const finalInsumo: InsumoType = {
        id: selectedInsumo?.id || Math.random().toString(36).substr(2, 9),
        nome: formData.nome!,
        categoria: formData.categoria!,
        unidade: formData.unidade!,
        valorUnitario: Number(formData.valorUnitario || 0),
        controlaEstoque: formData.controlaEstoque ?? true,
        paraCompra: formData.paraCompra ?? true,
        paraVenda: formData.paraVenda ?? false,
        estoqueMinimo: Number(formData.estoqueMinimo || 0),
        estoqueAtual: selectedInsumo?.estoqueAtual || Number(formData.estoqueAtual || 0),
        status: (formData.status || 'Ok') as 'Ok' | 'Baixo' | 'Crítico',
        ultimaEntrada: formData.ultimaEntrada || new Date().toISOString(),
        tenant_id: currentOrg?.id || 'default',
        estoquePorLocal: selectedInsumo?.estoquePorLocal || {},
        custoMedioPorLocal: selectedInsumo?.custoMedioPorLocal || {}
      };

      await saveInsumoMutation.mutateAsync(finalInsumo);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving insumo:', error);
      alert('Erro ao salvar insumo.');
    }
  };

  const totalEmEstoque = insumos.reduce((acc, item) => acc + (item.estoqueAtual * item.valorUnitario), 0);
  const itensCriticos = insumos.filter(item => item.status === 'Crítico').length;

  const filteredData = insumos.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.nome.toLowerCase().includes(searchLower) || 
      item.categoria.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower) ||
      item.estoqueAtual.toString().includes(searchLower) ||
      item.valorUnitario.toString().includes(searchLower) ||
      item.unidade.toLowerCase().includes(searchLower);
    
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus;

    const matchesColumnFilters = 
      (columnFilters.nome === '' || item.nome.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.categoria === 'Todos' || item.categoria === columnFilters.categoria) &&
      (columnFilters.estoque === '' || item.estoqueAtual.toString().includes(columnFilters.estoque)) &&
      (columnFilters.minimo === '' || item.estoqueMinimo.toString().includes(columnFilters.minimo)) &&
      (columnFilters.valor === '' || item.valorUnitario.toString().includes(columnFilters.valor)) &&
      (columnFilters.status === 'Todos' || item.status === columnFilters.status);

    return matchesSearch && matchesCategory && matchesStatus && matchesColumnFilters;
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

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/estoque">Estoque & Inventário</Link>
        <ChevronRight size={14} />
        <span>Almoxarifado & Insumos</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Package size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Almoxarifado & Insumos</h1>
            <p className="description">Inteligência de materiais, medicamentos e controle de estoque de segurança.</p>
          </div>
        </div>
        <div className="connectivity-section mr-4">
          <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
            <Activity size={12} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline">
            <FileText size={18} strokeWidth={3} />
            <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Insumo</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Imobilizado em Estoque"
          value={`R$ ${totalEmEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtext="Base: Custo Médio"
          icon={DollarSign}
          color="indigo"
          delay="0s"
        />
        <SummaryCard 
          label="Reposição Crítica"
          value={itensCriticos.toString().padStart(2, '0')}
          subtext="Abaixo do estoque mín."
          icon={AlertTriangle}
          color="rose"
          delay="0.1s"
        />
        <SummaryCard 
          label="Volume de Insumos"
          value={insumos.length.toString()}
          subtext="Mix de produtos ativo"
          icon={Boxes}
          color="sky"
          delay="0.2s"
        />
        <SummaryCard 
          label="Giro Operacional"
          value="12.5%"
          subtext="Vs. mês anterior"
          icon={Activity}
          color="amber"
          delay="0.3s"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome ou categoria..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container glass">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Estoque Atual</th>
                <th>Estoque Mín.</th>
                <th>Vlr. Unitário</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'categoria', type: 'select', options: [...new Set(insumos.map((i: InsumoType) => i.categoria))] },
                    { key: 'estoque', type: 'text', placeholder: 'Qtd...' },
                    { key: 'minimo', type: 'text', placeholder: 'Mín...' },
                    { key: 'valor', type: 'text', placeholder: 'Valor...' },
                    { key: 'status', type: 'select', options: ['Estável', 'Baixo', 'Crítico'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((insumo) => (
                <tr key={insumo.id} className="hover-row">
                  <td className="font-bold">{insumo.nome}</td>
                  <td>
                    <span className="category-tag">
                      <Tag size={12} /> {insumo.categoria}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold">{insumo.estoqueAtual} {insumo.unidade}</span>
                      <small className="text-slate-400">Em 3 locais</small>
                    </div>
                  </td>
                  <td className="text-muted">{insumo.estoqueMinimo} {insumo.unidade}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold">R$ {insumo.valorUnitario.toFixed(2)}</span>
                      <small className="text-emerald-500 font-medium">Custo Médio</small>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={insumo.status} />
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(insumo, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(insumo)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => {}}>
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
          label="insumos"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes do Insumo' : (selectedInsumo ? 'Editar Insumo' : 'Novo Insumo')}
        subtitle="Inteligência de materiais e controle de estoque de segurança."
        icon={Package}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button 
                type="button" 
                className="btn-premium-solid indigo" 
                onClick={handleSave}
              >
                <CheckCircle2 size={18} strokeWidth={3} />
                <span>{selectedInsumo ? 'Salvar Alterações' : 'Cadastrar Insumo'}</span>
              </button>
            )}
          </>
        }
      >
        <div className="modal-sidebar-layout">
          {/* Sidebar Navigation */}
          <aside className="modal-sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'geral' ? 'active' : ''}`}
              onClick={() => setActiveTab('geral')}
            >
              <Layout size={18} />
              <span>Informações Gerais</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'saldos' ? 'active' : ''}`}
              onClick={() => setActiveTab('saldos')}
            >
              <Warehouse size={18} />
              <span>Saldos por Local</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'historico' ? 'active' : ''}`}
              onClick={() => setActiveTab('historico')}
            >
              <History size={18} />
              <span>Movimentação</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'tecnico' ? 'active' : ''}`}
              onClick={() => setActiveTab('tecnico')}
            >
              <Activity size={18} />
              <span>Ficha Técnica</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'logistica' ? 'active' : ''}`}
              onClick={() => setActiveTab('logistica')}
            >
              <Settings size={18} />
              <span>Parâmetros Logísticos</span>
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="modal-main-content">
            <div className="modern-form-section">
              {activeTab === 'geral' && (
                <div className="form-content-active fade-in">
                  <div className="glass-card mb-6">
                    <div className="card-header pb-4 border-b border-slate-100/50 mb-6 font-bold flex items-center gap-2">
                      <Info size={18} className="text-indigo-500" />
                      Identificação Principal
                    </div>
                    
                    <div className="modern-form-group full-width">
                      <label>Nome do Produto/Insumo</label>
                      <div className="modern-input-wrapper">
                        <input 
                          type="text" 
                          className="modern-input text-lg font-bold"
                          value={formData.nome || ''} 
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          disabled={isViewMode} 
                          required 
                          placeholder="Ex: Sal Mineral 80" 
                        />
                        <Package size={18} className="modern-field-icon" />
                      </div>
                    </div>

                    <div className="modern-form-row three-cols mt-4">
                      <div className="modern-form-group">
                        <SearchableSelect
                          label="Categoria"
                          options={insumoCategories.map((cat: Subcategoria) => ({ id: cat.nome, label: cat.nome }))}
                          value={formData.categoria || ''}
                          onChange={(val) => setFormData({ ...formData, categoria: val })}
                          disabled={isViewMode}
                          required
                        />
                      </div>
                      <div className="modern-form-group">
                        <SearchableSelect
                          label="Unidade"
                          options={INITIAL_UNIDADES.map((un: UnidadeMedida) => ({ id: un.sigla, label: un.sigla, sublabel: un.nome }))}
                          value={formData.unidade || ''}
                          onChange={(val) => setFormData({ ...formData, unidade: val })}
                          disabled={isViewMode}
                          required
                        />
                      </div>
                      <div className="modern-form-group">
                        <label>Custo Unitário</label>
                        <div className="modern-input-wrapper">
                          <input 
                            type="number" 
                            className="modern-input"
                            step="0.01" 
                            value={formData.valorUnitario || 0} 
                            onChange={(e) => setFormData({ ...formData, valorUnitario: parseFloat(e.target.value) || 0 })}
                            disabled={isViewMode} 
                            required 
                          />
                          <DollarSign size={18} className="modern-field-icon" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card">
                    <div className="card-header pb-4 border-b border-slate-100/50 mb-6 font-bold flex items-center gap-2">
                      <Shield size={18} className="text-amber-500" />
                      Políticas e Controle
                    </div>
                    
                    <div className="flags-container">
                      <label className={`checkbox-label-premium mb-4 ${(selectedInsumo && selectedInsumo.estoqueAtual > 0) ? 'locked' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.controlaEstoque ?? true} 
                          onChange={(e) => setFormData({ ...formData, controlaEstoque: e.target.checked })}
                          disabled={isViewMode || !!(selectedInsumo && selectedInsumo.estoqueAtual > 0)} 
                        />
                        <div className="checkbox-text">
                          <span className="font-bold">Controla Estoque</span>
                          <small>Habilita o controle de saldo e cálculo de custo médio ponderado.</small>
                        </div>
                        {(selectedInsumo && selectedInsumo.estoqueAtual > 0) && (
                          <div className="lock-indicator">
                            <ShieldCheck size={14} /> 
                            <span>Item com saldo</span>
                          </div>
                        )}
                      </label>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <label className="checkbox-label-premium">
                          <input 
                            type="checkbox" 
                            checked={formData.paraVenda ?? false} 
                            onChange={(e) => setFormData({ ...formData, paraVenda: e.target.checked })}
                            disabled={isViewMode} 
                          />
                          <div className="checkbox-text">
                            <span className="font-bold">Para Venda</span>
                            <small>Item disponível comercialmente.</small>
                          </div>
                        </label>
                        <label className="checkbox-label-premium">
                          <input 
                            type="checkbox" 
                            checked={formData.paraCompra ?? true} 
                            onChange={(e) => setFormData({ ...formData, paraCompra: e.target.checked })}
                            disabled={isViewMode} 
                          />
                          <div className="checkbox-text">
                            <span className="font-bold">Para Compra</span>
                            <small>Permite inclusão em pedidos.</small>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'saldos' && (
                <div className="form-content-active fade-in">
                  <div className="glass-card">
                    <div className="card-header pb-4 border-b border-slate-100/50 mb-6 font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Warehouse size={18} className="text-indigo-500" />
                        Distribuição por Localidade
                      </div>
                      <div className="badge-premium indigo">
                        Total: {formData.estoqueAtual} {formData.unidade}
                      </div>
                    </div>

                    <div className="info-box mb-6 bg-indigo-50/30 border-indigo-100/50">
                      <Info size={16} className="text-indigo-500" />
                      <p className="text-xs text-indigo-700 font-medium">Os saldos são atualizados automaticamente via Notas de Entrada, Saída e Inventários.</p>
                    </div>

                    <div className="location-grid grid grid-cols-1 gap-4">
                      {selectedInsumo && selectedInsumo.estoquePorLocal && Object.keys(selectedInsumo.estoquePorLocal).length > 0 ? (
                        Object.keys(selectedInsumo.estoquePorLocal).map(local => (
                          <div key={local} className="location-card glass border border-slate-100/50 p-4 rounded-xl flex items-center justify-between hover:border-indigo-200 transition-all cursor-default">
                            <div className="flex items-center gap-4">
                              <div className="location-icon bg-slate-100 p-2 rounded-lg text-slate-500">
                                <MapPin size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-700">{local}</h4>
                                <p className="text-xs text-slate-400">Almoxarifado Ativo</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-indigo-600">{selectedInsumo.estoquePorLocal[local]} {selectedInsumo.unidade}</div>
                              <div className="text-xs font-medium text-emerald-500">R$ {selectedInsumo.custoMedioPorLocal[local]?.toFixed(2)} unit.</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state-minimal p-12 text-center">
                          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Boxes size={32} className="text-slate-200" />
                          </div>
                          <p className="text-slate-400 font-medium">Nenhum saldo registrado para este Insumo.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'historico' && (
                <div className="form-content-active fade-in">
                  <div className="glass-card">
                    <div className="card-header pb-4 border-b border-slate-100/50 mb-6 font-bold flex items-center gap-2">
                      <History size={18} className="text-sky-500" />
                      Últimas Movimentações
                    </div>

                    <div className="movement-list">
                      <div className="movement-entry flex items-center justify-between p-4 border-l-4 border-emerald-500 bg-emerald-50/20 rounded-r-xl mb-3">
                        <div className="flex items-center gap-4">
                          <div className="date-box text-center bg-white/50 p-2 rounded-lg border border-emerald-100 w-16">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">Mar</span>
                            <span className="block text-lg font-black text-slate-700">12</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="badge-mini emerald">ENTRADA</span>
                              <span className="font-bold text-slate-700">NF-e #9822</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Fornecedor: Nutribase Suplementos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-600 font-black text-lg">+ 500 {formData.unidade}</div>
                          <div className="text-[10px] font-bold text-slate-400">Local: Central</div>
                        </div>
                      </div>

                      <div className="movement-entry flex items-center justify-between p-4 border-l-4 border-rose-500 bg-rose-50/20 rounded-r-xl mb-3">
                        <div className="flex items-center gap-4">
                          <div className="date-box text-center bg-white/50 p-2 rounded-lg border border-rose-100 w-16">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase">Mar</span>
                            <span className="block text-lg font-black text-slate-700">14</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="badge-mini rose">SAÍDA</span>
                              <span className="font-bold text-slate-700">Consumo Interno</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Ref: Dieta Lote 04 - Manejo 02</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-rose-600 font-black text-lg">- 120 {formData.unidade}</div>
                          <div className="text-[10px] font-bold text-slate-400">Local: Sede</div>
                        </div>
                      </div>

                      <button className="w-full py-3 text-sm font-bold text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2 mt-4">
                        <Plus size={14} /> Ver todo o histórico
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tecnico' && (
                <div className="form-content-active fade-in">
                  <div className="glass-card mb-6">
                    <div className="card-header pb-4 border-b border-slate-100/50 mb-6 font-bold flex items-center gap-2">
                      <FileText size={18} className="text-rose-500" />
                      Especificações de Saúde e Segurança
                    </div>
                    
                    <div className="modern-form-group full-width">
                      <label>Composição / Princípio Ativo</label>
                      <div className="modern-input-wrapper">
                        <textarea 
                          className="modern-input min-h-[120px]"
                          placeholder="Descreva a composição técnica, concentração de minerais, etc..." 
                          disabled={isViewMode}
                        ></textarea>
                        <Activity size={18} className="modern-field-icon top-3" />
                      </div>
                    </div>

                    <div className="modern-form-row mt-6">
                      <div className="modern-form-group">
                        <label>Período de Carência (Dias)</label>
                        <div className="modern-input-wrapper">
                          <input type="number" className="modern-input" placeholder="Ex: 30" disabled={isViewMode} />
                          <Clock size={18} className="modern-field-icon" />
                        </div>
                      </div>
                      <div className="modern-form-group">
                        <label>Temperatura de Armazenamento</label>
                        <div className="modern-input-wrapper">
                          <input type="text" className="modern-input" placeholder="Ex: 2°C a 8°C" disabled={isViewMode} />
                          <ThermometerSnowflake size={18} className="modern-field-icon" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-box-premium bg-amber-50 border-amber-100 text-amber-800 p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-amber-200/50 rounded-xl text-amber-700">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <strong className="block text-lg mb-1">Alerta de Segurança Alimentar</strong>
                      <p className="text-sm opacity-80 leading-relaxed">
                        Itens com período de carência configurado geram bloqueios automáticos no módulo de Abate e Venda, 
                        evitando que animais tratados com este insumo sejam comercializados antes do prazo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'logistica' && (
                <div className="form-content-active fade-in">
                  <div className="glass-card">
                    <div className="card-header pb-4 border-b border-slate-100/50 mb-6 font-bold flex items-center gap-2">
                      <Settings size={18} className="text-indigo-500" />
                      Gestão de Estoque e Compras
                    </div>
                    
                    <div className="modern-form-row">
                      <div className="modern-form-group">
                        <label>Estoque Inicial</label>
                        <div className="modern-input-wrapper">
                          <input 
                            type="number" 
                            className="modern-input"
                            value={formData.estoqueAtual || 0} 
                            onChange={(e) => setFormData({ ...formData, estoqueAtual: parseFloat(e.target.value) || 0 })}
                            disabled={isViewMode || !!selectedInsumo} 
                          />
                          <Boxes size={18} className="modern-field-icon" />
                        </div>
                        <small className="form-helper text-slate-400">Só pode ser editado em novos cadastros.</small>
                      </div>
                      <div className="modern-form-group">
                        <label>Estoque Mínimo (Ponto de Pedido)</label>
                        <div className="modern-input-wrapper">
                          <input 
                            type="number" 
                            className="modern-input"
                            value={formData.estoqueMinimo || 0} 
                            onChange={(e) => setFormData({ ...formData, estoqueMinimo: parseFloat(e.target.value) || 0 })}
                            disabled={isViewMode} 
                          />
                          <AlertTriangle size={18} className="modern-field-icon" />
                        </div>
                        <small className="form-helper text-rose-400 font-medium">Gera alerta de Reposição Crítica.</small>
                      </div>
                    </div>

                    <div className="modern-form-group full-width mt-6">
                      <label>Fornecedor Preferencial / Fabricante</label>
                      <div className="modern-input-wrapper">
                        <input 
                          type="text" 
                          className="modern-input"
                          placeholder="Digite o nome principal para compras..." 
                          disabled={isViewMode} 
                        />
                        <Truck size={18} className="modern-field-icon" />
                      </div>
                    </div>

                    <div className="modern-form-group full-width mt-4">
                      <label>Localização Padrão de Armazenagem</label>
                      <div className="modern-input-wrapper">
                        <input 
                          type="text" 
                          className="modern-input"
                          placeholder="Ex: Corredor A, Prateleira 02" 
                          disabled={isViewMode} 
                        />
                        <MapPin size={18} className="modern-field-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </ModernModal>
    </div>
  );
};

