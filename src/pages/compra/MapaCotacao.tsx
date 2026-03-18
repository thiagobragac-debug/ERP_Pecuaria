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
import { Company } from '../../types/definitions';
import { MOCK_INSUMOS } from '../../data/inventoryData';
import { MOCK_SUPPLIERS } from '../../data/supplierData';
import { Supplier } from '../../types/supplier';
import { Insumo } from '../../types/inventory';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';

interface Bid {
  supplierId: string;
  supplierName: string;
  price: number;
  deliveryTime: string;
  isWinner: boolean;
}

interface ItemCotacao {
  id: string;
  insumoId: string;
  insumoNome: string;
  quantidade: number;
  unidade: string;
  bids: Bid[];
}

interface MapaCotacao {
  id: string;
  numero: string;
  data: string;
  status: 'Aberto' | 'Finalizado' | 'Cancelado';
  solicitacaoCompraId: string;
  solicitacaoNumero: string;
  itens: ItemCotacao[];
  valorTotalEstimado: number;
  empresaId: string;
}

const mockMapas: MapaCotacao[] = [
  {
    id: 'M1',
    numero: 'MC-2024-001',
    data: '2024-03-14',
    status: 'Aberto',
    solicitacaoCompraId: '1',
    solicitacaoNumero: 'SC-2024-001',
    empresaId: 'M1',
    valorTotalEstimado: 5500,
    itens: [
      {
        id: 'ci1',
        insumoId: 's7',
        insumoNome: 'Sal Mineral',
        quantidade: 200,
        unidade: 'kg',
        bids: [
          { supplierId: 'F1', supplierName: 'AgroQuímica', price: 3.40, deliveryTime: '5 dias', isWinner: true },
          { supplierId: 'F2', supplierName: 'Nutri Pantanal', price: 3.65, deliveryTime: '3 dias', isWinner: false }
        ]
      },
      {
        id: 'ci2',
        insumoId: 's8',
        insumoNome: 'Ração',
        quantidade: 2,
        unidade: 'ton',
        bids: [
          { supplierId: 'F1', supplierName: 'AgroQuímica', price: 2450, deliveryTime: '5 dias', isWinner: false },
          { supplierId: 'F2', supplierName: 'Nutri Pantanal', price: 2380, deliveryTime: '3 dias', isWinner: true }
        ]
      }
    ]
  }
];

export const MapaCotacaoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterEmpresa, setFilterEmpresa] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMapa, setSelectedMapa] = useState<MapaCotacao | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Form State
  const [numero, setNumero] = useState('');
  const [data, setData] = useState('');
  const [solicitacaoNumero, setSolicitacaoNumero] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [itens, setItens] = useState<ItemCotacao[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    solicitacaoNumero: '',
    data: '',
    fornecedores: '',
    status: 'Todos'
  });

  const filteredData = mockMapas.filter(mapa => {
    const searchLower = searchTerm.toLowerCase();
    const suppliers = Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).join(', ').toLowerCase();
    const matchesSearch = 
      mapa.numero.toLowerCase().includes(searchLower) || 
      mapa.solicitacaoNumero.toLowerCase().includes(searchLower) ||
      mapa.status.toLowerCase().includes(searchLower) ||
      suppliers.includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || mapa.status === filterStatus;
    const matchesEmpresa = filterEmpresa === 'Todos' || mapa.empresaId === filterEmpresa;
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || mapa.numero.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.solicitacaoNumero === '' || mapa.solicitacaoNumero.toLowerCase().includes(columnFilters.solicitacaoNumero.toLowerCase())) &&
      (columnFilters.data === '' || mapa.data.includes(columnFilters.data)) &&
      (columnFilters.fornecedores === '' || suppliers.includes(columnFilters.fornecedores.toLowerCase())) &&
      (columnFilters.status === 'Todos' || mapa.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesEmpresa && matchesColumnFilters;
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
      setNumero(`MC-2024-00${mockMapas.length + 1}`);
      setData(new Date().toISOString().split('T')[0]);
      setSolicitacaoNumero(sol.numero);
      setEmpresaId(sol.empresaId);
      setItens(sol.itens);
      
      const solSuppliers = Array.from(new Set(sol.itens.flatMap((it: any) => it.bids.map((b: any) => b.supplierName)))).map((name, idx) => ({
        id: `S-${idx}`,
        name: name as string
      }));
      setSuppliers(solSuppliers.length > 0 ? solSuppliers : [{ id: 'S1', name: 'Fornecedor A' }, { id: 'S2', name: 'Fornecedor B' }]);

      setSelectedMapa({
        id: 'new',
        numero: `MC-2024-00${mockMapas.length + 1}`,
        data: new Date().toISOString().split('T')[0],
        status: 'Aberto',
        solicitacaoCompraId: 'ext',
        solicitacaoNumero: sol.numero,
        valorTotalEstimado: sol.valorTotal,
        empresaId: sol.empresaId,
        itens: sol.itens
      });
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEscapeKey(() => {
    if (isModalOpen) setIsModalOpen(false);
  });

  const handleOpenModal = (mapa: MapaCotacao | null = null, viewOnly = false) => {
    if (mapa) {
      setIsManualEntry(false);
      setSelectedMapa(mapa);
      setNumero(mapa.numero);
      setData(mapa.data);
      setSolicitacaoNumero(mapa.solicitacaoNumero);
      setEmpresaId(mapa.empresaId);
      setItens(mapa.itens);
      
      const existingSuppliers = Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).map((name, idx) => ({
        id: mapa.itens[0]?.bids.find(b => b.supplierName === name)?.supplierId || `S-${idx}`,
        name
      }));
      setSuppliers(existingSuppliers.length > 0 ? existingSuppliers : []);
    } else {
      setIsManualEntry(true);
      setSelectedMapa(null);
      setNumero(`MC-2024-00${mockMapas.length + 1}`);
      setData(new Date().toISOString().split('T')[0]);
      setSolicitacaoNumero('ENTRADA MANUAL');
      setEmpresaId(INITIAL_COMPANIES[0]?.id || '');
      setItens([]);
      setSuppliers([]); // Start empty in manual mode, user adds via registry
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const addSupplierFromRegistry = (supplierId: string) => {
    const registrySupplier = MOCK_SUPPLIERS.find(s => s.id === supplierId);
    if (!registrySupplier || suppliers.find(s => s.id === supplierId)) return;

    const nextId = registrySupplier.id;
    const newName = registrySupplier.nomeFantasia;
    setSuppliers([...suppliers, { id: nextId, name: newName }]);
    
    setItens(itens.map(item => ({
      ...item,
      bids: [
        ...item.bids,
        { 
          supplierId: nextId, 
          supplierName: newName, 
          price: 0, 
          deliveryTime: registrySupplier.prazoEntregaMedio, 
          isWinner: false 
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

  const updateSupplierName = (id: string, name: string) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, name } : s));
    setItens(itens.map(item => ({
      ...item,
      bids: item.bids.map(b => b.supplierId === id ? { ...b, supplierName: name } : b)
    })));
  };

  const addItemFromRegistry = (insumoId: string) => {
    const registryInsumo = MOCK_INSUMOS.find(i => i.id === insumoId);
    if (!registryInsumo) return;

    const newItem: ItemCotacao = {
      id: `new-${Date.now()}`,
      insumoId: registryInsumo.id,
      insumoNome: registryInsumo.nome,
      quantidade: 1,
      unidade: registryInsumo.unidade,
      bids: suppliers.map(s => {
        const regSup = MOCK_SUPPLIERS.find(rs => rs.id === s.id);
        return {
          supplierId: s.id,
          supplierName: s.name,
          price: 0,
          deliveryTime: regSup?.prazoEntregaMedio || 'N/A',
          isWinner: false
        };
      })
    };
    setItens([...itens, newItem]);
  };

  const addItemRow = () => {
    const newItem: ItemCotacao = {
      id: `new-${Date.now()}`,
      insumoId: '',
      insumoNome: 'Novo Insumo',
      quantidade: 1,
      unidade: 'UN',
      bids: suppliers.map(s => ({
        supplierId: s.id,
        supplierName: s.name,
        price: 0,
        deliveryTime: 'N/A',
        isWinner: false
      }))
    };
    setItens([...itens, newItem]);
  };

  const removeItemRow = (itemId: string) => {
    setItens(itens.filter(i => i.id !== itemId));
  };

  const updateItemDetails = (id: string, field: string, value: any) => {
    setItens(itens.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const getBestPrice = (item: ItemCotacao) => {
    const validPrices = item.bids.map(b => b.price).filter(p => p > 0);
    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  };

  const updateBidPrice = (itemId: string, supplierId: string, price: number) => {
    setItens(itens.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          bids: item.bids.map(bid => bid.supplierId === supplierId ? { ...bid, price } : bid)
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
            isWinner: bid.supplierId === supplierId
          }))
        };
      }
      return item;
    }));
  };

  const calculateWinnerTotal = () => {
    return itens.reduce((acc, item) => {
      const winner = item.bids.find(b => b.isWinner);
      return acc + (winner ? (winner.price * item.quantidade) : 0);
    }, 0);
  };

  const calculateEconomy = () => {
    const totalEstimado = selectedMapa?.valorTotalEstimado || 0;
    const totalVencedor = calculateWinnerTotal();
    return totalEstimado > 0 ? totalEstimado - totalVencedor : 0;
  };

  const handleGenerateOrders = () => {
    // Group winners by supplier
    const ordersBySupplier: Record<string, any> = {};

    itens.forEach(item => {
      const winner = item.bids.find(b => b.isWinner);
      if (winner) {
        if (!ordersBySupplier[winner.supplierId]) {
          ordersBySupplier[winner.supplierId] = {
            fornecedorId: winner.supplierId,
            fornecedorNome: winner.supplierName,
            empresaId: empresaId,
            mapaReferencia: numero,
            itens: []
          };
        }
        ordersBySupplier[winner.supplierId].itens.push({
          id: `gi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          insumoId: item.insumoId,
          insumoNome: item.insumoNome,
          quantidade: item.quantidade,
          unidade: item.unidade,
          preco: winner.price,
          desconto: 0,
          subtotal: winner.price * item.quantidade
        });
      }
    });

    const itemsWithoutWinner = itens.filter(item => !item.bids.some(b => b.isWinner));
    
    if (itemsWithoutWinner.length > 0) {
      if (!confirm(`Existem ${itemsWithoutWinner.length} itens sem fornecedor vencedor selecionado. Deseja continuar apenas com os itens selecionados?`)) {
        return;
      }
    }

    const generatedOrders = Object.values(ordersBySupplier);
    
    if (generatedOrders.length === 0) {
      alert("Nenhum fornecedor vencedor selecionado. Clique nos preços para escolher os vencedores de cada item.");
      return;
    }

    navigate('/compras/pedidos', { 
      state: { 
        generatedOrders,
        originMap: numero 
      } 
    });
  };

  const suppliersInvolved = suppliers.map(s => s.name);

  return (
    <div className="mapa-wrapper fade-in">
      <div className="page-header-row">
        <button className="back-btn" onClick={() => window.history.back()}>
          <ChevronLeft size={20} />
          Voltar
        </button>
        <div className="title-section">
          <div className="icon-badge secondary">
            <FileText size={32} />
          </div>
          <div>
            <h1>Mapa de Cotação</h1>
            <p className="description">Analise e selecione as melhores propostas dos fornecedores.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Mapa</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Mapas Abertos</span>
            <span className="summary-value">04</span>
            <span className="summary-subtext text-orange-500 font-bold">Aguardando decisão</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Economia no Mês</span>
            <span className="summary-value">R$ 12.450</span>
            <span className="summary-trend up">
              <TrendingUp size={14} /> +15.5% vs mês ant.
            </span>
          </div>
          <div className="summary-icon green">
            <Trophy size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Fornecedores Cotados</span>
            <span className="summary-value">12</span>
            <span className="summary-subtext">Base de negociação</span>
          </div>
          <div className="summary-icon blue">
            <Truck size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="summary-info">
            <span className="summary-label">Ticket Médio Mapa</span>
            <span className="summary-value">R$ 8.900</span>
            <span className="summary-subtext">Volume por negociação</span>
          </div>
          <div className="summary-icon primary">
            <Calculator size={24} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por número, solicitação ou fornecedor..."
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
                <th>Solicitação Ref.</th>
                <th>Data</th>
                <th>Fornecedores</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'solicitacaoNumero', type: 'text', placeholder: 'Ref...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'fornecedores', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'status', type: 'select', options: ['Aberto', 'Finalizado', 'Cancelado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((mapa) => (
                <tr key={mapa.id}>
                  <td>
                    <div className="number-cell">
                      {(() => {
                        switch (mapa.status) {
                          case 'Aberto': return <FileText size={16} style={{ color: 'var(--primary)' }} />;
                          case 'Finalizado': return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
                          case 'Cancelado': return <X size={16} style={{ color: 'var(--danger)' }} />;
                          default: return <FileText size={16} style={{ color: 'var(--text-color-light)' }} />;
                        }
                      })()}
                      <span className="font-bold">{mapa.numero}</span>
                    </div>
                  </td>
                  <td>{mapa.solicitacaoNumero}</td>
                  <td>{mapa.data}</td>
                  <td>
                    <div className="suppliers-stack">
                      {Array.from(new Set(mapa.itens.flatMap(it => it.bids.map(b => b.supplierName)))).join(', ')}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${mapa.status === 'Aberto' ? 'status-open' : mapa.status === 'Finalizado' ? 'status-completed' : 'status-cancelled'}`}>
                      {mapa.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" onClick={() => handleOpenModal(mapa, true)} title="Visualizar">
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" onClick={() => handleOpenModal(mapa)} title="Analisar">
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir">
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
            label="mapas"
          />
        </div>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${isViewMode ? 'Visualizar' : (selectedMapa ? 'Análise do' : 'Novo')} Mapa de Cotação`}
        subtitle="Compare preços e condições para fechar o melhor negócio."
        icon={Calculator}
        size="lg"
        footer={
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="footer-summary flex items-center gap-6">
              <div className="summary-item">
                <span className="label text-muted small mr-2">Total Original (Est.):</span>
                <span className="value font-semibold">R$ {selectedMapa?.valorTotalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-item winner-total">
                <span className="label text-muted small mr-2">Total Selecionado:</span>
                <span className="value font-bold text-primary">R$ {calculateWinnerTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-item highlight economy">
                <span className="label text-muted small mr-2 text-green-600">Economia:</span>
                <span className="value font-bold text-green-600">R$ {calculateEconomy().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="footer-actions flex gap-2">
              <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-premium-solid indigo" onClick={handleGenerateOrders}>
                <ArrowRight size={18} strokeWidth={3} />
                <span>Aprovar e Gerar Pedidos</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="modal-sections-grid">
           <div className="form-section">
              <div className="form-grid mb-6">
                <div className="form-group col-3">
                  <label>Número do Mapa</label>
                  <div className="input-with-icon">
                    <input type="text" value={numero} readOnly disabled />
                    <Hash size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-3">
                  <label>Solicitação de Compra</label>
                  <div className="input-with-icon">
                    <input type="text" value={solicitacaoNumero} readOnly disabled />
                    <FileText size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-3">
                  <label>Data de Análise</label>
                  <div className="input-with-icon">
                    <input type="date" value={data} onChange={(e) => setData(e.target.value)} readOnly={!isManualEntry || isViewMode} disabled={!isViewMode && !isManualEntry} />
                    <Calendar size={18} className="field-icon" />
                  </div>
                </div>
                <div className="form-group col-3">
                  <label>Empresa / Unidade</label>
                  <div className="input-with-icon">
                    <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} disabled={!isManualEntry || isViewMode}>
                      {INITIAL_COMPANIES.filter(c => c.status === 'Ativa').map(c => (
                        <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                      ))}
                    </select>
                    <Building2 size={18} className="field-icon" />
                  </div>
                </div>
              </div>

              <div className="section-title-row mb-4 flex justify-between items-center">
                <div className="section-title flex items-center gap-2 font-semibold">
                  <List size={18} />
                  <span>Grade de Comparação de Fornecedores</span>
                </div>
                {!isViewMode && (
                  <div className="section-actions flex gap-2">
                    <select 
                      className="registry-select p-2 rounded-md border text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          addItemFromRegistry(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">+ Insumo...</option>
                      {MOCK_INSUMOS.filter(i => i.paraCompra).map(i => (
                        <option key={i.id} value={i.id}>{i.nome}</option>
                      ))}
                    </select>
                    <select 
                      className="registry-select p-2 rounded-md border text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          addSupplierFromRegistry(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">+ Fornecedor...</option>
                      {MOCK_SUPPLIERS.map(s => (
                        <option key={s.id} value={s.id}>{s.nomeFantasia}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="comparison-grid-container overflow-x-auto">
                  <table className="comparison-grid w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="sticky-col text-left p-3 border">Insumo / Especificação</th>
                        <th className="sticky-col text-center p-3 border">Qtd / Un</th>
                        {suppliers.map(s => (
                          <th key={s.id} className="supplier-header p-3 border text-center min-w-[200px]">
                            <div className="supplier-header-info flex items-center justify-center gap-2">
                              {isManualEntry && !isViewMode ? (
                                <input 
                                  type="text" 
                                  value={s.name} 
                                  onChange={(e) => updateSupplierName(s.id, e.target.value)}
                                  className="supplier-name-input border-0 bg-transparent text-center font-bold w-full focus:ring-0"
                                />
                              ) : (
                                <span className="font-bold uppercase tracking-wider text-xs">{s.name}</span>
                              )}
                              {!isViewMode && suppliers.length > 2 && (
                                <button className="remove-col" onClick={() => removeSupplier(s.id)}><X size={12} /></button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map(item => (
                        <tr key={item.id}>
                          <td className="sticky-col item-info-cell p-3 border">
                            {isManualEntry && !isViewMode ? (
                              <input 
                                type="text" 
                                value={item.insumoNome} 
                                onChange={(e) => updateItemDetails(item.id, 'insumoNome', e.target.value)}
                                className="item-name-input w-full border-0 focus:ring-0 font-medium"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="item-name font-bold text-slate-800">{item.insumoNome}</span>
                                <span className="item-sub text-xs text-slate-400">— {item.unidade}</span>
                              </div>
                            )}
                            {!isViewMode && isManualEntry && (
                              <button className="remove-row" onClick={() => removeItemRow(item.id)}><Trash2 size={12} /></button>
                            )}
                          </td>
                          <td className="sticky-col qty-cell p-3 border text-center">
                            {isManualEntry && !isViewMode ? (
                              <div className="flex items-center gap-2 justify-center">
                                <input 
                                  type="number" 
                                  value={item.quantidade} 
                                  onChange={(e) => updateItemDetails(item.id, 'quantidade', parseFloat(e.target.value))}
                                  className="item-qty-input w-16 text-center border p-1 rounded font-bold"
                                />
                                <span className="text-xs text-slate-400 font-bold uppercase">{item.unidade}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 justify-center">
                                <span className="qty-val font-bold text-lg">{item.quantidade}</span>
                                <span className="qty-un text-xs text-slate-400 font-bold uppercase">{item.unidade}</span>
                              </div>
                            )}
                          </td>
                          {suppliers.map(s => {
                            const bid = item.bids.find(b => b.supplierId === s.id);
                            const bestPrice = getBestPrice(item);
                            const isBest = bid && bid.price > 0 && bid.price === bestPrice;
                            
                            return (
                              <td 
                                key={s.id} 
                                className={`bid-cell p-3 border transition-all cursor-pointer ${bid?.isWinner ? 'is-winner' : ''} ${isBest ? 'is-best' : ''}`}
                                onClick={() => bid && toggleWinner(item.id, bid.supplierId)}
                              >
                                {bid ? (
                                  <div className="bid-content flex flex-col items-center gap-2">
                                    {isBest && (
                                      <div className="best-price-badge">
                                        Melhor Preço
                                      </div>
                                    )}
                                    <div className="bid-price flex items-baseline gap-1">
                                      <span className="currency text-xs font-semibold text-muted">R$</span>
                                      {!isViewMode ? (
                                        <input 
                                          type="number" 
                                          value={bid.price} 
                                          onChange={(e) => updateBidPrice(item.id, s.id, parseFloat(e.target.value))}
                                          onFocus={(e) => e.stopPropagation()}
                                          onClick={(e) => e.stopPropagation()}
                                          className="price-input font-bold text-xl text-center w-24 border-0 bg-transparent focus:ring-0"
                                        />
                                      ) : (
                                        <span className="value font-bold text-xl">{bid.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                      )}
                                    </div>
                                    <div className="bid-footer w-full flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                      <div className="bid-time flex items-center gap-1 text-[10px] text-muted">
                                        <Clock size={10} />
                                        <span>{bid.deliveryTime}</span>
                                      </div>
                                      {bid.isWinner && (
                                        <div className="winner-badge" title="Fornecedor Selecionado">
                                          <Trophy size={12} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="no-bid text-center text-slate-300 text-xs italic">Sem Oferta</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
           </div>
        </div>
      </StandardModal>
    </div>
  );
};

