import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  TrendingDown, 
  Calendar, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useCompany } from '../../../contexts/CompanyContext';
import { TablePagination } from '../../../components/TablePagination';
import { TableFilters } from '../../../components/TableFilters';
import { usePagination } from '../../../hooks/usePagination';
import { ColumnFilters } from '../../../components/ColumnFilters';
import '../Vendas.css';

interface Contrato {
  id: string;
  referencia: string;
  cliente: string;
  dataAssinatura: string;
  dataEntrega: string;
  quantidade: number;
  unidade: string;
  precoFixado: number;
  status: 'Ativo' | 'Liquidado' | 'Pendente' | 'Cancelado';
  empresaId: string;
}

const mockContratos: Contrato[] = [
  { id: '1', referencia: 'CT-2024-082', cliente: 'Frigorífico Boi Gordo', dataAssinatura: '2024-01-15', dataEntrega: '2024-05-10', quantidade: 150, unidade: 'cab', precoFixado: 235.00, status: 'Ativo', empresaId: '1' },
  { id: '2', referencia: 'CT-2024-095', cliente: 'Exportadora Pantanal', dataAssinatura: '2024-02-10', dataEntrega: '2024-06-20', quantidade: 300, unidade: 'cab', precoFixado: 242.50, status: 'Ativo', empresaId: '2' },
  { id: '3', referencia: 'CT-2023-450', cliente: 'Frigorífico Boi Gordo', dataAssinatura: '2023-11-05', dataEntrega: '2024-02-15', quantidade: 120, unidade: 'cab', precoFixado: 228.00, status: 'Liquidado', empresaId: '1' },
];

export const Contratos = () => {
  const { activeCompanyId } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    referencia: '',
    cliente: '',
    quantidade: '',
    precoFixado: '',
    entrega: '',
    status: 'Todos'
  });

  const contracts = mockContratos.filter(c => activeCompanyId === 'Todas' || c.empresaId === activeCompanyId);

  const filteredData = contracts.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = c.referencia.toLowerCase().includes(searchLower) || 
                         c.cliente.toLowerCase().includes(searchLower) ||
                         c.dataAssinatura.toLowerCase().includes(searchLower) ||
                         c.dataEntrega.toLowerCase().includes(searchLower) ||
                         c.quantidade.toString().includes(searchLower) ||
                         c.unidade.toLowerCase().includes(searchLower) ||
                         c.precoFixado.toString().includes(searchLower) ||
                         c.status.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
    
    const matchesColumnFilters = 
      (columnFilters.referencia === '' || c.referencia.toLowerCase().includes(columnFilters.referencia.toLowerCase())) &&
      (columnFilters.cliente === '' || c.cliente.toLowerCase().includes(columnFilters.cliente.toLowerCase())) &&
      (columnFilters.quantidade === '' || c.quantidade.toString().includes(columnFilters.quantidade)) &&
      (columnFilters.precoFixado === '' || c.precoFixado.toString().includes(columnFilters.precoFixado)) &&
      (columnFilters.entrega === '' || new Date(c.dataEntrega).toLocaleDateString('pt-BR').includes(columnFilters.entrega)) &&
      (columnFilters.status === 'Todos' || c.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesColumnFilters;
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
          <div className="icon-badge indigo">
            <TrendingUp size={32} />
          </div>
          <div>
            <h1>Contratos & Mercado Futuro</h1>
            <p className="description">Gestão de contratos de venda antecipada, fixação de preços e proteção (hedge).</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <span>Cotação B3 (Arrouba)</span>
          </button>
          <button className="btn-premium-solid indigo">
            <Plus size={18} strokeWidth={3} />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Volume Contratado</span>
            <span className="summary-value">450 <small>cab</small></span>
            <span className="summary-subtext">Comprometimento de safra</span>
          </div>
          <div className="summary-icon blue">
            <Target size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Preço Médio Travado</span>
            <span className="summary-value">R$ 238.75</span>
            <span className="summary-subtext desc">Vs. Mercado: R$ 232.00</span>
          </div>
          <div className="summary-icon green">
            <TrendingUp size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Liquidações (30dd)</span>
            <span className="summary-value">R$ 273.6k</span>
            <span className="summary-subtext">Valor financeiro realizado</span>
          </div>
          <div className="summary-icon indigo">
            <CheckCircle2 size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Entregas Pendentes</span>
            <span className="summary-value text-orange">02</span>
            <span className="summary-subtext desc">Próxima em: 10/05/2024</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por cliente, produto ou status..."
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
              <th>Referência</th>
              <th>Cliente / Comprador</th>
              <th>Quantidade</th>
              <th>Preço @</th>
              <th>Data Entrega</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'referencia', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'cliente', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'quantidade', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'precoFixado', type: 'text', placeholder: 'Preço...' },
                  { key: 'entrega', type: 'text', placeholder: 'Data...' },
                  { key: 'status', type: 'select', options: ['Ativo', 'Liquidado', 'Pendente', 'Cancelado'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={true}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map(c => (
              <tr key={c.id}>
                <td className="font-bold">{c.referencia}</td>
                <td>{c.cliente}</td>
                <td>{c.quantidade} {c.unidade}</td>
                <td className="font-bold">R$ {c.precoFixado.toFixed(2)}</td>
                <td>{new Date(c.dataEntrega).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={`status-badge ${c.status === 'Liquidado' ? 'status-pago' : c.status === 'Ativo' ? 'status-ativo' : 'status-pendente'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="actions-cell">
                    <button className="action-btn-global btn-view" title="Ver Contrato">
                      <FileText size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-view" title="Acompanhar Entrega">
                      <ArrowRight size={18} strokeWidth={3} />
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
          label="contratos"
        />
      </div>

      <div className="market-insights grid grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card glass p-6">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 700 }}>
             Análise de Base (Local vs B3)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Indicador Cepea (SP):</span>
              <strong className="text-indigo">R$ 232,15</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Diferencial de Base (MT):</span>
              <strong className="text-red">-12,5%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Cotação Local Sugerida:</span>
              <strong>R$ 203,13</strong>
            </div>
          </div>
        </div>

        <div className="card glass p-6 bg-slate-900 text-white" style={{ background: '#0f172a', border: 'none' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700 }}>
            <AlertCircle size={20} className="text-orange-400" /> Alerta de Oportunidade
          </h4>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.5 }}>
            A curva de juros para o 2º semestre indica uma alta na arroba de reposição. Recomenda-se travar a venda do lote 15 via contrato a termo para garantir a margem planejada na análise de custo.
          </p>
          <button className="btn-premium-solid mt-4 w-full" style={{ background: 'white', color: '#0f172a', border: 'none' }}>
            <span>Simular Proteção (Hedge)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

