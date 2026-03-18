
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Activity
} from 'lucide-react';
import './SolicitacaoCompra.css';
import { INITIAL_CATEGORIES, INITIAL_UNIDADES, INITIAL_COMPANIES } from '../../data/initialData';
import { Subcategoria, UnidadeMedida, Company } from '../../types/definitions';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';

interface ItemSolicitacao {
  id: string;
  insumoId: string;
  insumoNome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  centroCustoId?: string;
}

interface Solicitacao {
  id: string;
  numero: string;
  data: string;
  solicitante: string;
  prioridade: 'Normal' | 'Alta' | 'Urgente';
  status: 'Pendente' | 'Em Cotação' | 'Aprovado' | 'Recusado';
  itens: ItemSolicitacao[];
  valorTotal: number;
  empresaId: string;
}

const mockSolicitacoes: Solicitacao[] = [
  {
    id: '1',
    numero: 'SC-2024-001',
    data: '2024-03-10',
    solicitante: 'João Silva',
    prioridade: 'Alta',
    status: 'Pendente',
    itens: [
      { id: 'i1', insumoId: 's7', insumoNome: 'Sal Mineral', quantidade: 200, unidade: 'kg', preco: 3.5 },
      { id: 'i2', insumoId: 's8', insumoNome: 'Ração', quantidade: 2, unidade: 'ton', preco: 2400 }
    ],
    valorTotal: 5500,
    empresaId: 'M1'
  },
  {
    id: '2',
    numero: 'SC-2024-002',
    data: '2024-03-12',
    solicitante: 'Maria Oliveira',
    prioridade: 'Urgente',
    status: 'Em Cotação',
    itens: [
      { id: 'i3', insumoId: 's6', insumoNome: 'Vacinas', quantidade: 10, unidade: 'un', preco: 85 }
    ],
    valorTotal: 850,
    empresaId: 'F1'
  }
];

import { MOCK_INSUMOS } from '../../data/inventoryData';

export const SolicitacaoCompra = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPrioridade, setFilterPrioridade] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  
  // Form State
  const [items, setItems] = useState<ItemSolicitacao[]>([]);
  const [solicitante, setSolicitante] = useState('');
  const [prioridade, setPrioridade] = useState<'Baixa' | 'Normal' | 'Alta' | 'Urgente'>('Normal');
  const [numero, setNumero] = useState('');
  const [data, setData] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    data: '',
    solicitante: '',
    prioridade: 'Todos',
    status: 'Todos',
    valorTotal: ''
  });

  const filteredData = mockSolicitacoes.filter(sol => {
    const matchesSearch = 
      sol.numero.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sol.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.prioridade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.valorTotal.toString().includes(searchTerm) ||
      sol.itens.some(it => it.insumoNome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'Todos' || sol.status === filterStatus;
    const matchesPrioridade = filterPrioridade === 'Todos' || sol.prioridade === filterPrioridade;
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || sol.numero.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.data === '' || sol.data.includes(columnFilters.data)) &&
      (columnFilters.solicitante === '' || sol.solicitante.toLowerCase().includes(columnFilters.solicitante.toLowerCase())) &&
      (columnFilters.prioridade === 'Todos' || sol.prioridade === columnFilters.prioridade) &&
      (columnFilters.status === 'Todos' || sol.status === columnFilters.status) &&
      (columnFilters.valorTotal === '' || sol.valorTotal.toString().includes(columnFilters.valorTotal));

    return matchesSearch && matchesStatus && matchesPrioridade && matchesColumnFilters;
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

  const insumos = MOCK_INSUMOS.filter(i => i.paraCompra);
  
  const centroCustoCategory = INITIAL_CATEGORIES.find(c => c.nome === 'Centros de Custo');
  const centrosCusto = centroCustoCategory ? centroCustoCategory.subcategorias : [];

  useEscapeKey(() => {
    if (isModalOpen) setIsModalOpen(false);
  });

  const handleOpenModal = (sol: Solicitacao | null = null, viewOnly = false) => {
    if (sol) {
      setSelectedSolicitacao(sol);
      setItems(sol.itens);
      setSolicitante(sol.solicitante);
      setPrioridade(sol.prioridade as any);
      setNumero(sol.numero);
      setData(sol.data);
      setEmpresaId(sol.empresaId || '');
    } else {
      setSelectedSolicitacao(null);
      setItems([{ id: Date.now().toString(), insumoId: '', insumoNome: '', quantidade: 0, unidade: '', preco: 0, centroCustoId: '' }]);
      setSolicitante('');
      setPrioridade('Normal');
      setNumero(`SC-${new Date().getFullYear()}-${String(mockSolicitacoes.length + 1).padStart(3, '0')}`);
      setData(new Date().toISOString().split('T')[0]);
      setEmpresaId(INITIAL_COMPANIES[0]?.id || '');
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
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

  const handleGenerateMap = (sol: Solicitacao) => {
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
      case 'Média': return 'priority-medium';
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
    <div className="page-container fade-in">
      <div className="page-header-row">
        <button className="back-btn" onClick={() => window.history.back()}>
          <ChevronLeft size={20} />
          Voltar
        </button>
        <div className="title-section">
          <div className="icon-badge indigo">
            <FileText size={24} />
          </div>
          <div>
            <h1>Solicitação de Compra</h1>
            <p className="description">Gestão de necessidades e requisições de suprimentos.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Solicitação</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Pendente</span>
            <span className="summary-value">{mockSolicitacoes.filter(s => s.status === 'Pendente').length}</span>
            <span className="summary-subtext">Aguardando cotação</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={24} />
          </div>
        </div>
        
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Valor Estimado</span>
            <span className="summary-value">R$ {mockSolicitacoes.reduce((acc, s) => acc + s.valorTotal, 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            <span className="summary-subtext">Total em solicitações</span>
          </div>
          <div className="summary-icon green">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Urgentes</span>
            <span className="summary-value">{mockSolicitacoes.filter(s => s.prioridade === 'Urgente').length}</span>
            <span className="summary-subtext">Atenção imediata</span>
          </div>
          <div className="summary-icon purple">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por número ou solicitante..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 ${isFiltersOpen ? 'filter-active' : ''}`}
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
                <th>Número</th>
                <th>Data</th>
                <th>Solicitante</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Total Est.</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'solicitante', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'prioridade', type: 'select', options: ['Baixa', 'Média', 'Alta', 'Urgente'] },
                    { key: 'status', type: 'select', options: ['Pendente', 'Em Cotação', 'Aprovado', 'Recusado'] },
                    { key: 'valorTotal', type: 'text', placeholder: 'Valor...' }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((sol) => (
                <tr key={sol.id}>
                  <td className="font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary-indigo)' }}></div>
                      {sol.numero}
                    </div>
                  </td>
                  <td>{sol.data}</td>
                  <td>
                    <div className="solicitante-cell flex items-center gap-3">
                      <div className="avatar-circle font-black text-[10px] bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center border border-slate-200">
                        {sol.solicitante.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-slate-800">{sol.solicitante}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityColor(sol.prioridade)}`}>
                      {sol.prioridade}
                    </span>
                  </td>
                  <td>
                    <div className={`status-indicator status-${sol.status.toLowerCase().replace(' ', '-')}`}>
                      {getStatusIcon(sol.status)}
                      <span>{sol.status}</span>
                    </div>
                  </td>
                  <td className="font-bold" style={{ color: 'var(--text-main)' }}>R$ {sol.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Gerar Mapa de Cotação" onClick={() => handleGenerateMap(sol)}>
                        <ArrowRight size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(sol, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(sol)}>
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
            label="solicitações"
          />
        </div>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Detalhes da Solicitação' : (selectedSolicitacao ? 'Editar Solicitação' : 'Nova Solicitação')}
        subtitle="Preencha os dados básicos e os itens necessários."
        icon={FileText}
        size="xl"
        footer={
          <>
            <div className="total-box-horizontal">
              <span className="total-label">Total da Solicitação:</span>
              <span className="total-value">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="footer-actions flex gap-3">
              <button type="button" className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              {!isViewMode && (
                <button type="submit" className="btn-premium-solid indigo" onClick={() => setIsModalOpen(false)}>
                  <CheckCircle2 size={18} strokeWidth={3} />
                  <span>{selectedSolicitacao ? 'Salvar Alterações' : 'Adicionar Solicitação'}</span>
                </button>
              )}
            </div>
          </>
        }
      >
        <div className="form-sections-grid">
          <div className="form-section">
            <div className="section-title">
              <FileText size={16} />
              Informações Gerais
            </div>
            
            <div className="form-grid mt-4">
              <div className="form-group col-3">
                <label>Número</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    value={numero} 
                    onChange={(e) => setNumero(e.target.value)} 
                    required 
                    disabled={isViewMode}
                    placeholder="Ex: SC-001"
                  />
                  <FileText size={18} className="field-icon" />
                </div>
              </div>

              <div className="form-group col-9">
                <label>Solicitante</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    value={solicitante} 
                    onChange={(e) => setSolicitante(e.target.value)} 
                    required 
                    disabled={isViewMode}
                    placeholder="Nome Completo"
                  />
                  <User size={18} className="field-icon" />
                </div>
              </div>

              <div className="form-group col-6">
                <label>Empresa / Unidade</label>
                <div className="input-with-icon">
                  <select 
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    disabled={isViewMode}
                  >
                    <option value="">Selecione...</option>
                    {INITIAL_COMPANIES.filter(c => c.status === 'Ativa').map(company => (
                      <option key={company.id} value={company.id}>
                        {company.nomeFantasia || company.razaoSocial}
                      </option>
                    ))}
                  </select>
                  <Building2 size={18} className="field-icon" />
                </div>
              </div>

              <div className="form-group col-3">
                <label>Data</label>
                <div className="input-with-icon">
                  <input 
                    type="date" 
                    value={data} 
                    onChange={(e) => setData(e.target.value)} 
                    required 
                    disabled={isViewMode}
                  />
                  <Calendar size={18} className="field-icon" />
                </div>
              </div>

              <div className="form-group col-3">
                <label>Prioridade</label>
                <div className="input-with-icon">
                  <select 
                    value={prioridade} 
                    onChange={(e: any) => setPrioridade(e.target.value)} 
                    disabled={isViewMode}
                    className={`priority-select ${getPriorityColor(prioridade)}`}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                  <AlertCircle size={18} className="field-icon" />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="flex justify-between items-center mb-6">
              <div className="section-title mb-0">
                <List size={16} />
                Itens da Solicitação
              </div>
              {!isViewMode && (
                <button type="button" className="btn-premium-solid btn-sm" onClick={addItemRow}>
                  <Plus size={18} strokeWidth={3} />
                  <span>Adicionar Item</span>
                </button>
              )}
            </div>

            <div className="items-cards-container">
              {items.length === 0 ? (
                <div className="empty-items-state animate-slide-up">
                  <Package size={48} />
                  <p>Nenhum item adicionado ainda.</p>
                  {!isViewMode && (
                    <button type="button" className="btn-premium-solid" onClick={addItemRow}>
                      <span>Adicionar Primeiro Item</span>
                    </button>
                  )}
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="item-row-card animate-slide-up" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                    <div className="item-field-group">
                      <label className="item-field-label">Insumo</label>
                      <div className="input-with-icon">
                        <select 
                          value={item.insumoId} 
                          onChange={(e) => updateItem(item.id, 'insumoId', e.target.value)}
                          required
                          disabled={isViewMode}
                        >
                          <option value="">Selecione...</option>
                          {insumos.map((ins: any) => (
                            <option key={ins.id} value={ins.id}>{ins.nome}</option>
                          ))}
                        </select>
                        <Package size={18} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">Centro de Custo</label>
                      <div className="input-with-icon">
                        <select 
                          value={item.centroCustoId} 
                          onChange={(e) => updateItem(item.id, 'centroCustoId', e.target.value)}
                          disabled={isViewMode}
                        >
                          <option value="">-</option>
                          {centrosCusto.map(cc => (
                            <option key={cc.id} value={cc.id}>{cc.nome}</option>
                          ))}
                        </select>
                        <List size={18} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">Quantidade</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          value={item.quantidade} 
                          onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value))}
                          required
                          disabled={isViewMode}
                          min="0.01"
                          step="any"
                          placeholder="0.00"
                        />
                        <Hash size={18} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">Unidade</label>
                      <div className="input-with-icon">
                        <select 
                          value={item.unidade} 
                          onChange={(e) => updateItem(item.id, 'unidade', e.target.value)}
                          required
                          disabled={true}
                          className="item-unit-readonly"
                        >
                          <option value="">-</option>
                          {INITIAL_UNIDADES.map((un: UnidadeMedida) => (
                            <option key={un.id} value={un.sigla}>{un.sigla}</option>
                          ))}
                        </select>
                        <Activity size={18} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">Preço</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          value={item.preco} 
                          onChange={(e) => updateItem(item.id, 'preco', parseFloat(e.target.value))}
                          required
                          disabled={isViewMode}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                        <DollarSign size={18} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-subtotal-display">
                      <label className="item-field-label">Subtotal</label>
                      <div className="item-subtotal-value">
                        R$ {(item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {!isViewMode && (
                      <button 
                        type="button" 
                        className="action-btn-global btn-delete" 
                        onClick={() => removeItemRow(item.id)}
                        title="Remover item"
                      >
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

