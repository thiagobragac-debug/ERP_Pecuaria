import React, { useState, useEffect } from 'react';
import { saasService } from '../../services/saasService';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical,
  Download,
  Calendar,
  CreditCard,
  FileCheck,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import './SaaSAdmin.css';

interface SaaSMetrics {
  mrr: number;
  active_subscriptions: number;
  total_organizations: number;
  current_month_revenue: number;
}

export const SaaSAdmin = () => {
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    organizacao: '',
    plano: '',
    valor: '',
    vencimento: '',
    status: 'Todos'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, b] = await Promise.all([
        saasService.getSaaSMetrics(),
        saasService.getBillingHistory()
      ]);
      setMetrics(m);
      setBillingHistory(b);
    } catch (err) {
      console.error('Error loading SaaS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredBilling = billingHistory.filter(item => {
    const matchesSearch = item.organization?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.plan?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus;

    const matchesColumnFilters = 
      (columnFilters.organizacao === '' || item.organization?.nome?.toLowerCase().includes(columnFilters.organizacao.toLowerCase())) &&
      (columnFilters.plano === '' || item.plan?.nome?.toLowerCase().includes(columnFilters.plano.toLowerCase())) &&
      (columnFilters.valor === '' || item.valor.toString().includes(columnFilters.valor)) &&
      (columnFilters.vencimento === '' || new Date(item.data_vencimento).toLocaleDateString('pt-BR').includes(columnFilters.vencimento)) &&
      (columnFilters.status === 'Todos' || item.status === columnFilters.status);

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
  } = usePagination({ data: filteredBilling, initialItemsPerPage: 10 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="saas-admin-container">
      <header className="saas-header">
        <div className="title-section">
          <div className="icon-badge indigo">
            <TrendingUp size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Gestão SaaS Master</h1>
            <p>Visão estratégica e financeira da plataforma</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn-global btn-view h-11 px-6 gap-2">
            <Download size={18} strokeWidth={3} />
            <span>Exportar Relatórios</span>
          </button>
        </div>
      </header>

      <div className="metrics-grid">
        <div className="metric-card animate-slide-up">
          <div className="metric-icon">
            <DollarSign size={32} strokeWidth={3} />
          </div>
          <div className="metric-content">
            <span className="label">Receita Mensal (MRR)</span>
            <span className="value">{metrics ? formatCurrency(metrics.mrr) : '...'}</span>
            <div className="trend positive">
              <ArrowUpRight size={16} strokeWidth={3} />
              <span>+12.5%</span>
              <span className="text-xs opacity-60">vs mês ant.</span>
            </div>
          </div>
        </div>

        <div className="metric-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="metric-icon">
            <FileCheck size={32} strokeWidth={3} />
          </div>
          <div className="metric-content">
            <span className="label">Assinaturas Ativas</span>
            <span className="value">{metrics ? metrics.active_subscriptions : '...'}</span>
            <div className="trend positive">
              <ArrowUpRight size={16} strokeWidth={3} />
              <span>+5 novos</span>
              <span className="text-xs opacity-60">este mês</span>
            </div>
          </div>
        </div>

        <div className="metric-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="metric-icon">
            <Building2 size={32} strokeWidth={3} />
          </div>
          <div className="metric-content">
            <span className="label">Total de Empresas</span>
            <span className="value">{metrics ? metrics.total_organizations : '...'}</span>
            <div className="trend neutral">
              <span>Estável</span>
            </div>
          </div>
        </div>

        <div className="metric-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="metric-icon">
            <TrendingUp size={32} strokeWidth={3} />
          </div>
          <div className="metric-content">
            <span className="label">Recebido este Mês</span>
            <span className="value">{metrics ? formatCurrency(metrics.current_month_revenue || 0) : '...'}</span>
            <div className="trend positive">
              <ArrowUpRight size={16} strokeWidth={3} />
              <span>+8.2%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content-grid">
        <div className="billing-section">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <DollarSign size={24} className="text-emerald-500" />
              <h3>Histórico de Faturamento</h3>
            </div>
            <TableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por empresa..."
              actionsLabel="Filtragem"
            >
              <button 
                className={`action-btn-global btn-view h-11 px-6 gap-2 ${isFiltersOpen ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : ''}`}
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <Filter size={18} strokeWidth={3} />
                <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
              </button>
            </TableFilters>
          </div>


          <div className="data-section">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Empresa e Identificação</th>
                  <th>Plano</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
                {isFiltersOpen && (
                  <ColumnFilters
                    columns={[
                      { key: 'organizacao', type: 'text', placeholder: 'Filtrar...' },
                      { key: 'plano', type: 'text', placeholder: 'Filtrar...' },
                      { key: 'valor', type: 'text', placeholder: 'Valor...' },
                      { key: 'vencimento', type: 'text', placeholder: 'Data...' },
                      { key: 'status', type: 'select', options: ['paid', 'pending', 'overdue'] }
                    ]}
                    values={columnFilters}
                    onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                    showActionsPadding={true}
                  />
                )}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '5rem' }}>
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                        <span className="text-muted font-bold">Processando dados financeiros...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Nenhum registro de pagamento encontrado.</td></tr>
                ) : paginatedData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="org-info">
                        <span className="org-name">{item.organization?.nome}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 size={12} className="text-muted" />
                          <span className="org-sub">Ref: {item.organization_id.split('-')[0].toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="plan-name">{item.plan?.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className="billing-value">{formatCurrency(item.valor)}</span>
                    </td>
                    <td>
                      <div className="date-info">
                        <Calendar size={16} className="text-emerald-500" />
                        <span>{new Date(item.data_vencimento).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status === 'paid' ? 'Pago' : item.status === 'pending' ? 'Pendente' : 'Atrasado'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn-global btn-view" title="Ver Detalhes">
                          <MoreVertical size={18} strokeWidth={3} />
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
              label="faturamentos"
            />
          </div>
        </div>

        <div className="side-panels">
          <div className="panel">
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0 }}>Métodos de Pagamento</h3>
              <NavLink to="/admin/definicao" className="text-sm text-emerald-600 hover:underline flex items-center gap-1 font-bold">
                <Settings size={14} />
                Configurar
              </NavLink>
            </div>
            <div className="stats-list">
              <div className="stat-item">
                <CreditCard size={18} className="text-emerald-500" />
                <span>Cartão de Crédito</span>
                <span className="badge">75%</span>
              </div>
              <div className="stat-item">
                <FileCheck size={18} className="text-emerald-500" />
                <span>PIX</span>
                <span className="badge">20%</span>
              </div>
              <div className="stat-item">
                <Download size={18} className="text-emerald-500" />
                <span>Boleto</span>
                <span className="badge">5%</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Suporte à Plataforma</h3>
            <p className="text-muted text-sm mb-4">Acompanhe novos registros e incidentes.</p>
            <button className="w-full p-4 rounded-xl bg-emerald-50 text-emerald-700 font-black hover:bg-emerald-100 transition-all border border-emerald-200">
              Ver Tickets de Suporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

