import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  Eye,
  Edit
} from 'lucide-react';
import './PedidosVenda.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { mockAnimals } from '../../data/mockData';

interface SalesItem {
  id: string;
  brinco: string;
  raca: string;
  sexo: string;
  peso: number;
  valorKg: number;
  subtotal: number;
}

interface SalesOrder {
  id: string;
  numero: string;
  data: string;
  cliente: string;
  qtdCabecas: number;
  pesoTotal: number;
  valorTotal: number;
  status: 'Pendente' | 'Confirmado' | 'Faturado' | 'Entregue' | 'Cancelado';
}

const INITIAL_SALES: SalesOrder[] = [
  {
    id: '1',
    numero: 'PV-2026-001',
    data: '2026-03-12',
    cliente: 'Frigorífico JBS - Unidade Lins',
    qtdCabecas: 2,
    pesoTotal: 835,
    valorTotal: 12525.00,
    status: 'Confirmado'
  },
  {
    id: '2',
    numero: 'PV-2026-002',
    data: '2026-03-14',
    cliente: 'Agropecuária Terra Nova',
    qtdCabecas: 1,
    pesoTotal: 285,
    valorTotal: 4275.00,
    status: 'Pendente'
  }
];

export const PedidosVenda: React.FC = () => {
  const [sales, setSales] = useState<SalesOrder[]>(INITIAL_SALES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCliente, setFilterCliente] = useState('Todos');
  const [items, setItems] = useState<SalesItem[]>([]);
  const [gerarFinanceiro, setGerarFinanceiro] = useState(true);
  const [dataVencimento, setDataVencimento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Boleto');
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    cliente: '',
    qtdPeso: '',
    valorTotal: '',
    status: 'Todos'
  });

  const handleAddField = () => {
    const animal = mockAnimals[Math.floor(Math.random() * mockAnimals.length)];
    const newItem: SalesItem = {
      id: Math.random().toString(36).substr(2, 9),
      brinco: animal.brinco,
      raca: animal.raca,
      sexo: animal.sexo,
      peso: animal.peso,
      valorKg: 15.00,
      subtotal: animal.peso * 15.00
    };
    setItems([...items, newItem]);
  };

  const filteredData = sales.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = order.cliente.toLowerCase().includes(searchLower) || 
                         order.numero.toLowerCase().includes(searchLower) ||
                         order.data.toLowerCase().includes(searchLower) ||
                         order.status.toLowerCase().includes(searchLower) ||
                         order.qtdCabecas.toString().includes(searchLower) ||
                         order.pesoTotal.toString().includes(searchLower) ||
                         order.valorTotal.toString().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || order.status === filterStatus;
    const matchesCliente = filterCliente === 'Todos' || order.cliente === filterCliente;
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || order.numero.toLowerCase().includes(columnFilters.numero.toLowerCase()) || order.data.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.cliente === '' || order.cliente.toLowerCase().includes(columnFilters.cliente.toLowerCase())) &&
      (columnFilters.qtdPeso === '' || order.qtdCabecas.toString().includes(columnFilters.qtdPeso) || order.pesoTotal.toString().includes(columnFilters.qtdPeso)) &&
      (columnFilters.valorTotal === '' || order.valorTotal.toString().includes(columnFilters.valorTotal)) &&
      (columnFilters.status === 'Todos' || order.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesCliente && matchesColumnFilters;
  });

  const clientes = Array.from(new Set(sales.map(s => s.cliente)));

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

  const calculateTotal = () => items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <TrendingUp size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Pedidos de Venda</h1>
            <p className="description">Emissão de ordens de venda, faturamento e romaneios de gado.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <FileText size={18} strokeWidth={3} />
            <span>Relatórios</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => {
            setSelectedOrder(null);
            setIsViewMode(false);
            setItems([]);
            setIsModalOpen(true);
          }}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Faturamento (Mês)</span>
            <span className="summary-value">R$ 1.250k</span>
            <span className="summary-subtext">Sales Target: 85%</span>
          </div>
          <div className="summary-icon indigo">
             <BarChart3 size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Pedidos Pendentes</span>
            <span className="summary-value">03</span>
            <span className="summary-subtext">Aguardando Faturamento</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Ticket Médio /@</span>
            <span className="summary-value">R$ 315</span>
            <span className="summary-subtext">Base: Nelore (Arroba)</span>
          </div>
          <div className="summary-icon green">
            <Calculator size={28} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por cliente ou número de pedido..."
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
              <th>Pedido / Data</th>
              <th>Cliente</th>
              <th>Qtd/Peso</th>
              <th>Vlr. Total</th>
              <th>Status</th>
              <th className="text-center">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'cliente', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'qtdPeso', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'valorTotal', type: 'text', placeholder: 'Valor...' },
                  { key: 'status', type: 'select', options: ['Pendente', 'Confirmado', 'Faturado', 'Entregue', 'Cancelado'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={true}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{order.numero}</strong>
                    <span className="text-slate-400 text-sm font-medium">— {new Date(order.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                </td>
                <td>
                  <div className="client-cell flex items-center gap-2">
                    <Users size={16} strokeWidth={3} className="text-indigo-500" />
                    <span className="font-bold text-slate-700">{order.cliente}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-800">{order.qtdCabecas} cab.</strong>
                    <span className="text-slate-400 text-sm">{order.pesoTotal} kg</span>
                  </div>
                </td>
                <td>
                  <strong className="text-indigo-600 font-extrabold text-lg">R$ {order.valorTotal.toLocaleString()}</strong>
                </td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    <div className="dot"></div>
                    {order.status}
                  </span>
                </td>
                <td className="text-center">
                  <div className="actions-cell justify-center">
                    <button className="action-btn-global btn-view" title="Visualizar" onClick={() => { setSelectedOrder(order); setIsViewMode(true); setIsModalOpen(true); }}>
                      <Eye size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-edit" title="Editar" onClick={() => { setSelectedOrder(order); setIsViewMode(false); setIsModalOpen(true); }}>
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
          label="pedidos"
        />

      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lançar Pedido de Venda"
        subtitle="Configure os itens da venda, cliente e condições comerciais"
        icon={TrendingUp}
        size="xl"
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo" onClick={() => setIsModalOpen(false)}>
              <CheckCircle2 size={18} strokeWidth={3} />
              <span>Confirmar Pedido</span>
            </button>
          </div>
        }
      >
        <div className="form-sections-grid">
          <div className="form-section">
            <h4 className="section-title">Informações Básicas</h4>
            <div className="form-grid">
              <div className="form-group col-12">
                <label>Cliente (Destino)</label>
                <select>
                  <option>Selecione o cliente...</option>
                  <option>Frigorífico JBS</option>
                  <option>Frigorífico Minerva</option>
                  <option>Leilão Boi Gordo</option>
                </select>
              </div>
              <div className="form-group col-6">
                <label>Data da Venda</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group col-6">
                <label>Previsão de Carregamento</label>
                <input type="date" />
              </div>
              <div className="form-group col-6">
                <label>Local de Retirada (Fazenda)</label>
                <select>
                  <option>Fazenda Horizonte (Matriz)</option>
                  <option>Fazenda Santa Maria</option>
                </select>
              </div>
              <div className="form-group col-6">
                <label>Condição de Pagamento</label>
                <select>
                  <option>À Vista</option>
                  <option>30 Dias</option>
                  <option>30/60 Dias</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="flex justify-between items-center mb-4">
              <h4 className="section-title">Animais / Lotes da Venda</h4>
              {!isViewMode && (
                <button className="btn-premium-solid btn-sm" onClick={handleAddField}>
                  <Plus size={16} strokeWidth={3} />
                  <span>Adicionar Animal</span>
                </button>
              )}
            </div>
            
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Brinco</th>
                    <th>Raça/Sexo</th>
                    <th>Peso (Kg)</th>
                    <th>Vlr. Kg (R$)</th>
                    <th>Subtotal</th>
                    {!isViewMode && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="animate-slide-in">
                      <td><strong>{item.brinco}</strong></td>
                      <td>{item.raca} / {item.sexo}</td>
                      <td>{item.peso}</td>
                      <td>{item.valorKg.toFixed(2)}</td>
                      <td><strong>R$ {item.subtotal.toLocaleString()}</strong></td>
                      {!isViewMode && (
                        <td><button className="btn-icon-danger" onClick={() => setItems(items.filter(i => i.id !== item.id))}><X size={14} /></button></td>
                      )}
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        Nenhum animal adicionado à venda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="integration-box mt-16 animate-fade-in" style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h4 style={{ margin: 0, color: 'var(--primary-indigo)', fontWeight: 700 }}>Integração Financeira</h4>
                   <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gerar lançamento estratégico no Fluxo de Caixa</p>
                 </div>
                 <div className="custom-switch">
                   <input 
                     type="checkbox" 
                     id="gerarFinanceiro" 
                     checked={gerarFinanceiro} 
                     onChange={(e) => setGerarFinanceiro(e.target.checked)}
                     disabled={isViewMode}
                   />
                   <label htmlFor="gerarFinanceiro"></label>
                 </div>
               </div>

               {gerarFinanceiro && (
                 <div className="form-grid mt-16 animate-slide-up">
                   <div className="form-group col-6">
                     <label>Previsão de Recebimento</label>
                     <input 
                       type="date" 
                       value={dataVencimento} 
                       onChange={(e) => setDataVencimento(e.target.value)}
                       disabled={isViewMode}
                     />
                   </div>
                   <div className="form-group col-6">
                     <label>Forma de Pagamento</label>
                     <select 
                       value={formaPagamento} 
                       onChange={(e) => setFormaPagamento(e.target.value)}
                       disabled={isViewMode}
                     >
                       <option value="Boleto">Boleto Bancário</option>
                       <option value="Pix">Pix / Transferência</option>
                       <option value="Cartao">Cartão de Crédito</option>
                       <option value="Dinheiro">Dinheiro</option>
                     </select>
                   </div>
                 </div>
               )}
            </div>

            <div className="totals-card card glass mt-16">
              <div className="total-row">
                <span>Qtd. Cabeças:</span>
                <span className="font-bold">{items.length}</span>
              </div>
              <div className="total-row grand-total mt-4 border-t pt-4">
                <span>Total da Venda:</span>
                <span className="value text-indigo">R$ {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

