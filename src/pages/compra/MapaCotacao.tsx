import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Hash
} from 'lucide-react';
import './MapaCotacao.css';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { MapaCotacao as MapaType, CotacaoItem, Bid, Supplier, SolicitacaoCompra } from '../../types';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
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

  // Form State
  const [numero, setNumero] = useState('');
  const [data, setData] = useState('');
  const [empresaId, setEmpresaId] = useState('');
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
      const nextNum = `MAP-${new Date().getFullYear()}-${String(mapas.length + 1).padStart(3, '0')}`;
      setNumero(nextNum);
      setData(new Date().toISOString().split('T')[0]);
      setEmpresaId(sol.empresaId);
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
      setNumero(mapa.numero);
      setData(mapa.data);
      setEmpresaId(mapa.empresaId);
      setItens(mapa.itens);
      
      const existingSuppliers = Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).map((name, idx) => ({
        id: mapa.itens[0]?.bids.find(b => b.supplierName === name)?.supplierId || `S-${idx}`,
        name
      }));
      setSuppliers(existingSuppliers);
    } else {
      setIsManualEntry(true);
      setSelectedMapa(null);
      setNumero(`MAP-${new Date().getFullYear()}-${String(mapas.length + 1).padStart(3, '0')}`);
      setData(new Date().toISOString().split('T')[0]);
      setEmpresaId(activeCompanyId !== 'Todas' ? activeCompanyId : ((empresasList as any[])[0]?.id || ''));
      setItens([]);
      setSuppliers([]);
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const totalVencedor = calculateWinnerTotal();
    const mapaToSave: MapaType = {
      id: selectedMapa?.id || Math.random().toString(36).substr(2, 9),
      numero: numero,
      data: data,
      status: (selectedMapa?.status as any) || 'Em Aberto',
      empresaId: empresaId,
      itens: itens,
      valorTotal: totalVencedor,
      tenant_id: 'default'
    };

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
    setNumero(`MAP-${new Date().getFullYear()}-${String(mapas.length + 1).padStart(3, '0')}`);
    setData(new Date().toISOString().split('T')[0]);
    setEmpresaId(sol.empresaId);
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
            mapaReferencia: numero,
            previsaoEntrega: new Date(Date.now() + 86400000 * winner.deliveryDays).toISOString().split('T')[0],
            condicaoPagamento: winner.paymentTerms,
            valorTotal: 0,
            status: 'Pendente',
            itens: [],
            empresaId: empresaId,
            tenant_id: 'default'
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
    <div className="mapa-wrapper fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <Calculator size={32} />
          </div>
          <div>
            <h1>Mapas de Cotação</h1>
            <p className="description">Gestão de orçamentos e inteligência de compras.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo" onClick={() => setIsSolicitacaoModalOpen(true)}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Mapa</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Mapas Abertos</span>
            <span className="summary-value">{mapas.filter(m => m.status === 'Em Aberto').length}</span>
            <span className="summary-subtext">Aguardando decisão</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Economia Gerada</span>
            <span className="summary-value">R$ 15.240</span>
            <span className="summary-trend up">
              <TrendingUp size={14} /> +12% vs mês ant.
            </span>
          </div>
          <div className="summary-icon green">
            <Trophy size={24} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por número ou fornecedor..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Data</th>
                <th>Status</th>
                <th>Valor Total</th>
                <th className="text-right">Ações</th>
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
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((mapa) => (
                <tr key={mapa.id}>
                  <td className="font-bold text-slate-800">{mapa.numero}</td>
                  <td>{mapa.data}</td>
                  <td>
                    <span className={`status-badge map-${mapa.status.toLowerCase().replace(' ', '-')}`}>
                      {mapa.status}
                    </span>
                  </td>
                  <td className="font-bold text-emerald-600">R$ {mapa.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(mapa, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      {mapa.status === 'Em Aberto' && (
                        <>
                          <button className="action-btn-global btn-edit" title="Editar/Analisar" onClick={() => handleOpenModal(mapa)}>
                            <Edit size={18} strokeWidth={3} />
                          </button>
                          <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(mapa.id)}>
                            <Trash2 size={18} strokeWidth={3} />
                          </button>
                        </>
                      )}
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
          label="mapas"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Análise de Cotação' : (selectedMapa ? 'Acompanhamento do Mapa' : 'Novo Mapa de Cotação')}
        subtitle="Analise as melhores propostas e gere pedidos de compra automaticamente."
        icon={Calculator}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Fechar</button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={handleGenerateOrders}>
                <CheckCircle2 size={18} /> Aprovar e Gerar Pedidos
              </button>
            )}
          </div>
        }
      >
        <div className="modal-content-scrollable p-6">
          <div className="form-grid mb-8">
            <div className="form-group col-4">
              <label>Número</label>
              <input type="text" value={numero} readOnly className="bg-slate-50" />
            </div>
            <div className="form-group col-4">
              <label>Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} disabled={isViewMode} />
            </div>
             <div className="form-group col-4">
              <label>Empresa</label>
              <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} disabled={isViewMode}>
                <option value="">Selecione...</option>
                {(empresasList as any[]).filter((c: any) => c.status === 'Ativa').map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial} {!c.isMatriz ? '(Filial)' : '(Matriz)'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="comparison-table-wrapper overflow-x-auto">
            <table className="comparison-table w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left bg-slate-50 border sticky left-0 z-10">Insumo</th>
                  <th className="p-3 text-center bg-slate-50 border">Qtd</th>
                  {suppliers.map(s => (
                    <th key={s.id} className="p-3 text-center bg-slate-50 border relative">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-xs uppercase">{s.name}</span>
                        {!isViewMode && (
                          <button onClick={() => removeSupplier(s.id)} className="text-red-400 hover:text-red-600">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  {!isViewMode && (
                    <th className="p-3 text-center bg-slate-50 border">
                      <select 
                        className="text-xs p-1 border rounded"
                        onChange={(e) => {
                          if (e.target.value) addSupplierFromRegistry(e.target.value);
                          e.target.value = "";
                        }}
                      >
                        <option value="">+ Fornecedor</option>
                        {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nomeFantasia}</option>)}
                      </select>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {itens.map(item => {
                  const bestPrice = getBestPrice(item);
                  return (
                    <tr key={item.id}>
                      <td className="p-3 border sticky left-0 bg-white z-10 font-bold text-slate-700">{item.insumoNome}</td>
                      <td className="p-3 border text-center font-bold">{item.quantidade} <small className="text-slate-400">{item.unidade}</small></td>
                      {suppliers.map(s => {
                        const bid = item.bids.find(b => b.supplierId === s.id);
                        if (!bid) return <td key={s.id} className="p-3 border text-center text-slate-300 italic">—</td>;
                        const isBest = bid.price > 0 && bid.price === bestPrice;
                        
                        return (
                          <td 
                            key={s.id} 
                            className={`p-3 border text-center cursor-pointer transition-all ${bid.selected ? 'bg-indigo-50 border-indigo-200' : ''} ${isBest ? 'bg-emerald-50' : ''}`}
                            onClick={() => toggleWinner(item.id, s.id)}
                          >
                            <div className="flex flex-col items-center gap-1">
                              {!isViewMode ? (
                                <input 
                                  type="number" 
                                  value={bid.price} 
                                  onChange={(e) => updateBidResponse(item.id, s.id, 'price', parseFloat(e.target.value))}
                                  className="w-20 text-center font-bold text-sm border-0 bg-transparent focus:ring-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="font-bold">R$ {bid.price.toFixed(2)}</span>
                              )}
                              {isBest && <span className="text-[10px] font-bold text-emerald-600 uppercase">Melhor</span>}
                              {bid.selected && <Trophy size={14} className="text-indigo-500" />}
                            </div>
                          </td>
                        );
                      })}
                      {!isViewMode && <td className="p-3 border"></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </StandardModal>

      <StandardModal
        isOpen={isSolicitacaoModalOpen}
        onClose={() => setIsSolicitacaoModalOpen(false)}
        title="Novo Mapa: Selecionar Solicitação"
        subtitle="Selecione uma solicitação pendente para converter em mapa de cotação."
        icon={Plus}
        size="md"
      >
        <div className="p-6">
          {solicitacoes.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Nenhuma solicitação pendente encontrada.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {solicitacoes.map(sol => (
                <button 
                  key={sol.id} 
                  className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                  onClick={() => startFromSolicitacao(sol)}
                >
                  <div>
                    <span className="block font-bold text-slate-800">{sol.numero}</span>
                    <span className="text-sm text-slate-500">{sol.solicitante} — {sol.itens.length} itens</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              ))}
              <div className="mt-4 pt-4 border-t text-center">
                <button className="text-indigo-600 font-bold hover:underline" onClick={() => handleOpenModal()}>
                  Criar sem solicitação (Entrada Manual)
                </button>
              </div>
            </div>
          )}
        </div>
      </StandardModal>
    </div>
  );
};
