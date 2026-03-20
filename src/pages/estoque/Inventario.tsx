import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  MoreHorizontal,
  X,
  Package,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  Warehouse,
  BarChart3,
  RefreshCw,
  Scale,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  DollarSign,
  Boxes
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Inventario.css';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { SummaryCard } from '../../components/SummaryCard';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchableSelect } from '../../components/SearchableSelect';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { SessaoInventario as SessaoType, ItemInventario as ItemType, Insumo as InsumoType } from '../../types';

export const Inventario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    referencia: '',
    responsavel: '',
    local: 'Todos os Locais',
    status: 'Todos'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSessao, setSelectedSessao] = useState<SessaoType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const { user: currentUser, currentOrg } = useAuth();
  const [formData, setFormData] = useState<Partial<SessaoType>>({
    referencia: '',
    local: 'Depósito Central',
    status: 'Em Aberto',
    responsavel: ''
  });
  const [countingItems, setCountingItems] = useState<ItemType[]>([]);
  const [selectedLocal, setSelectedLocal] = useState('Depósito Central');

  const { data: sessoes = [] } = useOfflineQuery<SessaoType>(['sessoes_inventario'], 'sessoes_inventario');
  const { data: insumos = [] } = useOfflineQuery<InsumoType>(['insumos'], 'insumos');
  
  const saveSessaoMutation = useOfflineMutation<SessaoType>('sessoes_inventario', [['sessoes_inventario']]);
  const saveInsumoMutation = useOfflineMutation<InsumoType>('insumos', [['insumos']]);
  const saveMovMutation = useOfflineMutation<any>('movimentacoes_estoque', [['movimentacoes_estoque']]);

  const [isSearchingItem, setIsSearchingItem] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');

  const handleOpenModal = (sessao: SessaoType | null = null, viewOnly = false) => {
    if (sessao) {
      setSelectedSessao(sessao);
      setFormData({ ...sessao });
      setCountingItems([...sessao.dados]);
      setSelectedLocal(sessao.local);
    } else {
      setSelectedSessao(null);
      setFormData({
        referencia: '',
        local: 'Depósito Central',
        status: 'Em Aberto',
        responsavel: currentUser?.name || ''
      });
      setCountingItems([]);
      setSelectedLocal('Depósito Central');
    }
    setIsViewMode(viewOnly);
    setIsSearchingItem(false);
    setItemSearchTerm('');
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSessao(null);
    setIsViewMode(false);
    setCountingItems([]);
    setIsSearchingItem(false);
  };

  const handleSave = async (finalizar = false) => {
    if (!formData.referencia || !formData.local) {
      alert('Por favor, preencha os dados da sessão.');
      return;
    }

    try {
      const itemsContados = countingItems.length;
      const totalDivergencias = countingItems.filter(i => i.divergencia !== 0).length;
      const acuracidade = itemsContados > 0 
        ? Math.round(((itemsContados - totalDivergencias) / itemsContados) * 100) 
        : 100;

      const sessao: SessaoType = {
        id: selectedSessao?.id || Math.random().toString(36).substr(2, 9),
        referencia: formData.referencia!,
        local: formData.local!,
        responsavel: formData.responsavel || currentUser?.name || 'Usuário',
        dataInicio: selectedSessao?.dataInicio || new Date().toISOString(),
        dataFim: finalizar ? new Date().toISOString() : null,
        status: finalizar ? 'Finalizado' : 'Em Aberto',
        itensContados: itemsContados,
        acuracidade: acuracidade,
        dados: countingItems,
        tenant_id: currentOrg?.id || 'default'
      };

      await saveSessaoMutation.mutateAsync(sessao);

      if (finalizar) {
        for (const item of countingItems) {
          const insumo = insumos.find(i => i.nome === item.insumo);
          if (insumo && item.divergencia !== 0) {
            const updatedInsumo = { ...insumo };
            updatedInsumo.estoquePorLocal = { ...insumo.estoquePorLocal };
            updatedInsumo.estoquePorLocal[sessao.local] = item.estoqueFisico;
            updatedInsumo.estoqueAtual = Object.values(updatedInsumo.estoquePorLocal).reduce((sum: number, val: any) => sum + (val as number), 0);

            if (updatedInsumo.estoqueAtual <= 0) updatedInsumo.status = 'Crítico';
            else if (updatedInsumo.estoqueAtual <= updatedInsumo.estoqueMinimo) updatedInsumo.status = 'Baixo';
            else updatedInsumo.status = 'Ok';

            await saveInsumoMutation.mutateAsync(updatedInsumo);

            const adjustmentMov = {
              id: Math.random().toString(36).substr(2, 9),
              tipo: item.divergencia > 0 ? 'Entrada' : 'Saída',
              insumo_id: insumo.id,
              insumo_nome: insumo.nome,
              quantidade: Math.abs(item.divergencia),
              unidade: insumo.unidade,
              data: new Date().toISOString(),
              responsavel: sessao.responsavel,
              motivo: `Ajuste de Inventário: ${sessao.referencia}`,
              local_origem: sessao.local,
              status: 'Processado',
              tenant_id: currentOrg?.id || 'default'
            };
            await saveMovMutation.mutateAsync(adjustmentMov);
          }
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving inventory:', error);
      alert('Erro ao salvar inventário.');
    }
  };

  const handleCountChange = (id: string, physical: number) => {
    setCountingItems(prev => prev.map(item => {
      if (item.id === id) {
        const divergence = physical - item.estoqueSistema;
        const insumo = insumos.find(i => i.nome === item.insumo);
        const unitaryPrice = (selectedLocal !== 'Todos os Locais' && insumo?.custoMedioPorLocal)
            ? (insumo.custoMedioPorLocal as any)[selectedLocal] || insumo.valorUnitario
            : insumo?.valorUnitario || 80;

        return {
          ...item,
          estoqueFisico: physical,
          divergencia: divergence,
          valorDivergencia: divergence * unitaryPrice
        };
      }
      return item;
    }));
  };

  const loadSystemStock = () => {
    let relevantItems: any[] = [];
    if (selectedLocal === 'Todos os Locais') {
      relevantItems = insumos.map(insumo => {
        const totalStock = Object.values(insumo.estoquePorLocal).reduce((sum: number, val: any) => sum + (val as number), 0);
        return { ...insumo, estoqueAtual: totalStock };
      });
    } else {
      relevantItems = insumos
        .filter(insumo => (insumo.estoquePorLocal as any)[selectedLocal] !== undefined)
        .map(insumo => ({ 
            ...insumo, 
            estoqueAtual: (insumo.estoquePorLocal as any)[selectedLocal],
            valorUnitario: (insumo.custoMedioPorLocal as any)[selectedLocal] || insumo.valorUnitario
        }));
    }

    const systemItems: ItemType[] = relevantItems.map(insumo => ({
      id: insumo.id,
      insumo: insumo.nome,
      estoqueSistema: insumo.estoqueAtual,
      estoqueFisico: 0,
      unidade: insumo.unidade,
      divergencia: -insumo.estoqueAtual,
      valorDivergencia: -insumo.estoqueAtual * insumo.valorUnitario
    }));
    setCountingItems(systemItems);
  };

  const selectItemForInventory = (insumo: InsumoType) => {
    if (countingItems.some(item => item.insumo === insumo.nome)) {
      setIsSearchingItem(false);
      setItemSearchTerm('');
      return;
    }

    const itemStock = selectedLocal === 'Todos os Locais' 
      ? Object.values(insumo.estoquePorLocal).reduce((sum: number, val: any) => sum + (val as number), 0)
      : (insumo.estoquePorLocal as any)[selectedLocal] || 0;

    const newItem: ItemType = {
      id: Math.random().toString(36).substr(2, 9),
      insumo: insumo.nome,
      estoqueSistema: itemStock,
      estoqueFisico: 0,
      unidade: insumo.unidade,
      divergencia: -itemStock,
      valorDivergencia: -itemStock * insumo.valorUnitario
    };
    setCountingItems(prev => [...prev, newItem]);
    setIsSearchingItem(false);
    setItemSearchTerm('');
  };

  const finalizados = sessoes.filter(s => s.status === 'Finalizado');
  const acuracidadeMedia = finalizados.length > 0
    ? (finalizados.reduce((acc, s) => acc + s.acuracidade, 0) / finalizados.length).toFixed(1)
    : 0;
  
  const pendentes = sessoes.filter(s => s.status === 'Em Aberto').length;
  const ultimoFechamento = finalizados.length > 0
    ? new Date(finalizados[0].dataFim!).toLocaleDateString('pt-BR')
    : '-';

  const filteredData = sessoes.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = s.referencia.toLowerCase().includes(searchLower) || 
                         s.responsavel.toLowerCase().includes(searchLower) ||
                         s.local.toLowerCase().includes(searchLower);
    
    const matchesColumnFilters = 
      (columnFilters.referencia === '' || s.referencia.toLowerCase().includes(columnFilters.referencia.toLowerCase())) &&
      (columnFilters.responsavel === '' || s.responsavel.toLowerCase().includes(columnFilters.responsavel.toLowerCase())) &&
      (columnFilters.local === 'Todos os Locais' || s.local === columnFilters.local) &&
      (columnFilters.status === 'Todos' || s.status === columnFilters.status);

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

  const totalAdjustment = countingItems.reduce((acc, item) => acc + item.valorDivergencia, 0);
  const totalInventoryItems = countingItems.length;

  const searchResults = insumos.filter(i => 
    i.nome.toLowerCase().includes(itemSearchTerm.toLowerCase())
  ).map(insumo => {
    const itemStock = selectedLocal === 'Todos os Locais' 
      ? Object.values(insumo.estoquePorLocal).reduce((sum: number, val: any) => sum + (val as number), 0)
      : (insumo.estoquePorLocal as any)[selectedLocal] || 0;
    return { ...insumo, estoqueAtual: itemStock };
  });

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/estoque">Estoque & Inventário</Link>
        <ChevronRight size={14} />
        <span>Inventário</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <ClipboardList size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Inventário Periódico</h1>
            <p className="description">Auditoria física do almoxarifado, análise de discrepâncias e ajustes de saldo.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2">
            <RefreshCw size={18} strokeWidth={3} />
            <span>Conciliação Automática</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Iniciar Novo Inventário</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Acuracidade Média"
          value={`${acuracidadeMedia}%`}
          trend={{ value: '+2% vs balanço ant.', type: 'up', icon: TrendingUp }}
          icon={Scale}
          color="sky"
          delay="0s"
        />
        <SummaryCard 
          label="Discrepância Líquida"
          value="R$ -840,50"
          subtext="Base: Últimos 3 meses"
          icon={TrendingDown}
          color="rose"
          delay="0.1s"
        />
        <SummaryCard 
          label="Último Fechamento"
          value={ultimoFechamento}
          subtext="Conforme auditorias"
          icon={CheckCircle2}
          color="emerald"
          delay="0.2s"
        />
        <SummaryCard 
          label="Itens Pendentes"
          value={pendentes.toString()}
          subtext="Aguardando contagem"
          icon={Warehouse}
          color="amber"
          delay="0.3s"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por referência ou responsável..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 gap-2 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
        </TableFilters>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referência / Sessão</th>
                <th>Iniciada em</th>
                <th>Finalizada em</th>
                <th>Local</th>
                <th>Responsável</th>
                <th>Acuracidade</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'referencia', type: 'text', placeholder: 'Referência...' },
                    { key: 'local', type: 'select', options: ['Depósito Central', 'Farmácia Veterinária', 'Almoxarifado'] },
                    { key: 'responsavel', type: 'text', placeholder: 'Responsável...' },
                    { key: 'status', type: 'select', options: ['Em Aberto', 'Finalizado', 'Cancelado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((sessao) => (
                <tr key={sessao.id}>
                  <td className="font-bold">{sessao.referencia}</td>
                  <td>{new Date(sessao.dataInicio).toLocaleDateString('pt-BR')}</td>
                  <td>{sessao.dataFim ? new Date(sessao.dataFim).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <span className="location-badge">{sessao.local}</span>
                  </td>
                  <td>{sessao.responsavel}</td>
                  <td>
                    {sessao.status === 'Finalizado' ? (
                        <div className="accuracy-cell">
                            <span className={`accuracy-val ${sessao.acuracidade >= 95 ? 'text-green' : 'text-orange'}`}>
                                {sessao.acuracidade}%
                            </span>
                            <div className="accuracy-bar-bg">
                                <div className="accuracy-bar-fill" style={{width: `${sessao.acuracidade}%`, background: sessao.acuracidade >= 95 ? '#10B981' : '#F59E0B'}}></div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted">Processando...</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={sessao.status} />
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(sessao, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(sessao)}>
                        <Edit size={18} strokeWidth={3} />
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
          label="inventários"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Auditoria de Inventário' : (selectedSessao ? 'Ajustar Inventário' : 'Nova Sessão de Contagem')}
        subtitle="Compare o saldo oficial do sistema com a contagem física real."
        icon={ClipboardList}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <>
                <button type="button" className="btn-premium-outline" onClick={() => handleSave(false)}>
                    <RefreshCw size={18} strokeWidth={3} />
                    <span>Salvar Rascunho</span>
                </button>
                <button type="button" className="btn-premium-solid indigo" onClick={() => handleSave(true)}>
                    <span>Finalizar & Ajustar</span>
                    <CheckCircle2 size={18} strokeWidth={3} />
                </button>
              </>
            )}
          </>
        }
      >
        <div className="modal-tabs mb-6">
            <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Dados da Sessão</button>
            <button className={`tab-btn ${activeTab === 'contagem' ? 'active' : ''}`} onClick={() => setActiveTab('contagem')}>Contagem & Divergência</button>
        </div>
        
        <div className="modern-form-section">
          {activeTab === 'geral' && (
            <div className="form-content-active fade-in">
              <div className="modern-form-group full-width">
                <label>Referência / Título do Inventário</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="text" 
                    className="modern-input text-lg font-bold"
                    value={formData.referencia || ''} 
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    disabled={isViewMode} 
                    required 
                    placeholder="Ex: Inventário Mensal Abril/24" 
                  />
                  <ClipboardList size={18} className="modern-field-icon" />
                </div>
              </div>

              <div className="modern-form-row">
                <div className="modern-form-group">
                  <label>Responsável</label>
                  <div className="modern-input-wrapper">
                    <input 
                      type="text" 
                      className="modern-input"
                      value={formData.responsavel || ''} 
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      disabled={isViewMode} 
                    />
                    <User size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group">
                  <SearchableSelect
                    label="Almoxarifado"
                    options={[
                      { id: 'Depósito Central', label: 'Depósito Central' },
                      { id: 'Farmácia Veterinária', label: 'Farmácia Veterinária' },
                      { id: 'Galpão de Nutrição', label: 'Galpão de Nutrição' }
                    ]}
                    value={formData.local || ''}
                    onChange={(val) => {
                      setFormData({ ...formData, local: val });
                      setSelectedLocal(val);
                    }}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              <div className="info-box-premium mt-6">
                <Info size={20} />
                <div className="text-sm">
                  <strong>Impacto no Estoque:</strong> Ao finalizar, os saldos físicos serão aplicados e movimentações de ajuste serão geradas automaticamente.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contagem' && (
            <div className="form-content-active fade-in">
              <div className="table-container-minimal mb-6 overflow-hidden rounded-xl border border-slate-100">
                <table className="modern-table-minimal w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="p-3 text-left text-xs font-bold uppercase text-slate-500">Insumo</th>
                      <th className="p-3 text-center text-xs font-bold uppercase text-slate-500">Sistema</th>
                      <th className="p-3 text-center text-xs font-bold uppercase text-slate-500">Físico</th>
                      <th className="p-3 text-center text-xs font-bold uppercase text-slate-500">Dif.</th>
                      <th className="p-3 text-right text-xs font-bold uppercase text-slate-500">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {countingItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/30">
                        <td className="p-3">
                          <span className="font-bold text-slate-700">{item.insumo}</span>
                          <span className="ml-2 text-xs text-slate-400">({item.unidade})</span>
                        </td>
                        <td className="p-3 text-center text-slate-600">{item.estoqueSistema}</td>
                        <td className="p-3 text-center">
                          <input 
                            type="number" 
                            className="w-20 rounded border border-slate-200 p-1 text-center text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                            value={item.estoqueFisico} 
                            onChange={(e) => handleCountChange(item.id, Number(e.target.value))}
                            disabled={isViewMode}
                          />
                        </td>
                        <td className={`p-3 text-center font-bold ${item.divergencia < 0 ? 'text-rose-500' : item.divergencia > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {item.divergencia > 0 ? '+' : ''}{item.divergencia}
                        </td>
                        <td className={`p-3 text-right font-black ${item.valorDivergencia < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          R$ {Math.abs(item.valorDivergencia).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!isViewMode && (
                <div className="flex gap-3 mb-6">
                  {isSearchingItem ? (
                    <div className="flex-1 input-group-modern search-active animate-fade-in relative">
                      <input 
                        className="modern-input pl-10 h-10"
                        placeholder="Pesquisar insumo para adicionar..." 
                        autoFocus
                        value={itemSearchTerm}
                        onChange={(e) => setItemSearchTerm(e.target.value)}
                      />
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      {itemSearchTerm && (
                        <div className="search-dropdown-premium absolute w-full top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                          {searchResults.map(insumo => (
                            <div key={insumo.id} className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center" onClick={() => selectItemForInventory(insumo)}>
                              <div>
                                <span className="font-bold text-slate-700 block">{insumo.nome}</span>
                                <span className="text-xs text-slate-400">Saldo atual: {insumo.estoqueAtual} {insumo.unidade}</span>
                              </div>
                              <Plus size={16} className="text-indigo-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <button className="flex-1 btn-premium-outline py-2 gap-2" onClick={() => setIsSearchingItem(true)}>
                        <Plus size={16} strokeWidth={3} />
                        <span>Adicionar Item</span>
                      </button>
                      <button className="flex-1 btn-premium-outline py-2 gap-2" onClick={loadSystemStock}>
                        <RefreshCw size={16} strokeWidth={3} />
                        <span>Carregar Tudo</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="summary-banner-premium bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center">
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] uppercase tracking-widest block mb-1">Acuracidade</span>
                  <span className="text-2xl font-black text-indigo-400">
                    {totalInventoryItems > 0 ? (countingItems.filter(i => i.divergencia === 0).length / totalInventoryItems * 100).toFixed(1) : 100}%
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center">
                  <span className="text-slate-400 text-[10px] uppercase tracking-widest block mb-1">Divergência Total</span>
                  <span className={`text-2xl font-black ${totalAdjustment < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    R$ {Math.abs(totalAdjustment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModernModal>
    </div>
  );
};
