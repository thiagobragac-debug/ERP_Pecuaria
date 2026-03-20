import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  List,
  Info
} from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { INITIAL_CATEGORIES } from '../../data/initialData';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { PurchaseOrder, PurchaseItem, Supplier, Insumo, Company } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderHeader } from './pedidos/components/OrderHeader';
import { OrderItems } from './pedidos/components/OrderItems';
import { OrderFooter } from './pedidos/components/OrderFooter';



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
      setFormData(prev => ({ ...prev, empresaId: activeCompanyId }));
    }
  }, [activeCompanyId]);
  
  const { currentOrg } = useAuth();
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    numero: '',
    data: new Date().toISOString().split('T')[0],
    fornecedor_id: '',
    status: 'Pendente',
    empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : '',
    itens: []
  });
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
      setFormData({ ...pedido });
      setIsViewMode(view);
    } else {
      setSelectedPedido(null);
      setFormData({
        numero: `PC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
        data: new Date().toISOString().split('T')[0],
        fornecedor_id: '',
        status: 'Pendente',
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : '',
        itens: [{
          id: Math.random().toString(36).substr(2, 9),
          insumo_id: '',
          insumoNome: '',
          quantidade: 0,
          unidade: '-',
          valorUnitario: 0,
          desconto: 0,
          subtotal: 0,
          categoria: 'Insumos'
        }]
      });
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.generatedOrders) {
      const gOrders = location.state.generatedOrders;
      if (gOrders.length > 0) {
        const firstOrder = gOrders[0];
        
        // Populate form
        setFormData({
          ...formData,
          fornecedor_id: firstOrder.fornecedorId,
          empresaId: firstOrder.empresaId,
          numero: `PC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
          data: new Date().toISOString().split('T')[0],
          mapaReferencia: firstOrder.mapaReferencia,
          itens: firstOrder.itens,
          previsaoEntrega: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          condicaoPagamento: 'À Vista'
        });
        
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

  const calculateTotal = (itemList?: PurchaseItem[]) => {
    const list = itemList || formData.itens || [];
    return list.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplier = suppliersList.find(s => s.id === formData.fornecedor_id);
    
    const newOrder: PurchaseOrder = {
      ...formData,
      fornecedorNome: supplier?.nomeFantasia || 'Fornecedor Desconhecido',
      valorTotal: calculateTotal(),
      tenant_id: currentOrg?.id || 'default'
    } as PurchaseOrder;

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
    <div className="p-10 max-w-[1600px] mx-auto animate-premium-fade-up">
      {/* Floating Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-0 z-30 py-4 bg-slate-50/80 backdrop-blur-md -mx-10 px-10 border-b border-slate-200/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <ShoppingBag size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pedidos de Compra</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest text-shadow-sm">Gestão de Suprimentos & Ordens</p>
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
            className="btn-premium-solid h-14 px-8 rounded-2xl indigo"
          >
            <PlusCircle size={22} strokeWidth={3} />
            <span className="text-base">Nova Ordem</span>
          </button>
        </div>
      </div>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard 
          label="Total este Mês"
          value={`R$ ${orders
            .filter(p => new Date(p.data).getMonth() === new Date().getMonth())
            .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0)
            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="indigo"
          trend={{ value: '+12.5%', type: 'up', icon: TrendingUp }}
        />
        <SummaryCard 
          label="Ordens Pendentes"
          value={orders.filter(p => p.status === 'Pendente').length.toString().padStart(2, '0')}
          icon={Clock}
          color="amber"
          subtext="Aguardando Aprovação"
        />
        <SummaryCard 
          label="Entregas para Hoje"
          value={orders.filter(p => p.previsaoEntrega === new Date().toISOString().split('T')[0]).length.toString().padStart(2, '0')}
          icon={Truck}
          color="sky"
          subtext="Logística Ativa"
        />
        <SummaryCard 
          label="Total Processado"
          value={orders.filter(p => p.status === 'Entregue').length.toString().padStart(2, '0')}
          icon={CheckCircle2}
          color="emerald"
          subtext="Mês de Março"
        />
      </div>

      {/* Main List Section */}
      <div className="glass-premium rounded-[40px] overflow-hidden shadow-soft-xl border border-white/40">
        <div className="p-8 border-b border-slate-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Pesquisar por número ou fornecedor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <TableFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Referência / Data</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Fornecedor</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Logística</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Investimento</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-sm">
              {paginatedData.length > 0 ? paginatedData.map((order) => (
                <tr key={order.id} className="group hover:bg-indigo-50/40 transition-all duration-300 transform hover:scale-[1.002]">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-base mb-1">#{order.numero}</span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(order.data).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shadow-inner">
                        {order.fornecedorNome?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700">{order.fornecedorNome}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {order.previsaoEntrega && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100/80 w-fit px-3 py-1.5 rounded-lg border border-slate-200/50">
                        <Truck size={14} className="text-indigo-400" />
                        <span>Prev: {new Date(order.previsaoEntrega).toLocaleDateString()}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-slate-900 text-lg tabular-nums tracking-tighter">
                      R$ {order.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={order.status || 'Pendente'} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                      <button 
                        onClick={() => handleOpenModal(order, true)}
                        className="action-btn-global btn-view" title="Visualizar"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(order)}
                        className="action-btn-global btn-edit" title="Editar"
                      >
                        <Edit size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="action-btn-global btn-delete" title="Excluir"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Package size={64} strokeWidth={1} />
                      <p className="text-lg font-bold text-slate-400">Nenhum pedido encontrado</p>
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
        title={isViewMode ? 'Detalhes do Pedido' : selectedPedido ? 'Editar Pedido' : 'Novo Pedido de Compra'}
        subtitle="Gerenciamento de ordens de fornecimento e cotações aprovadas."
        icon={ShoppingBag}
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Total da Ordem:</span>
              <span className="text-2xl font-black text-white tracking-tighter relative z-10 tabular-nums">
                R$ {(formData.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  className="btn-premium-solid h-12 px-8 indigo shadow-lg shadow-indigo-100"
                  onClick={(e) => handleSave(e as any)}
                >
                  <CheckCircle2 size={18} />
                  <span>Finalizar Pedido</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-12">
          <OrderHeader 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode} 
            suppliers={suppliersList as any}
            companies={empresasList as any}
          />
          
          <OrderItems 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode}
            inventory={inventoryList as any}
          />
          
          <OrderFooter 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode}
          />
        </div>
      </ModernModal>
    </div>
  );
};
