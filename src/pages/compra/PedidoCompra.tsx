import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { 
  ShoppingBag, 
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
  Truck, 
  Calendar,
  DollarSign,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
  User,
  CreditCard,
  FileText,
  Hash,
  Building2,
  List
} from 'lucide-react';
import './PedidoCompra.css';
import { useCompany } from '../../contexts/CompanyContext';
import { INITIAL_CATEGORIES } from '../../data/initialData';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { PurchaseOrder, PurchaseItem, Supplier, Insumo, Company } from '../../types';



export const PedidoCompraPage = () => {
  const { activeCompanyId } = useCompany();
  const allOrders = useLiveQuery(() => db.pedidos_compra.toArray()) || [];
  const suppliersList = useLiveQuery(() => db.fornecedores.toArray()) || [];
  const inventoryList = useLiveQuery(() => db.insumos.toArray()) || [];
  const empresasList = useLiveQuery(() => db.empresas.toArray()) || [];

  // Filter by active company
  const orders = allOrders.filter(o => activeCompanyId === 'Todas' || o.empresaId === activeCompanyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterFornecedor, setFilterFornecedor] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PurchaseOrder | null>(null);
  
  // Default empresaId from context
  useEffect(() => {
    if (activeCompanyId !== 'Todas') {
      setEmpresaId(activeCompanyId);
    }
  }, [activeCompanyId]);
  
  // Form State
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [fornecedorId, setFornecedorId] = useState('');
  const [mapaReferencia, setMapaReferencia] = useState('');
  const [previsaoEntrega, setPrevisaoEntrega] = useState('');
  const [condicaoPagamento, setCondicaoPagamento] = useState('');
  const [numero, setNumero] = useState('');
  const [data, setData] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    fornecedorNome: '',
    previsaoEntrega: '',
    valorTotal: '',
    status: 'Todos'
  });

  const filteredData = orders.filter(p => {
    const matchesSearch = 
      p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.valorTotal.toString().includes(searchTerm) ||
      (p.mapaReferencia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itens.some(it => it.insumoNome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
    const matchesFornecedor = filterFornecedor === 'Todos' || p.fornecedor_id === filterFornecedor;
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || p.numero.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.fornecedorNome === '' || (suppliersList.find(s => s.id === p.fornecedor_id)?.nome || '').toLowerCase().includes(columnFilters.fornecedorNome.toLowerCase())) &&
      (columnFilters.previsaoEntrega === '' || (p as any).previsaoEntrega?.includes(columnFilters.previsaoEntrega)) &&
      (columnFilters.valorTotal === '' || p.valorTotal.toString().includes(columnFilters.valorTotal)) &&
      (columnFilters.status === 'Todos' || p.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesFornecedor && matchesColumnFilters;
  });

  const uniqueSuppliers = Array.from(new Set(orders.map(o => {
    const s = suppliersList.find(sup => sup.id === o.fornecedor_id);
    return { id: o.fornecedor_id, nome: s?.nome || 'Fornecedor não encontrado' };
  })));

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

  const centrosCusto: any[] = []; // Temporary placeholder, need to check INITIAL_CATEGORIES origin

  const location = useLocation();
  const navigate = useNavigate();

  useEscapeKey(() => setIsModalOpen(false));

  const handleOpenModal = (pedido: PurchaseOrder | null = null, view: boolean = false) => {
    if (pedido) {
      setSelectedPedido(pedido);
      setItems(pedido.itens as any); // Cast for compatibility
      setFornecedorId(pedido.fornecedor_id);
      setMapaReferencia(pedido.mapaReferencia || '');
      setPrevisaoEntrega(pedido.previsaoEntrega);
      setCondicaoPagamento(pedido.condicaoPagamento);
      setNumero(pedido.numero);
      setData(pedido.data);
      setEmpresaId(pedido.empresaId);
      setIsViewMode(view);
    } else {
      setSelectedPedido(null);
      setItems([]);
      setFornecedorId('');
      setMapaReferencia('');
      setPrevisaoEntrega('');
      setCondicaoPagamento('');
      setNumero(`PC-2024-${String(orders.length + 1).padStart(3, '0')}`);
      setData(new Date().toISOString().split('T')[0]);
      setEmpresaId('M1');
      setIsViewMode(false);
      addItemRow();
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.generatedOrders) {
      const gOrders = location.state.generatedOrders;
      if (gOrders.length > 0) {
        const firstOrder = gOrders[0];
        
        // Populate form
        setItems(firstOrder.itens);
        setFornecedorId(firstOrder.fornecedorId);
        setMapaReferencia(firstOrder.mapaReferencia);
        setEmpresaId(firstOrder.empresaId);
        
        // Defaults
        setNumero(`PC-2024-${String(orders.length + 1).padStart(3, '0')}`);
        setData(new Date().toISOString().split('T')[0]);
        setPrevisaoEntrega(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
        setCondicaoPagamento('À Vista');
        
        setIsViewMode(false);
        setIsModalOpen(true);
        
        // Clear state to avoid reopening on reload
        window.history.replaceState({}, document.title);

        if (gOrders.length > 1) {
          alert(`${gOrders.length} pedidos foram gerados no mapa. O primeiro (de ${firstOrder.fornecedorNome}) foi carregado. Finalize este para ver os próximos.`);
        }
      }
    }
  }, [location.state, orders.length]);

  const addItemRow = () => {
    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      insumo_id: '',
      insumoNome: '',
      quantidade: 0,
      unidade: '-',
      valorUnitario: 0,
      desconto: 0,
      subtotal: 0,
      categoria: 'Insumos'
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'insumoNome') {
          const insumo = inventoryList.find(i => i.id === value);
          if (insumo) {
            updatedItem.insumoNome = insumo.nome;
            updatedItem.unidade = insumo.unidade;
          }
        }
        const qty = field === 'quantidade' ? value : updatedItem.quantidade;
        const price = field === 'valorUnitario' ? value : updatedItem.valorUnitario;
        const discount = field === 'desconto' ? value : updatedItem.desconto;
        updatedItem.subtotal = (qty * price) - discount;
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItemRow = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = (itemList: PurchaseItem[] = items) => {
    return itemList.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedorId || items.length === 0) {
      alert('Selecione um fornecedor e adicione itens ao pedido.');
      return;
    }

    const supplier = suppliersList.find(s => s.id === fornecedorId);
    
    const newOrder: PurchaseOrder = {
      id: selectedPedido?.id || Math.random().toString(36).substr(2, 9),
      numero: numero,
      data: data,
      fornecedor_id: fornecedorId,
      fornecedorNome: supplier?.nomeFantasia || 'Fornecedor Desconhecido',
      mapaReferencia,
      previsaoEntrega,
      condicaoPagamento,
      valorTotal: calculateTotal(items),
      status: selectedPedido?.status || 'Pendente',
      itens: items,
      empresaId,
      tenant_id: 'default'
    };

    await dataService.saveItem('pedidos_compra', newOrder);
    setIsModalOpen(false);
  };

  const handleCancelStatus = async (id: string) => {
    if (window.confirm('Deseja realmente cancelar este pedido?')) {
      const order = orders.find(o => o.id === id);
      if (order) {
         await dataService.saveItem('pedidos_compra', { ...order, status: 'Cancelado' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este pedido?')) {
      await dataService.deleteItem('pedidos_compra', id);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'status-aprovado';
      case 'Pendente': return 'status-pendente';
      case 'Em Trânsito': return 'status-cotacao';
      case 'Entregue': return 'status-aprovado';
      case 'Cancelado': return 'status-recusado';
      default: return '';
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
          <div className="icon-badge secondary">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h1>Pedidos de Compra</h1>
            <p className="description">Gerencie e acompanhe as ordens de compra enviadas aos fornecedores.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Adicionar Pedido</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Pedidos Abertos</span>
            <span className="summary-value">08</span>
            <span className="summary-subtext" style={{ color: 'var(--warning)', fontWeight: 700 }}>Aguardando entrega</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Valor Confirmado</span>
            <span className="summary-value">R$ 45.200</span>
            <span className="summary-subtext">Comprometido no mês</span>
          </div>
          <div className="summary-icon indigo">
            <DollarSign size={28} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Entregas Pendentes</span>
            <span className="summary-value">03</span>
            <span className="summary-subtext" style={{ color: 'var(--info)', fontWeight: 700 }}>Em trânsito</span>
          </div>
          <div className="summary-icon blue">
            <Truck size={28} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="summary-info">
            <span className="summary-label">Pedidos em Atraso</span>
            <span className="summary-value">01</span>
            <span className="summary-subtext" style={{ color: 'var(--danger)', fontWeight: 700 }}>Atenção necessária</span>
          </div>
          <div className="summary-icon red">
            <AlertCircle size={28} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Pesquisar por número ou fornecedor..."
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


        <table className="data-table">
          <thead>
            <tr>
              <th>Pedido / Emissão</th>
              <th>Fornecedor</th>
              <th>Previsão Entrega</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th className="text-center">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'fornecedorNome', type: 'text', placeholder: 'Fornecedor...' },
                  { key: 'previsaoEntrega', type: 'text', placeholder: 'Data...' },
                  { key: 'valorTotal', type: 'text', placeholder: 'Valor...' },
                  { key: 'status', type: 'select', options: ['Pendente', 'Confirmado', 'Em Trânsito', 'Entregue', 'Cancelado'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={true}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map((pedido: PurchaseOrder) => (
              <tr key={pedido.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <strong className="text-slate-900">{pedido.numero}</strong>
                    <span className="text-slate-400 text-sm font-medium">— {new Date(pedido.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Building2 size={16} strokeWidth={3} className="text-indigo-500" />
                    <span className="font-bold text-slate-700">
                      {suppliersList.find(s => s.id === pedido.fornecedor_id)?.nome || 'Fornecedor não encontrado'}
                    </span>
                  </div>
                </td>
                <td>{new Date(pedido.previsaoEntrega).toLocaleDateString()}</td>
                <td className="font-bold">R$ {pedido.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                  <span className={`status-badge ${pedido.status.toLowerCase().replace(' ', '-')}`}>
                    {pedido.status === 'Confirmado' && <CheckCircle2 size={14} strokeWidth={3} />}
                    {pedido.status === 'Pendente' && <Clock size={14} strokeWidth={3} />}
                    {pedido.status === 'Em Trânsito' && <Truck size={14} strokeWidth={3} />}
                    <span className="ml-1">{pedido.status}</span>
                  </span>
                </td>
                <td className="text-center">
                  <div className="actions-cell flex-center">
                    <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(pedido, true)}>
                      <Eye size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(pedido)}>
                      <Edit size={18} strokeWidth={3} />
                    </button>
                    <button 
                      className="action-btn-global btn-warning" 
                      title="Cancelar Pedido" 
                      onClick={() => handleCancelStatus(pedido.id)}
                      disabled={pedido.status === 'Cancelado' || pedido.status === 'Entregue'}
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(pedido.id)}>
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
          label="pedidos"
        />
      </div>

      {isModalOpen && (
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Pedido' : (selectedPedido ? 'Editar Pedido' : 'Novo Pedido de Compra')}
        subtitle="Preencha os dados da ordem de compra para o fornecedor."
        icon={ShoppingBag}
        size="xl"
        footer={
          <>
            <div className="total-box-horizontal animate-slide-up">
              <span className="total-label">Valor Total do Pedido:</span>
              <span className="total-value">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="footer-actions flex gap-3">
              <button type="button" className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              {!isViewMode && (
                <button type="submit" className="btn-premium-solid indigo" onClick={handleSave}>
                  <CheckCircle2 size={18} strokeWidth={3} />
                  <span>{selectedPedido ? 'Salvar Alterações' : 'Adicionar Pedido'}</span>
                </button>
              )}
            </div>
          </>
        }
      >
        <div className="form-sections-grid">
          <div className="form-section">
            <div className="section-title">
              <FileText size={16} strokeWidth={3} />
              Dados do Pedido
            </div>
            <div className="form-grid mt-4">
              <div className="form-group col-2">
                <label>Número</label>
                <div className="input-with-icon">
                  <input type="text" value={numero} readOnly disabled />
                  <Hash size={18} strokeWidth={3} className="field-icon" />
                </div>
              </div>
              <div className="form-group col-3">
                <label>Data de Emissão</label>
                <div className="input-with-icon">
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} required disabled={isViewMode} />
                  <Calendar size={18} strokeWidth={3} className="field-icon" />
                </div>
              </div>
                <div className="form-group col-4">
                <label>Empresa / Unidade</label>
                <div className="input-with-icon">
                  <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} required disabled={isViewMode}>
                    <option value="">Selecione a empresa...</option>
                    {empresasList.filter((c: Company) => c.status === 'Ativa').map((comp: Company) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.nomeFantasia} {!comp.isMatriz ? '(Filial)' : '(Matriz)'}
                      </option>
                    ))}
                  </select>
                  <Building2 size={18} strokeWidth={3} className="field-icon" />
                </div>
              </div>
              <div className="form-group col-3">
                <label>Ref. Cotação</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    value={mapaReferencia} 
                    onChange={(e) => setMapaReferencia(e.target.value)}
                    placeholder="Ex: MC-2024"
                    disabled={isViewMode}
                  />
                  <FileText size={18} strokeWidth={3} className="field-icon" />
                </div>
              </div>

              <div className="form-group col-6">
                <label>Fornecedor</label>
                <div className="input-with-icon">
                  <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} required disabled={isViewMode}>
                    <option value="">Selecione um fornecedor</option>
                    {suppliersList.map(s => (
                      <option key={s.id} value={s.id}>{s.nomeFantasia}</option>
                    ))}
                  </select>
                  <Truck size={18} strokeWidth={3} className="field-icon" />
                </div>
              </div>
              <div className="form-group col-3">
                <label>Prev. Entrega</label>
                <div className="input-with-icon">
                  <input type="date" value={previsaoEntrega} onChange={(e) => setPrevisaoEntrega(e.target.value)} required disabled={isViewMode} />
                  <Clock size={18} strokeWidth={3} className="field-icon" />
                </div>
              </div>
              <div className="form-group col-3">
                <label>Pagamento</label>
                <div className="input-with-icon">
                  <select value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value)} required disabled={isViewMode}>
                    <option value="">Selecione...</option>
                    <option value="À Vista">À Vista</option>
                    <option value="15 Dias">15 Dias</option>
                    <option value="30 Dias">30 Dias</option>
                    <option value="30/60 Dias">30/60 Dias</option>
                  </select>
                  <CreditCard size={18} strokeWidth={3} className="field-icon" />
                </div>
              </div>
              <div className="form-group col-12">
                <label>Status</label>
                <div style={{ marginTop: '4px' }}>
                  <span className={`status-indicator ${getStatusClass(selectedPedido ? selectedPedido.status : 'Pendente')}`} style={{ display: 'inline-flex' }}>
                    {selectedPedido ? selectedPedido.status : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header-row mb-4 flex justify-between items-center">
              <h3 className="section-title mb-0">
                <Package size={18} strokeWidth={3} />
                Itens do Pedido
              </h3>
              {!isViewMode && (
                <button type="button" className="btn-premium-solid btn-sm" onClick={addItemRow}>
                  <Plus size={16} strokeWidth={3} />
                  <span>Adicionar Item</span>
                </button>
              )}
            </div>

            <div className="items-cards-container">
              {items.length === 0 ? (
                <div className="empty-items-state">
                  <Package size={48} />
                  <p>Nenhum item adicionado ao pedido.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="item-row-card animate-slide-in">
                    <div className="item-field-group" style={{ gridColumn: 'span 2' }}>
                      <label className="item-field-label">Insumo / Serviço</label>
                      <div className="input-with-icon">
                        <select 
                          value={item.insumo_id} 
                          onChange={(e) => updateItem(item.id, 'insumo_id', e.target.value)}
                          required
                          disabled={isViewMode}
                        >
                          <option value="">Selecione o item...</option>
                          {inventoryList.map(ins => (
                            <option key={ins.id} value={ins.id}>{ins.nome}</option>
                          ))}
                        </select>
                        <Package size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">C. Custo</label>
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
                        <List size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">Qtd / Un</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          value={item.quantidade} 
                          onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value))}
                          required
                          disabled={isViewMode}
                          min="0.01"
                          step="any"
                        />
                        <Hash size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">Preço Unit.</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          value={item.valorUnitario} 
                          onChange={(e) => updateItem(item.id, 'valorUnitario', parseFloat(e.target.value))}
                          required
                          disabled={isViewMode}
                          min="0"
                          step="0.01"
                        />
                        <DollarSign size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-field-group">
                      <label className="item-field-label">Desc. (R$)</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          value={item.desconto} 
                          onChange={(e) => updateItem(item.id, 'desconto', parseFloat(e.target.value))}
                          disabled={isViewMode}
                          min="0"
                          step="0.01"
                        />
                        <TrendingUp size={18} strokeWidth={3} className="field-icon" />
                      </div>
                    </div>

                    <div className="item-subtotal-display">
                      <label className="item-field-label">Subtotal</label>
                      <div className="item-subtotal-value">
                        R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
      )}
    </div>
  );
};

