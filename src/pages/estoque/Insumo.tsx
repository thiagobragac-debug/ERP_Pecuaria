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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import './Insumo.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { INITIAL_CATEGORIES, INITIAL_UNIDADES } from '../../data/initialData';
import { Categoria, Subcategoria, UnidadeMedida } from '../../types/definitions';

import { MOCK_INSUMOS } from '../../data/inventoryData';
import { Insumo as InsumoType } from '../../types/inventory';

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
  const [activeTab, setActiveTab] = useState<'geral' | 'saldos' | 'tecnico' | 'logistica' | 'historico'>('geral');

  const handleOpenModal = (insumo: InsumoType | null = null, viewOnly = false) => {
    setSelectedInsumo(insumo);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInsumo(null);
    setIsViewMode(false);
  };

  const totalEmEstoque = MOCK_INSUMOS.reduce((acc, item) => acc + (item.estoqueAtual * item.valorUnitario), 0);
  const itensCriticos = MOCK_INSUMOS.filter(item => item.status === 'Crítico').length;

  const filteredData = MOCK_INSUMOS.filter(item => {
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
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <Package size={32} />
          </div>
          <div>
            <h1>Almoxarifado & Insumos</h1>
            <p className="description">Inteligência de materiais, medicamentos e controle de estoque de segurança.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2">
            <FileText size={18} strokeWidth={3} />
            <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Insumo</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Imobilizado em Estoque</span>
            <span className="summary-value">R$ {totalEmEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="summary-subtext desc">Base: Custo Médio</span>
          </div>
          <div className="summary-icon blue">
            <DollarSign size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Reposição Crítica</span>
            <span className="summary-value text-danger">{itensCriticos.toString().padStart(2, '0')} <small>itens</small></span>
            <span className="summary-subtext desc">Abaixo do estoque mín.</span>
          </div>
          <div className="summary-icon red">
            <AlertTriangle size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Volume de Insumos</span>
            <span className="summary-value">{MOCK_INSUMOS.length}</span>
            <span className="summary-subtext desc">Mix de produtos ativo</span>
          </div>
          <div className="summary-icon indigo">
            <Boxes size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Giro Operacional</span>
            <span className="summary-value">12.5%</span>
            <span className="summary-subtext desc">Vs. mês anterior</span>
          </div>
          <div className="summary-icon orange">
            <Activity size={28} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="insumo-container">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome ou categoria..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
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
                    { key: 'categoria', type: 'select', options: [...new Set(MOCK_INSUMOS.map(i => i.categoria))] },
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
                <tr key={insumo.id}>
                  <td className="font-bold">{insumo.nome}</td>
                  <td>
                    <span className="category-tag">
                      <Tag size={12} /> {insumo.categoria}
                    </span>
                  </td>
                  <td>{insumo.estoqueAtual} {insumo.unidade}</td>
                  <td className="text-muted">{insumo.estoqueMinimo} {insumo.unidade}</td>
                  <td>R$ {insumo.valorUnitario.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge stock-${insumo.status.toLowerCase()}`}>
                      {insumo.status}
                    </span>
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

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes do Insumo' : (selectedInsumo ? 'Editar Insumo' : 'Novo Insumo')}
        subtitle="Organize seu almoxarifado com precisão e controle."
        icon={Package}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button className="btn-premium-outline px-6" onClick={handleCloseModal}>Fechar</button>
            {!isViewMode && <button className="btn-premium-solid indigo px-6" onClick={handleCloseModal}>Salvar Insumo</button>}
          </div>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'saldos' ? 'active' : ''}`} onClick={() => setActiveTab('saldos')}>Saldos / Local</button>
          <button className={`tab-btn ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')}>Movimentação</button>
          <button className={`tab-btn ${activeTab === 'tecnico' ? 'active' : ''}`} onClick={() => setActiveTab('tecnico')}>Teórico</button>
          <button className={`tab-btn ${activeTab === 'logistica' ? 'active' : ''}`} onClick={() => setActiveTab('logistica')}>Logística</button>
        </div>
        
        <div className="form-sections-grid">
          {activeTab === 'geral' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-12">
                  <label>Nome do Produto/Insumo</label>
                  <div className="input-with-icon">
                    <input type="text" defaultValue={selectedInsumo?.nome} disabled={isViewMode} required placeholder="Ex: Sal Mineral 80" />
                    <Package size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-5">
                  <label>Categoria</label>
                  <div className="input-with-icon">
                    <select defaultValue={selectedInsumo?.categoria} disabled={isViewMode}>
                      <option value="">Selecione uma categoria...</option>
                      {insumoCategories.map((cat: Subcategoria) => (
                        <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                      ))}
                    </select>
                    <Tag size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-3">
                  <label>Unidade</label>
                  <div className="input-with-icon">
                    <select defaultValue={selectedInsumo?.unidade} disabled={isViewMode}>
                      <option value="">Unidade...</option>
                      {INITIAL_UNIDADES.map((un: UnidadeMedida) => (
                        <option key={un.id} value={un.sigla}>{un.sigla} - {un.nome}</option>
                      ))}
                    </select>
                    <Layers size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-4">
                  <label>Custo Unitário</label>
                  <div className="input-with-icon">
                    <input type="number" step="0.01" defaultValue={selectedInsumo?.valorUnitario} disabled={isViewMode} required />
                    <DollarSign size={18} className="field-icon" />
                  </div>
                </div>
                
                <div className="form-group col-12 mt-4">
                  <div className="flags-container">
                    <label className={`checkbox-label ${(selectedInsumo && selectedInsumo.estoqueAtual > 0) ? 'locked' : ''}`}>
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedInsumo ? selectedInsumo.controlaEstoque : true} 
                        disabled={isViewMode || !!(selectedInsumo && selectedInsumo.estoqueAtual > 0)} 
                      />
                      <span>Controla Estoque</span>
                      <small>Habilita o controle de saldo e custo médio.</small>
                      {(selectedInsumo && selectedInsumo.estoqueAtual > 0) && (
                        <span className="lock-warning">
                          <ShieldCheck size={12} /> Bloqueado: Item possui lançamentos de estoque.
                        </span>
                      )}
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedInsumo ? selectedInsumo.paraVenda : false} 
                        disabled={isViewMode} 
                      />
                      <span>Disponível para Venda</span>
                      <small>Permite selecionar este item em pedidos de venda.</small>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        defaultChecked={selectedInsumo ? selectedInsumo.paraCompra : true} 
                        disabled={isViewMode} 
                      />
                      <span>Disponível para Compra</span>
                      <small>Permite selecionar este item em pedidos de compra.</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'saldos' && (
            <div className="form-section">
              <div className="location-stock-view fade-in">
                <div className="alert-info-light mb-4 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 70, 229, 0.05)', color: 'var(--primary-indigo)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                  <Info size={18} />
                  <span>Custo Médio Ponderado atualizado em tempo real por localidade.</span>
                </div>
                
                <div className="location-table-wrapper">
                  <table className="location-table w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Local / Almoxarifado</th>
                        <th className="text-left">Saldo</th>
                        <th className="text-left">Custo Médio</th>
                        <th className="text-left">Patrimônio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInsumo && selectedInsumo.estoquePorLocal && Object.keys(selectedInsumo.estoquePorLocal).map(local => (
                        <tr key={local}>
                          <td className="font-bold">
                            <div className="location-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Warehouse size={16} />
                              {local}
                            </div>
                          </td>
                          <td>{selectedInsumo.estoquePorLocal[local]} {selectedInsumo.unidade}</td>
                          <td>R$ {selectedInsumo.custoMedioPorLocal[local]?.toFixed(2)}</td>
                          <td className="font-bold text-indigo">
                            R$ {((selectedInsumo.estoquePorLocal[local] || 0) * (selectedInsumo.custoMedioPorLocal[local] || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="form-section fade-in">
              <div className="movement-history">
                <table className="history-table w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Data</th>
                      <th className="text-left">Tipo</th>
                      <th className="text-left">Qtd</th>
                      <th className="text-left">Origem/Destino</th>
                      <th className="text-left">Almox.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="history-row border-b border-white/5">
                      <td>12/03/26</td>
                      <td><span className="status-badge status-ativo">ENTRADA</span></td>
                      <td className="text-emerald font-bold">+500</td>
                      <td>NF #9822 - Nutribase</td>
                      <td>Central</td>
                    </tr>
                    <tr className="history-row border-b border-white/5">
                      <td>14/03/26</td>
                      <td><span className="status-badge status-critico">SAÍDA</span></td>
                      <td className="text-red font-bold">-120</td>
                      <td>Dieta Lote 04</td>
                      <td>Sede</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tecnico' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-12">
                  <label>Composição / Princípio Ativo</label>
                  <textarea placeholder="Descreva a composição técnica..." disabled={isViewMode}></textarea>
                </div>
                <div className="form-group col-6">
                  <label>Período de Carência (Dias)</label>
                  <div className="input-with-icon">
                    <input type="number" placeholder="Ex: 30" disabled={isViewMode} />
                    <Clock size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Temperatura de Armazenamento</label>
                  <div className="input-with-icon">
                    <ThermometerSnowflake size={18} className="field-icon" />
                    <input type="text" placeholder="Ex: 2°C a 8°C" disabled={isViewMode} />
                  </div>
                </div>
                <div className="form-group col-12">
                  <div className="info-box primary">
                    <p><ShieldCheck size={16} /> <strong>Segurança Alimentar:</strong> Itens com carência ativada geram alertas automáticos em lotes destinados ao abate.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logistica' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-6">
                  <label>Estoque Atual</label>
                  <div className="input-with-icon">
                    <input type="number" defaultValue={selectedInsumo?.estoqueAtual} disabled={isViewMode} />
                    <Boxes size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Estoque Mínimo (Segurança)</label>
                  <div className="input-with-icon">
                    <input type="number" defaultValue={selectedInsumo?.estoqueMinimo} disabled={isViewMode} />
                    <AlertTriangle size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-12">
                  <label>Fornecedor Preferencial</label>
                  <div className="input-with-icon">
                    <Truck size={18} className="field-icon" />
                    <input type="text" placeholder="Nome do fornecedor ou fabricante..." disabled={isViewMode} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </StandardModal>
    </div>
  );
};

