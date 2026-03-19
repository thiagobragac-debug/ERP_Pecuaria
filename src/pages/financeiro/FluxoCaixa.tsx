import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar as CalendarIcon, 
  Search, 
  BarChart3,
  Wallet,
  Activity,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  LineChart,
  Download,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useCompany } from '../../contexts/CompanyContext';
import { db } from '../../services/db';
import { Transacao, Company } from '../../types';
import './FluxoCaixa.css';

interface MonthlyFlow {
  mes: string;
  receitaRealizada: number;
  receitaProjetada: number;
  despesaRealizada: number;
  despesaProjetada: number;
}
 
// Helper to group transactions by month for the chart
const getMonthlyFlowFromTransactions = (transactions: Transacao[]) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const flows: Record<string, MonthlyFlow> = {};

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    flows[monthName] = { 
      mes: monthName, 
      receitaRealizada: 0, 
      receitaProjetada: 0, 
      despesaRealizada: 0, 
      despesaProjetada: 0 
    };
  }

  transactions.forEach(t => {
    // For projections, use vencimento. For realized, use data.
    const dateUsed = (t.status === 'Pago' ? t.data : (t.vencimento || t.data));
    const date = new Date(dateUsed);
    const monthName = months[date.getMonth()];
    
    if (flows[monthName]) {
      if (t.tipo === 'in') {
        if (t.status === 'Pago') flows[monthName].receitaRealizada += t.valor;
        else flows[monthName].receitaProjetada += t.valor;
      } else {
        if (t.status === 'Pago') flows[monthName].despesaRealizada += t.valor;
        else flows[monthName].despesaProjetada += t.valor;
      }
    }
  });

  return Object.values(flows);
};

export const FluxoCaixa: React.FC = () => {
  const [viewMode, setViewMode] = useState<'real' | 'proj'>('proj');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [columnFilters, setColumnFilters] = useState({
    desc: '',
    valor: '',
    data: '',
    status: 'Todos',
    categoria: 'Todas',
    empresa: 'Todas'
  });
  
  const { activeCompanyId: selectedEmpresaId, setActiveCompanyId, companies: empresasList } = useCompany();
  
  const isOnline = useOnlineStatus();
  const { data: allTransactions = [], isLoading } = useOfflineQuery<Transacao>(['transacoes'], 'transacoes');

  const transactions = useMemo(() => {
    return allTransactions.filter(t => {
      return selectedEmpresaId === 'Todas' || t.empresaId === selectedEmpresaId;
    });
  }, [allTransactions, selectedEmpresaId]);
  
  const monthlyFlow = useMemo(() => getMonthlyFlowFromTransactions(transactions), [transactions]);

  const totalReceita = monthlyFlow.reduce((acc, curr) => 
    acc + curr.receitaRealizada + (viewMode === 'proj' ? curr.receitaProjetada : 0), 0);
  
  const totalDespesa = monthlyFlow.reduce((acc, curr) => 
    acc + curr.despesaRealizada + (viewMode === 'proj' ? curr.despesaProjetada : 0), 0);
    
  const saldoTotal = totalReceita - totalDespesa;

  const intelMetrics = useMemo(() => {
    const compromised = totalReceita > 0 ? (totalDespesa / totalReceita) * 100 : 0;
    const safetyMargin = 100 - compromised;
    const overdueTotal = transactions
      .filter(t => t.status === 'Atrasado')
      .reduce((acc, t) => acc + t.valor, 0);
    const defaults = totalReceita > 0 ? (overdueTotal / totalReceita) * 100 : 0;
    
    // Health Score calculation (simplified)
    const healthScore = Math.max(0, Math.min(100, (safetyMargin * 0.7 + (100 - defaults) * 0.3)));
    
    let statusLabel = 'Crítico';
    if (healthScore > 80) statusLabel = 'Excelente';
    else if (healthScore > 60) statusLabel = 'Bom';
    else if (healthScore > 40) statusLabel = 'Alerta';

    return { compromised, safetyMargin, defaults, healthScore, statusLabel };
  }, [totalReceita, totalDespesa, transactions]);
 
  const maxVal = Math.max(...monthlyFlow.flatMap(m => [
    m.receitaRealizada + m.receitaProjetada, 
    m.despesaRealizada + m.despesaProjetada
  ]), 1000) * 1.1; 

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <LineChart size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
               <h1>Inteligência de Fluxo de Caixa</h1>
               <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
                <Activity size={12} />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <p className="description">Visão tática, projeções financeiras e saúde operacional.</p>
          </div>
        </div>

        <div className="action-buttons">
          <div className="premium-toggle-group">
            <button
              className={`toggle-btn ${viewMode === 'real' ? 'active' : ''}`}
              onClick={() => setViewMode('real')}
            >
              Realizado
            </button>
            <button
              className={`toggle-btn ${viewMode === 'proj' ? 'active' : ''}`}
              onClick={() => setViewMode('proj')}
            >
              Projetado
            </button>
          </div>
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Exportar DRE</span>
          </button>
          <button className="btn-premium-solid indigo">
            <Zap size={18} strokeWidth={3} />
            <span>Nova Projeção</span>
          </button>
        </div>
      </div>

      <div className="premium-stats-grid">
        <div className="premium-card income animate-slide-up">
          <div className="card-content">
            <div className="header">
              <span className="label">Entradas Totais</span>
              <div className="icon-wrapper emerald">
                <TrendingUp size={36} strokeWidth={3} />
              </div>
            </div>
            <div className="body">
              <span className="value">R$ {totalReceita.toLocaleString()}</span>
              <div className="trend-row">
                <span className="trend positive">+12.5%</span>
                <span className="subdesc">vs mês anterior</span>
              </div>
            </div>
          </div>
          <div className="card-background-glow emerald"></div>
        </div>

        <div className="premium-card expense animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card-content">
            <div className="header">
              <span className="label">Saídas Totais</span>
              <div className="icon-wrapper rose">
                <TrendingDown size={36} strokeWidth={3} />
              </div>
            </div>
            <div className="body">
              <span className="value">R$ {totalDespesa.toLocaleString()}</span>
              <div className="trend-row">
                <span className="trend negative">+5.2%</span>
                <span className="subdesc">Insumos em alta</span>
              </div>
            </div>
          </div>
          <div className="card-background-glow rose"></div>
        </div>

        <div className="premium-card balance animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-content">
            <div className="header">
              <span className="label">Saldo Operacional</span>
              <div className="icon-wrapper sky">
                <ShieldCheck size={36} strokeWidth={3} />
              </div>
            </div>
            <div className="body">
              <span className="value">R$ {saldoTotal.toLocaleString()}</span>
              <div className="trend-row">
                <span className="trend positive">SAUDÁVEL</span>
                <span className="subdesc">Liquidez: 2.4</span>
              </div>
            </div>
          </div>
          <div className="card-background-glow sky"></div>
        </div>
      </div>

      <div className="main-chart-section data-section animate-fade-in">
        <div className="chart-header">
          <div className="left">
            <h3>Performance Mensal de Caixa</h3>
            <p>Comparativo consolidado de fluxo real vs. metas projetadas.</p>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="dot emerald"></span> Receitas
            </div>
            <div className="legend-item">
              <span className="dot rose"></span> Despesas
            </div>
            {viewMode === 'proj' && (
              <div className="legend-item">
                <span className="dot dashed"></span> Projeções
              </div>
            )}
          </div>
        </div>

        <div className="tactical-chart-area">
          <div className="y-axis">
            {[...yTicks].reverse().map((tick, i) => (
              <span key={i}>R$ {(tick/1000).toFixed(0)}k</span>
            ))}
          </div>
          <div className="chart-bars-wrapper">
            <div className="chart-grid">
               {yTicks.map((_, i) => <div key={i} className="grid-h-line"></div>)}
            </div>
            <div className="bars-flex">
              {monthlyFlow.map((flow, i) => (
                <div key={i} className="bar-column">
                  <div className="dual-group">
                    <div className="stack-group">
                      <div 
                        className="bar-fill income-solid" 
                        style={{ height: `${(flow.receitaRealizada / maxVal) * 100}%` }}
                      >
                         <div className="bar-popover">Real: R$ {flow.receitaRealizada.toLocaleString()}</div>
                      </div>
                      {viewMode === 'proj' && flow.receitaProjetada > 0 && (
                        <div 
                          className="bar-fill income-hatched" 
                          style={{ height: `${(flow.receitaProjetada / maxVal) * 100}%` }}
                        >
                           <div className="bar-popover">Proj: R$ {flow.receitaProjetada.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    <div className="stack-group">
                      <div 
                        className="bar-fill expense-solid" 
                        style={{ height: `${(flow.despesaRealizada / maxVal) * 100}%` }}
                      >
                         <div className="bar-popover">Real: R$ {flow.despesaRealizada.toLocaleString()}</div>
                      </div>
                      {viewMode === 'proj' && flow.despesaProjetada > 0 && (
                        <div 
                          className="bar-fill expense-hatched" 
                          style={{ height: `${(flow.despesaProjetada / maxVal) * 100}%` }}
                        >
                           <div className="bar-popover">Proj: R$ {flow.despesaProjetada.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="x-label">{flow.mes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid-layout">
        <div className="extrato-section data-section">
          <TableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar transação..."
          >
            <button 
              className={`btn-premium-outline h-11 px-6 ${isFiltersOpen ? 'filter-active' : ''}`}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter size={18} strokeWidth={3} />
              <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
            </button>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Unidade:</span>
              <select 
                className="select-premium-minimal"
                value={selectedEmpresaId} 
                onChange={(e) => setActiveCompanyId(e.target.value)}
              >
                <option value="Todas">Todas as Unidades</option>
                {empresasList.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nomeFantasia}</option>
                ))}
              </select>
            </div>
          </TableFilters>

          
          <div className="extrato-list">
            {isFiltersOpen && (
              <div className="custom-filter-row mb-4">
                <ColumnFilters
                  columns={[
                    { key: 'desc', type: 'text', placeholder: 'Filtrar descrição...' },
                    { key: 'categoria', type: 'select', options: ['Venda Gado', 'Nutrição', 'Operacional', 'Frota', 'Terras'] },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'status', type: 'select', options: ['Pago', 'Pendente'] },
                    { key: 'valor', type: 'text', placeholder: 'Valor...' }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={false}
                />
              </div>
            )}
            {transactions
              .filter(t => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = t.desc.toLowerCase().includes(searchLower) || 
                       t.categoria.toLowerCase().includes(searchLower) ||
                       t.valor.toString().includes(searchLower) ||
                       t.status.toLowerCase().includes(searchLower) ||
                       t.data.toLowerCase().includes(searchLower);

                const matchesColumnFilters = 
                  (columnFilters.desc === '' || t.desc.toLowerCase().includes(columnFilters.desc.toLowerCase())) &&
                  (columnFilters.categoria === 'Todas' || t.categoria === columnFilters.categoria) &&
                  (columnFilters.data === '' || t.data.includes(columnFilters.data)) &&
                  (columnFilters.status === 'Todos' || t.status === columnFilters.status) &&
                  (columnFilters.valor === '' || t.valor.toString().includes(columnFilters.valor));

                return matchesSearch && matchesColumnFilters;
              })
              .filter(t => viewMode === 'proj' || t.status === 'Pago')
              .map((t) => (
              <div key={t.id} className={`extrato-item ${t.tipo} ${t.status === 'Pendente' ? 'pending' : ''}`}>
                <div className="item-icon-wrapper">
                   {t.status === 'Pendente' ? <Clock size={18} strokeWidth={3} /> : (t.tipo === 'in' ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownRight size={18} strokeWidth={3} />)}
                </div>
                <div className="item-info">
                  <div className="main">
                    <strong>{t.desc}</strong>
                    <span className="category-tag">{t.categoria}</span>
                  </div>
                  <div className="meta">
                    <span className="date">{t.data}</span>
                    <span className={`status-pill ${t.status.toLowerCase()}`}>{t.status}</span>
                  </div>
                </div>
                <div className="item-value">
                  <span className="currency">R$</span>
                  <span className="amount">{t.valor.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="section-footer">
            <button className="btn-premium-outline w-auto px-6 h-10 gap-3">
              <span className="font-bold text-sm">Visualizar Extrato Completo</span>
              <ArrowRightLeft size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="intel-sidebar">
          <div className="health-gauge-card glass">
             <h3>Saúde Financeira</h3>
             <div className="gauge-container">
                <div className="gauge-track">
                   <div className="gauge-fill" style={{ transform: `rotate(${(intelMetrics.healthScore / 100) * 180 - 90}deg)` }}></div>
                </div>
                <div className="gauge-value">
                   <span className="number">{Math.round(intelMetrics.healthScore)}</span>
                   <span className="label">{intelMetrics.statusLabel}</span>
                </div>
             </div>
             <p className="gauge-desc">
               {intelMetrics.healthScore > 70 
                 ? 'Seu fluxo de caixa está operando com alta margem de segurança para o próximo trimestre.'
                 : 'Atenção necessária às projeções de saída para evitar pressão sobre o capital de giro.'}
             </p>
          </div>

          <div className="prognosis-list mt-6">
             <div className="prognosis-item">
                <div className="info">
                   <span className="label">Comprometimento</span>
                   <span className="val-text">{Math.round(intelMetrics.compromised)}%</span>
                </div>
                <div className="progress-track">
                   <div className="progress-bar orange" style={{ width: `${intelMetrics.compromised}%` }}></div>
                </div>
             </div>
             <div className="prognosis-item">
                <div className="info">
                   <span className="label">Margem de Segurança</span>
                   <span className="val-text">{Math.round(intelMetrics.safetyMargin)}%</span>
                </div>
                <div className="progress-track">
                   <div className="progress-bar emerald" style={{ width: `${intelMetrics.safetyMargin}%` }}></div>
                </div>
             </div>
             <div className="prognosis-item">
                <div className="info">
                   <span className="label">Inadimplência (Histórica)</span>
                   <span className="val-text">{Math.round(intelMetrics.defaults)}%</span>
                </div>
                <div className="progress-track">
                   <div className="progress-bar rose" style={{ width: `${intelMetrics.defaults}%` }}></div>
                </div>
             </div>
          </div>
          
          <div className="suggestion-banner mt-6">
             <div className="icon"><Activity size={20} strokeWidth={3} /></div>
             <div className="text">
                <p><strong>Insight:</strong> Antecipação de recebíveis do Lote 02 pode gerar economia de 3.2% em juros de fornecedores.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

