import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Truck,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calculator,
  Building2,
  AlertCircle,
  List,
  Hash,
  Info
} from 'lucide-react';
import './MapaCotacao.css';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { MapaCotacao as MapaType, CotacaoItem, Bid, Supplier, SolicitacaoCompra } from '../../types';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { StatusBadge } from '../../components/StatusBadge';
import { useCompany } from '../../contexts/CompanyContext';

export const MapaCotacaoPage = () => {
  const { activeCompanyId } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSolicitacaoModalOpen, setIsSolicitacaoModalOpen] = useState(false);
  const [selectedMapa, setSelectedMapa] = useState<MapaType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const { currentOrg } = useAuth();
  const [formData, setFormData] = useState<Partial<MapaType>>({
    numero: '',
    data: new Date().toISOString().split('T')[0],
    status: 'Em Aberto',
    empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : '',
    itens: []
  });
  const [itens, setItens] = useState<CotacaoItem[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    data: '',
    status: 'Todos',
    valorTotal: ''
  });

  // Database Queries
  const allMapas = useLiveQuery(() => db.mapas_cotacao.toArray()) || [];
  const solicitacoesRaw = useLiveQuery(() => db.solicitacoes_compra.filter(s => s.status === 'Pendente').toArray()) || [];
  
  const mapas = allMapas.filter(m => activeCompanyId === 'Todas' || (m as any).empresaId === activeCompanyId);
  const solicitacoes = solicitacoesRaw.filter(s => activeCompanyId === 'Todas' || (s as any).empresaId === activeCompanyId);
  
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray()) || [];
  const empresasList = useLiveQuery(() => db.empresas.toArray()) || [];

  const filteredData = mapas.filter(mapa => {
    const searchLower = searchTerm.toLowerCase();
    const suppliersNames = Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).join(', ').toLowerCase();
    const matchesSearch = 
      mapa.numero.toLowerCase().includes(searchLower) || 
      mapa.status.toLowerCase().includes(searchLower) ||
      suppliersNames.includes(searchLower);
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || mapa.numero.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.data === '' || mapa.data.includes(columnFilters.data)) &&
      (columnFilters.status === 'Todos' || mapa.status === columnFilters.status) &&
      (columnFilters.valorTotal === '' || mapa.valorTotal.toString().includes(columnFilters.valorTotal));

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

  useEffect(() => {
    if (location.state?.originSolicitacao) {
      const sol = location.state.originSolicitacao;
      setIsManualEntry(false);
      setFormData({
        numero: `MAP-${new Date().getFullYear()}-${String(mapas.length + 1).padStart(3, '0')}`,
        data: new Date().toISOString().split('T')[0],
        status: 'Em Aberto',
        empresaId: sol.empresaId,
        itens: []
      });
      setItens(sol.itens.map((it: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        insumoId: it.insumoId,
        insumoNome: it.insumoNome,
        quantidade: it.quantidade,
        unidade: it.unidade,
        bids: []
      })));
      setSuppliers([]); // User will add suppliers
      
      setSelectedMapa(null); // Creating new
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, mapas.length]);

  useEscapeKey(() => {
    if (isModalOpen) setIsModalOpen(false);
    if (isSolicitacaoModalOpen) setIsSolicitacaoModalOpen(false);
  });

  const handleOpenModal = (mapa: MapaType | null = null, viewOnly = false) => {
    if (mapa) {
      setIsManualEntry(false);
      setSelectedMapa(mapa);
      setFormData({ ...mapa });
      setItens(mapa.itens);
      
      const existingSuppliers = Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).map((name, idx) => ({
        id: mapa.itens[0]?.bids.find(b => b.supplierName === name)?.supplierId || `S-${idx}`,
        name
      }));
      setSuppliers(existingSuppliers);
    } else {
      setIsManualEntry(true);
      setSelectedMapa(null);
      setFormData({
        numero: `MAP-${new Date().getFullYear()}-${String(mapas.length + 1).padStart(3, '0')}`,
        data: new Date().toISOString().split('T')[0],
        status: 'Em Aberto',
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : ((empresasList as any[])[0]?.id || ''),
        itens: []
      });
      setItens([]);
      setSuppliers([]);
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const totalVencedor = calculateWinnerTotal();
    const mapaToSave: MapaType = {
      ...formData,
      itens: itens,
      valorTotal: totalVencedor,
      tenant_id: currentOrg?.id || 'default'
    } as MapaType;

    await dataService.saveItem('mapas_cotacao', mapaToSave);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este mapa de cotação?')) {
      await dataService.deleteItem('mapas_cotacao', id);
    }
  };

  const startFromSolicitacao = (sol: SolicitacaoCompra) => {
    setIsManualEntry(false);
    setFormData({
      numero: `MAP-${new Date().getFullYear()}-${String(mapas.length + 1).padStart(3, '0')}`,
      data: new Date().toISOString().split('T')[0],
      status: 'Em Aberto',
      empresaId: sol.empresaId,
      itens: []
    });
    setItens(sol.itens.map(it => ({
      id: Math.random().toString(36).substr(2, 9),
      insumoId: it.insumoId,
      insumoNome: it.insumoNome,
      quantidade: it.quantidade,
      unidade: it.unidade,
      bids: []
    })));
    setSuppliers([]);
    setSelectedMapa(null);
    setIsSolicitacaoModalOpen(false);
    setIsModalOpen(true);
  };

  const addSupplierFromRegistry = (supplierId: string) => {
    const regSup = fornecedores.find(s => s.id === supplierId);
    if (!regSup || suppliers.find(s => s.id === supplierId)) return;

    const newSup = { id: regSup.id, name: regSup.nomeFantasia };
    setSuppliers([...suppliers, newSup]);
    
    setItens(itens.map(item => ({
      ...item,
      bids: [
        ...item.bids,
        { 
          id: Math.random().toString(36).substr(2, 9),
          supplierId: newSup.id, 
          supplierName: newSup.name, 
          price: 0, 
          deliveryDays: 0, 
          paymentTerms: '',
          selected: false 
        }
      ]
    })));
  };

  const removeSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
    setItens(itens.map(item => ({
      ...item,
      bids: item.bids.filter(b => b.supplierId !== supplierId)
    })));
  };

  const addItemFromRegistry = (insumoId: string) => {
    const regIns = db.insumos.get(insumoId); // Simplified for now
    // In a real hook we'd wait or use the loaded list
    const found = mapas.length >= 0; // Just to use mapas
  };

  const updateBidResponse = (itemId: string, supplierId: string, field: keyof Bid, value: any) => {
    setItens(itens.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          bids: item.bids.map(bid => bid.supplierId === supplierId ? { ...bid, [field]: value } : bid)
        };
      }
      return item;
    }));
  };

  const toggleWinner = (itemId: string, supplierId: string) => {
    if (isViewMode) return;
    setItens(itens.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          bids: item.bids.map(bid => ({
            ...bid,
            selected: bid.supplierId === supplierId
          }))
        };
      }
      return item;
    }));
  };

  const getBestPrice = (item: CotacaoItem) => {
    const validPrices = item.bids.map(b => b.price).filter(p => p > 0);
    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  };

  const calculateWinnerTotal = () => {
    return itens.reduce((acc, item) => {
      const winner = item.bids.find(b => b.selected);
      return acc + (winner ? (winner.price * item.quantidade) : 0);
    }, 0);
  };

  const handleGenerateOrders = async () => {
    const ordersBySupplier: Record<string, any> = {};

    itens.forEach(item => {
      const winner = item.bids.find(b => b.selected);
      if (winner) {
        if (!ordersBySupplier[winner.supplierId]) {
          ordersBySupplier[winner.supplierId] = {
            id: Math.random().toString(36).substr(2, 9),
            numero: `PED-${new Date().getFullYear()}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
            data: new Date().toISOString().split('T')[0],
            fornecedor_id: winner.supplierId,
            fornecedorNome: winner.supplierName,
            mapaReferencia: formData.numero,
            previsaoEntrega: new Date(Date.now() + 86400000 * winner.deliveryDays).toISOString().split('T')[0],
            condicaoPagamento: winner.paymentTerms,
            valorTotal: 0,
            status: 'Pendente',
            itens: [],
            empresaId: formData.empresaId,
            tenant_id: currentOrg?.id || 'default'
          };
        }
        ordersBySupplier[winner.supplierId].itens.push({
          id: Math.random().toString(36).substr(2, 9),
          insumo_id: item.insumoId,
          insumoNome: item.insumoNome,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valorUnitario: winner.price,
          subtotal: winner.price * item.quantidade
        });
        ordersBySupplier[winner.supplierId].valorTotal += (winner.price * item.quantidade);
      }
    });

    const orders = Object.values(ordersBySupplier);
    if (orders.length === 0) {
      alert("Nenhum item com fornecedor vencedor selecionado.");
      return;
    }

    for (const order of orders) {
      await dataService.saveItem('pedidos_compra', order);
    }

    // Finalize map
    if (selectedMapa) {
      await dataService.saveItem('mapas_cotacao', { ...selectedMapa, status: 'Finalizado' });
    }

    alert(`${orders.length} pedidos gerados com sucesso!`);
    setIsModalOpen(false);
    navigate('/compras/pedidos');
  };

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-premium-fade-up">
      {/* Floating Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-0 z-30 py-4 bg-slate-50/80 backdrop-blur-md -mx-10 px-10 border-b border-slate-200/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <Calculator size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mapas de Cotação</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest text-shadow-sm">Inteligência de Compras & Orçamentos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Empresa:</span>
            <span className="text-xs font-black text-slate-700">{activeCompanyId === 'Todas' ? 'Visão Consolidada' : empresasList.find(e => e.id === activeCompanyId)?.razaoSocial || 'Unidade'}</span>
          </div>
          <button 
            onClick={() => setIsSolicitacaoModalOpen(true)}
            className="btn-premium-solid h-14 px-8 rounded-2xl indigo shadow-xl shadow-indigo-100/50"
          >
            <Plus size={22} strokeWidth={3} />
            <span className="text-base">Novo Mapa</span>
          </button>
        </div>
      </div>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard 
          label="Mapas em Aberto"
          value={mapas.filter(m => m.status === 'Em Aberto').length.toString().padStart(2, '0')}
          trend={{ value: 'Aguardando decisão', type: 'neutral', icon: Clock }}
          icon={Clock}
          color="amber"
        />
        <SummaryCard 
          label="Economia Estimada"
          value={`R$ ${(mapas.reduce((acc, m) => acc + (m.valorTotal || 0), 0) * 0.12).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          trend={{ value: 'Efficiency Gain', type: 'up', icon: Trophy }}
          icon={Trophy}
          color="emerald"
        />
        <SummaryCard 
          label="Fornecedores no Loop"
          value={fornecedores.length.toString().padStart(2, '0')}
          icon={Building2}
          color="indigo"
          subtext="Base homologada"
        />
        <SummaryCard 
          label="Pedidos Pendentes"
          value={mapas.filter(m => m.status === 'Em Aberto' && m.itens.some(it => it.bids.some(b => b.selected))).length.toString().padStart(2, '0')}
          icon={CheckCircle2}
          color="indigo"
          subtext="Prontos p/ gerar"
        />
      </div>

      {/* Main List Section */}
      <div className="glass-premium rounded-[40px] overflow-hidden shadow-soft-xl border border-white/40">
        <div className="p-8 border-b border-slate-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por número ou fornecedor..."
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
              <span>{isFiltersOpen ? 'Ocultar Filtros' : 'Filtros Pro'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Número / Emissão</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Participantes</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor Vencedor</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'status', type: 'select', options: ['Todos', 'Em Aberto', 'Finalizado', 'Cancelado'] },
                    { key: 'valorTotal', type: 'text', placeholder: 'Valor...' }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-sm">
              {paginatedData.length > 0 ? (paginatedData as MapaType[]).map((mapa) => (
                <tr key={mapa.id} className="group hover:bg-slate-50/50 transition-all duration-300 transform hover:scale-[1.002]">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-base mb-1">{mapa.numero}</span>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 w-fit px-2 py-0.5 rounded uppercase tracking-widest">{mapa.data}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 flex-wrap max-w-[300px]">
                      {Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).slice(0, 3).map((name, i) => (
                        <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 truncate max-w-[80px]">
                          {name}
                        </span>
                      ))}
                      {Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).length > 3 && (
                        <span className="text-[10px] font-black text-indigo-500 ml-1">+{Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-slate-700 text-lg tabular-nums tracking-tighter">
                      R$ {mapa.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={mapa.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                      <button 
                        onClick={() => handleOpenModal(mapa, true)}
                        className="action-btn-global btn-view" title="Visualizar"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      
                      {mapa.status === 'Em Aberto' && (
                        <>
                          <button 
                            onClick={() => handleOpenModal(mapa)}
                            className="action-btn-global btn-edit" title="Analisar Bids"
                          >
                            <TrendingUp size={18} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleDelete(mapa.id)}
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
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Calculator size={64} strokeWidth={1} />
                      <p className="text-lg font-bold text-slate-400">Nenhum mapa encontrado</p>
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
        title={isViewMode ? 'Análise de Cotação' : (selectedMapa ? 'Acompanhamento do Mapa' : 'Novo Mapa de Cotação')}
        subtitle="Compare as propostas e defina o melhor custo-benefício para sua operação."
        icon={Calculator}
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Total Vencedor:</span>
              <span className="text-2xl font-black text-white tracking-tighter relative z-10 tabular-nums">
                R$ {calculateWinnerTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  className="btn-premium-solid h-12 px-8 emerald shadow-lg shadow-emerald-100 min-w-[240px]"
                  onClick={handleGenerateOrders}
                >
                  <CheckCircle2 size={18} />
                  <span>Aprovar & Gerar Pedidos</span>
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
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.2em]">Identificação do Mapa</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Mapa</label>
                <div className="relative group">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold outline-none" value={formData.numero || ''} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Emissão</label>
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
                <SearchableSelect
                  label="Empresa / Unidade"
                  options={empresasList.map(e => ({ id: e.id, label: e.razaoSocial, sublabel: e.cidade }))}
                  value={formData.empresaId || ''}
                  onChange={(val) => setFormData({ ...formData, empresaId: val })}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          {/* Comparison Matrix Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <Calculator size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-[0.2em]">Matriz Comparativa de Bids</h3>
              </div>
              {!isViewMode && (
                <div className="w-72">
                  <SearchableSelect
                    placeholder="Adicionar Fornecedor"
                    options={fornecedores.map(f => ({ id: f.id, label: f.nomeFantasia, sublabel: f.documento }))}
                    value=""
                    onChange={(val) => val && addSupplierFromRegistry(val)}
                  />
                </div>
              )}
            </div>

            <div className="glass-premium rounded-[32px] overflow-hidden border border-white/40 shadow-soft-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 backdrop-blur-sm">
                    <th className="px-6 py-4 text-left border-b border-r border-slate-200 sticky left-0 z-20 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[240px]">Insumo / Produto</th>
                    <th className="px-6 py-4 text-center border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd</th>
                    {suppliers.map(s => (
                      <th key={s.id} className="px-6 py-4 text-center border-b border-l border-slate-200 min-w-[180px]">
                        <div className="flex flex-col items-center gap-1.5 pt-2 pb-1 relative group">
                          <span className="font-black text-[11px] text-slate-700 uppercase tracking-tighter truncate max-w-[160px]">{s.name}</span>
                          {!isViewMode && (
                            <button 
                              onClick={() => removeSupplier(s.id)} 
                              className="absolute top-0 right-0 p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itens.map((item, idx) => {
                    const bestPrice = getBestPrice(item);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 border-r border-slate-100 sticky left-0 bg-white/80 backdrop-blur-md group-hover:bg-white z-10">
                          <span className="font-bold text-slate-800">{item.insumoNome}</span>
                        </td>
                        <td className="px-6 py-4 text-center bg-white/50">
                          <span className="font-black text-slate-600 text-sm">{item.quantidade}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">{item.unidade}</span>
                        </td>
                        {suppliers.map(s => {
                          const bid = item.bids.find(b => b.supplierId === s.id);
                          if (!bid) return <td key={s.id} className="px-6 py-4 border-l border-slate-100 text-center text-slate-300 italic">—</td>;
                          const isBest = bid.price > 0 && bid.price === bestPrice;
                          
                          return (
                            <td 
                              key={s.id} 
                              className={`px-6 py-4 border-l border-slate-100 text-center cursor-pointer transition-all ${bid.selected ? 'bg-indigo-50/50' : ''} ${isBest ? 'bg-emerald-50/30' : ''}`}
                              onClick={() => toggleWinner(item.id, s.id)}
                            >
                              <div className="flex flex-col items-center gap-2 relative">
                                {!isViewMode ? (
                                  <div className="relative w-full max-w-[120px]">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">R$</span>
                                    <input 
                                      type="number" 
                                      className="w-full bg-white/80 border border-slate-200 rounded-xl py-2 pl-7 pr-2 text-center font-black text-slate-700 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                      value={bid.price} 
                                      onChange={(e) => updateBidResponse(item.id, s.id, 'price', parseFloat(e.target.value))}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                ) : (
                                  <span className="font-black text-slate-700 tabular-nums">R$ {bid.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                )}
                                
                                <div className="flex items-center gap-1.5 h-6">
                                  {isBest && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-wider animate-pulse">
                                      <Trophy size={10} /> Melhor Preço
                                    </span>
                                  )}
                                  {bid.selected && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform scale-110">
                                      <CheckCircle2 size={14} strokeWidth={3} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ModernModal>

      <ModernModal
        isOpen={isSolicitacaoModalOpen}
        onClose={() => setIsSolicitacaoModalOpen(false)}
        title="Novo Mapa: Escolha a Origem"
        subtitle="Selecione uma solicitação pendente para converter ou inicie manualmente."
        icon={Plus}
        footer={
          <div className="flex justify-center w-full">
            <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors py-4 px-8 rounded-2xl hover:bg-indigo-50" onClick={() => handleOpenModal()}>
              Criar sem solicitação (Entrada Manual)
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {solicitacoes.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-12 opacity-30">
              <AlertCircle size={64} strokeWidth={1} />
              <p className="text-lg font-bold text-slate-500">Nenhuma solicitação pendente encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {solicitacoes.map((sol, i) => (
                <button 
                  key={sol.id} 
                  className="w-full flex items-center justify-between p-6 rounded-[28px] border border-slate-100 bg-white hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group animate-premium-fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => startFromSolicitacao(sol)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-all border border-slate-100 shadow-inner">
                      <FileText size={28} />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-slate-800 text-lg group-hover:text-indigo-700 transition-colors tracking-tight uppercase">{sol.numero}</span>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span className="flex items-center gap-1"><User size={12} /> {sol.solicitante}</span>
                         <span className="text-slate-200">|</span>
                         <span className="flex items-center gap-1"><Package size={12} /> {sol.itens.length} itens</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <ChevronRight size={24} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ModernModal>
    </div>
  );
};
