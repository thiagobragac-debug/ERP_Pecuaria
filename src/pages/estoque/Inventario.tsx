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
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Inventario.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { SessaoInventario as SessaoType, ItemInventario as ItemType, Insumo as InsumoType } from '../../types';


export const Inventario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterLocal, setFilterLocal] = useState('Todos os Locais');
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
  const [countingItems, setCountingItems] = useState<ItemType[]>([]);
  const [selectedLocal, setSelectedLocal] = useState('Todos os Locais');

  const isOnline = useOnlineStatus();
  const { data: sessoes = [], isLoading: loadingSessoes } = useOfflineQuery<SessaoType>(['sessoes_inventario'], 'sessoes_inventario');
  const { data: insumos = [], isLoading: loadingInsumos } = useOfflineQuery<InsumoType>(['insumos'], 'insumos');
  const saveSessaoMutation = useOfflineMutation<SessaoType>('sessoes_inventario', [['sessoes_inventario']]);

  const [isSearchingItem, setIsSearchingItem] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');

  const handleOpenModal = (sessao: SessaoType | null = null, viewOnly = false) => {
    setSelectedSessao(sessao);
    setIsViewMode(viewOnly);
    setIsSearchingItem(false);
    setItemSearchTerm('');
    
    if (sessao) {
      setCountingItems([...sessao.dados]);
      setSelectedLocal(sessao.local);
    } else {
      // New session starts empty
      setCountingItems([]);
      setSelectedLocal('Todos os Locais');
    }
    
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSessao(null);
    setIsViewMode(false);
    setCountingItems([]);
    setIsSearchingItem(false);
    setSelectedLocal('Todos os Locais');
  };

  const handleCountChange = (id: string, physical: number) => {
    setCountingItems(prev => prev.map(item => {
      if (item.id === id) {
        const divergence = physical - item.estoqueSistema;
        // Find specific cost for this location or use global
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
    // Determine which items and balances based on selectedLocal
    let relevantItems: any[] = [];

    if (selectedLocal === 'Todos os Locais') {
      // Sum balances across all locations for this simulation
      relevantItems = insumos.map(insumo => {
        const totalStock = Object.values(insumo.estoquePorLocal).reduce((sum: number, val) => sum + (val as number), 0);
        return { ...insumo, estoqueAtual: totalStock };
      });
    } else {
      // Filter only items that have stock in this specific location
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
    // Check if already in list
    if (countingItems.some(item => item.insumo === insumo.nome)) {
      setIsSearchingItem(false);
      setItemSearchTerm('');
      return;
    }

    const itemStock = selectedLocal === 'Todos os Locais' 
      ? Object.values(insumo.estoquePorLocal).reduce((sum: number, val) => sum + (val as number), 0)
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
                         s.local.toLowerCase().includes(searchLower) ||
                         s.status.toLowerCase().includes(searchLower) ||
                         s.acuracidade.toString().includes(searchLower) ||
                         s.itensContados.toString().includes(searchLower);
    
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
      ? Object.values(insumo.estoquePorLocal).reduce((sum: number, val) => sum + (val as number), 0)
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
            <ClipboardList size={32} />
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
        <div className="summary-card card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Acuracidade Média</span>
            <span className="summary-value text-blue">{acuracidadeMedia}%</span>
            <span className="summary-trend up">
              <TrendingUp size={14} /> +2% vs balanço ant.
            </span>
          </div>
          <div className="summary-icon blue">
            <Scale size={24} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Discrepância Líquida</span>
            <span className="summary-value text-red">R$ -840,50</span>
            <span className="summary-subtext">Base: Últimos 3 meses</span>
          </div>
          <div className="summary-icon red">
            <TrendingDown size={24} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Último Fechamento</span>
            <span className="summary-value">{ultimoFechamento}</span>
            <span className="summary-subtext">Conforme auditorias</span>
          </div>
          <div className="summary-icon green">
            <CheckCircle2 size={24} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Itens Pendentes</span>
            <span className="summary-value">{pendentes}</span>
            <span className="summary-subtext text-orange">Aguardando contagem</span>
          </div>
          <div className="summary-icon orange">
            <Warehouse size={24} strokeWidth={3} />
          </div>
        </div>
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
                    <span className={`status-badge inv-${sessao.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {sessao.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(sessao, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(sessao)}>
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
          label="inventários"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Auditoria de Inventário' : (selectedSessao ? 'Ajustar Inventário' : 'Nova Sessão de Contagem')}
        subtitle="Compare o saldo oficial do sistema com a contagem física real realizada no galpão."
        icon={ClipboardList}
        size="lg"
        footer={
          <div className="flex gap-3 w-full justify-between items-center">
            <button type="button" className="btn-premium-outline px-8" onClick={handleCloseModal}>Sair sem Salvar</button>
            {!isViewMode && (
                <div className="flex gap-3">
                     <button type="button" className="btn-premium-outline px-6">Salvar Rascunho</button>
                     <button type="button" className="btn-premium-solid indigo px-6" onClick={handleCloseModal}>Finalizar Auditoria & Ajustar Saldo</button>
                </div>
            )}
          </div>
        }
      >
        <div className="modal-tabs mb-6">
            <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Dados da Sessão</button>
            <button className={`tab-btn ${activeTab === 'contagem' ? 'active' : ''}`} onClick={() => setActiveTab('contagem')}>Tabela de Contagem & Divergência</button>
        </div>
        
        <div className="inventory-modal-content">
          <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }}>
            {activeTab === 'geral' && (
                <div className="form-grid">
                    <div className="form-group col-12">
                      <label>Referência do Inventário (Título)</label>
                      <div className="input-with-icon">
                        <input type="text" defaultValue={selectedSessao?.referencia} disabled={isViewMode} required placeholder="Ex: Inventário Mensal Med. Abril/24" />
                        <ClipboardList size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Responsável pela Auditoria</label>
                      <div className="input-with-icon">
                        <input type="text" defaultValue={selectedSessao?.responsavel} disabled={isViewMode} required />
                        <User size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Almoxarifado / Localidade</label>
                      <div className="input-with-icon">
                        <select 
                          value={selectedLocal} 
                          onChange={(e) => setSelectedLocal(e.target.value)}
                          disabled={isViewMode}
                        >
                            <option>Todos os Locais</option>
                            <option>Depósito Central</option>
                            <option>Galpão de Nutrição</option>
                            <option>Farmácia Veterinária</option>
                        </select>
                        <Warehouse size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Tipo de Auditoria</label>
                      <div className="input-with-icon">
                        <select disabled={isViewMode}>
                            <option>Inventário Total (Wall-to-Wall)</option>
                            <option>Inventário Cíclico (Por Categoria)</option>
                            <option>Auditoria de Amostragem (Spot Check)</option>
                        </select>
                        <BarChart3 size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Status</label>
                      <div className="input-with-icon">
                        <select defaultValue={selectedSessao?.status} disabled={isViewMode}>
                            <option>Em Aberto</option>
                            <option>Finalizado</option>
                            <option>Cancelado</option>
                        </select>
                        <Activity size={18} className="field-icon" />
                      </div>
                    </div>
                </div>
            )}

            {activeTab === 'contagem' && (
                <div className="counting-section">
                    <div className="counting-table-container">
                        <table className="counting-table">
                            <thead>
                                <tr>
                                    <th>Insumo</th>
                                    <th>Unidade</th>
                                    <th className="text-center">Sistema</th>
                                    <th className="text-center">Contagem Física</th>
                                    <th className="text-center">Divergência</th>
                                    <th className="text-right">Vlr. Ajuste</th>
                                </tr>
                            </thead>
                            <tbody>
                                {countingItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-bold">{item.insumo}</td>
                                        <td>{item.unidade}</td>
                                        <td className="text-center font-semibold">{item.estoqueSistema}</td>
                                        <td className="text-center">
                                            <input 
                                                type="number" 
                                                value={item.estoqueFisico} 
                                                onChange={(e) => handleCountChange(item.id, Number(e.target.value))}
                                                disabled={isViewMode}
                                                className="small-input text-center"
                                            />
                                        </td>
                                        <td className={`text-center font-bold ${item.divergencia < 0 ? 'text-red' : item.divergencia > 0 ? 'text-green' : 'text-muted'}`}>
                                            {item.divergencia > 0 ? '+' : ''}{item.divergencia}
                                        </td>
                                        <td className={`text-right font-semibold ${item.valorDivergencia < 0 ? 'text-red' : ''}`}>
                                            R$ {item.valorDivergencia.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {countingItems.length === 0 && (
                                  <tr>
                                    <td colSpan={6} className="text-center text-muted py-8">
                                      Nenhum item carregado para contagem. Utilize os botões abaixo para iniciar.
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!isViewMode && (
                        <div className="counting-actions-area mt-4">
                            {isSearchingItem ? (
                              <div className="item-selector-dropdown card glass animate-slide-up mb-4">
                                <div className="selector-header p-3" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <Search size={16} />
                                  <input 
                                    type="text" 
                                    placeholder="Buscar no cadastro de insumos..." 
                                    autoFocus
                                    value={itemSearchTerm}
                                    onChange={(e) => setItemSearchTerm(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'inherit', flex: 1, outline: 'none' }}
                                  />
                                  <button type="button" className="p-1 hover:bg-slate-100 rounded" onClick={() => setIsSearchingItem(false)}><X size={16} /></button>
                                </div>
                                <div className="selector-results" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                  {searchResults.map(insumo => (
                                    <div 
                                      key={insumo.id} 
                                      className="result-item p-3 hover:bg-slate-50 cursor-pointer"
                                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                      onClick={() => selectItemForInventory(insumo)}
                                    >
                                      <div className="item-info">
                                        <strong className="block">{insumo.nome}</strong>
                                        <span className="text-xs text-slate-500">Estoque Sistema: {insumo.estoqueAtual} {insumo.unidade}</span>
                                      </div>
                                      <Plus size={16} className="text-indigo-500" />
                                    </div>
                                  ))}
                                  {searchResults.length === 0 && (
                                    <div className="no-item-found p-4 text-center text-sm text-slate-400">Nenhum insumo encontrado.</div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="counting-actions flex gap-3 mb-4">
                                  <button type="button" className="btn-premium-outline btn-sm py-2 px-4 gap-2 flex items-center" onClick={() => setIsSearchingItem(true)}>
                                      <Plus size={16} strokeWidth={3} /> 
                                      <span>Adicionar Item Individual</span>
                                  </button>
                                  <button type="button" className="btn-premium-outline btn-sm py-2 px-4 gap-2 flex items-center" onClick={loadSystemStock}>
                                      <RefreshCw size={16} strokeWidth={3} /> 
                                      <span>Carregar Saldo do Sistema</span>
                                  </button>
                              </div>
                            )}
                        </div>
                    )}

                    <div className="discrepancy-summary-bar p-4 bg-slate-50 rounded-lg flex justify-between items-center text-sm">
                        <div className="discrepancy-item">
                            <span className="text-slate-500">Total Itens:</span>
                            <strong className="ml-2">{totalInventoryItems}</strong>
                        </div>
                        <div className="discrepancy-item">
                            <span className="text-slate-500">Vlr. Total Sistema:</span>
                            <strong className="ml-2">R$ 84.200,00</strong>
                        </div>
                        <div className="discrepancy-item">
                            <span className="text-slate-500">Ajuste Líquido:</span>
                            <strong className={`ml-2 ${totalAdjustment < 0 ? 'text-red' : ''}`}>
                              R$ {totalAdjustment.toFixed(2)}
                            </strong>
                        </div>
                        <div className="discrepancy-item">
                            <span className="text-slate-500">Acuracidade:</span>
                            <strong className="ml-2 text-green">
                              {totalInventoryItems > 0 ? (countingItems.filter(i => i.divergencia === 0).length / totalInventoryItems * 100).toFixed(1) : 0}%
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            {!isViewMode && (
                <div className="info-box primary mt-6">
                    <p><Info size={16} className="inline mr-2" /> <strong>Impacto no Estoque:</strong> Ao finalizar este inventário, os saldos físicos serão aplicados como o novo "Saldo Atual" do sistema e uma movimentação de ajuste será gerada.</p>
                </div>
            )}
          </form>
        </div>
      </StandardModal>
    </div>
  );
};

