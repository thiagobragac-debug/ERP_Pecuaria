import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Users, 
  TrendingUp,
  Beef,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Trash2,
  FileText,
  Calculator,
  Package,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  Eye,
  Edit
} from 'lucide-react';
import { ModernModal } from '../../../components/ModernModal';
import { TablePagination } from '../../../components/TablePagination';
import { TableFilters } from '../../../components/TableFilters';
import { usePagination } from '../../../hooks/usePagination';
import { ColumnFilters } from '../../../components/ColumnFilters';
import { db } from '../../../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCompany } from '../../../contexts/CompanyContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOfflineQuery, useOfflineMutation } from '../../../hooks/useOfflineSync';
import { SummaryCard } from '../../../components/SummaryCard';
import { StatusBadge } from '../../../components/StatusBadge';
import { SalesInvoice, SalesItem, Cliente, Animal, Company } from '../../../types';
import { SaleHeader } from './components/SaleHeader';
import { SaleItems } from './components/SaleItems';
import { SaleFooter } from './components/SaleFooter';

export const PedidosVenda: React.FC = () => {
  const { activeCompanyId } = useCompany();
  const { currentOrg } = useAuth();
  const { data: allSales = [] } = useOfflineQuery<SalesInvoice>(['pedidos_venda'], 'pedidos_venda');
  const sales = (allSales || []).filter(s => activeCompanyId === 'Todas' || (s as any).empresaId === activeCompanyId);
  const { data: clientesList = [] } = useOfflineQuery<Cliente>(['clientes'], 'clientes');
  const { data: allAnimais = [] } = useOfflineQuery<Animal>(['animais'], 'animais');
  const animaisList = (allAnimais || []).filter(a => (activeCompanyId === 'Todas' || a.empresaId === activeCompanyId) && a.status === 'Ativo');
  const { data: empresasList = [] } = useOfflineQuery<Company>(['empresas'], 'empresas');

  const saveOrderMutation = useOfflineMutation<SalesInvoice>('pedidos_venda', [['pedidos_venda']]);
  const saveAnimalMutation = useOfflineMutation<Animal>('animais', [['animais']]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SalesInvoice>>({
    numero: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    cliente_id: '',
    status: 'Pendente',
    empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : '',
    itens: []
  });

  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesInvoice | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    cliente: '',
    qtdPeso: '',
    valorTotal: '',
    status: 'Todos'
  });

  const calculateTotal = (itemList?: any[]) => {
    const list = itemList || formData.itens || [];
    return list.reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0);
  };

  const filteredData = sales.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const client = clientesList.find(c => c.id === order.cliente_id);
    const clientName = client?.nome.toLowerCase() || '';

    const matchesSearch = clientName.includes(searchLower) || 
                         (order.numero || '').toLowerCase().includes(searchLower) ||
                         (order.status || '').toLowerCase().includes(searchLower);
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || (order.numero || '').toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.cliente === '' || clientName.includes(columnFilters.cliente.toLowerCase())) &&
      (columnFilters.status === 'Todos' || order.status === columnFilters.status);

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

  const handleOpenModal = (order: SalesInvoice | null = null, view = false) => {
    if (order) {
      setSelectedOrder(order);
      setFormData({ ...order });
      setIsViewMode(view);
    } else {
      setSelectedOrder(null);
      setFormData({
        numero: `PV-${new Date().getFullYear()}-${(sales.length + 1).toString().padStart(3, '0')}`,
        dataEmissao: new Date().toISOString().split('T')[0],
        cliente_id: '',
        status: 'Pendente',
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : '',
        itens: []
      });
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveOrder = async () => {
    if (!formData.cliente_id || (formData.itens?.length || 0) === 0) {
      alert('Selecione um cliente e adicione pelo menos um animal.');
      return;
    }

    const order: SalesInvoice = {
      ...formData,
      id: selectedOrder?.id || Math.random().toString(36).substr(2, 9),
      valorTotal: calculateTotal(formData.itens),
      status: (formData.status as any) || 'Pendente',
      tenant_id: currentOrg?.id || 'default'
    } as SalesInvoice;

    if (['Confirmado', 'Faturado'].includes(order.status)) {
      for (const item of (order.itens as SalesItem[])) {
        const animal = allAnimais.find(a => a.brinco === item.brinco);
        if (animal && animal.status === 'Ativo') {
          await saveAnimalMutation.mutateAsync({
            ...animal,
            status: 'Vendido',
            valorVenda: item.subtotal
          });
        }
      }
    }

    await saveOrderMutation.mutateAsync(order);
    setIsModalOpen(false);
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Deseja realmente excluir este pedido?')) {
      await db.pedidos_venda.delete(id);
    }
  };

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-premium-fade-up">
      {/* Floating Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-0 z-30 py-4 bg-slate-50/80 backdrop-blur-md -mx-10 px-10 border-b border-slate-200/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pedidos de Venda</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest text-shadow-sm">Comercialização & Faturamento</p>
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
            <Plus size={22} strokeWidth={3} />
            <span className="text-base">Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard 
          label="Faturamento Mês"
          value={`R$ ${sales
            .filter(s => new Date(s.dataEmissao || (s as any).data || '').getMonth() === new Date().getMonth())
            .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0)
            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="indigo"
          trend={{ value: '+18.2%', type: 'up', icon: TrendingUp }}
        />
        <SummaryCard 
          label="Pedidos Pendentes"
          value={sales.filter(s => s.status === 'Pendente').length.toString().padStart(2, '0')}
          icon={Clock}
          color="amber"
          subtext="Aguardando Liberação"
        />
        <SummaryCard 
          label="Volume Vendido"
          value={`${sales.reduce((acc, curr) => acc + (curr.qtdCabecas || 0), 0)} cab.`}
          icon={Beef}
          color="rose"
          subtext="Total Acumulado"
        />
        <SummaryCard 
          label="Ticket Médio /@"
          value="R$ 318,50"
          icon={Calculator}
          color="emerald"
          subtext="Base: Nelore (Arroba)"
        />
      </div>

      {/* Main List Section */}
      <div className="glass-premium rounded-[40px] overflow-hidden shadow-soft-xl border border-white/40">
        <div className="p-8 border-b border-slate-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por cliente ou número de pedido..."
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
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pedido / Data</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume / Peso</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor Total</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-sm">
              {paginatedData.length > 0 ? paginatedData.map((order) => (
                <tr key={order.id} className="group hover:bg-slate-50/50 transition-all duration-300 transform hover:scale-[1.002]">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-base mb-1">{order.numero}</span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(order.dataEmissao || (order as any).data || '').toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shadow-inner">
                        {clientesList.find(c => c.id === order.cliente_id)?.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700">{clientesList.find(c => c.id === order.cliente_id)?.nome || 'Cliente não encontrado'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 text-sm">{order.qtdCabecas || 0} cab.</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{order.pesoTotal || 0} kg total</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-indigo-600 text-lg tabular-nums tracking-tighter">
                      R$ {(order.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                        onClick={() => handleDeleteOrder(order.id)}
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
        title={isViewMode ? 'Visualizar Pedido' : selectedOrder ? 'Editar Pedido' : 'Novo Pedido de Venda'}
        subtitle="Gerenciamento de ordens de venda, romaneios e integração com abate."
        icon={TrendingUp}
        footer={
          <div className="flex justify-between items-center w-full">
             <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Total da Venda:</span>
              <span className="text-2xl font-black text-white tracking-tighter relative z-10 tabular-nums">
                R$ {calculateTotal(formData.itens).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  onClick={() => handleSaveOrder()}
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
          <SaleHeader 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode} 
            clients={clientesList as any} 
            companies={empresasList as any}
          />
          
          <SaleItems 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode} 
            animals={animaisList as any}
          />
          
          <SaleFooter 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode}
          />
        </div>
      </ModernModal>
    </div>
  );
};
