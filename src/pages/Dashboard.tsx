import React, { useMemo } from 'react';
import { 
  Users, 
  Beef, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Activity,
  Calendar,
  ChevronRight,
  Wallet,
  ShoppingCart,
  Bell,
  ArrowRight,
  Zap,
  TrendingUp,
  LineChart as LineChartIcon,
  AlertCircle
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useCompany } from '../contexts/CompanyContext';
import './Dashboard.css';

export const Dashboard = () => {
  const { activeCompanyId } = useCompany();

  // Real Queries
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];
  const allTransacoes = useLiveQuery(() => db.transacoes.toArray()) || [];
  const allPastos = useLiveQuery(() => db.pastos.toArray()) || [];
  const allInsumos = useLiveQuery(() => db.insumos.toArray()) || [];

  // Filtered Data
  const animais = useMemo(() => allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId), [allAnimais, activeCompanyId]);
  const transacoes = useMemo(() => allTransacoes.filter(t => activeCompanyId === 'Todas' || t.empresaId === activeCompanyId), [allTransacoes, activeCompanyId]);
  const pastos = useMemo(() => allPastos.filter(p => activeCompanyId === 'Todas' || p.empresaId === activeCompanyId), [allPastos, activeCompanyId]);
  const insumos = useMemo(() => allInsumos.filter(i => activeCompanyId === 'Todas' || (i as any).empresaId === activeCompanyId), [allInsumos, activeCompanyId]);

  const stats = useMemo(() => {
    const total = animais.length;
    const pesoMedio = total > 0 ? (animais.reduce((acc, a) => acc + (a.peso || 0), 0) / total).toFixed(1) : '0';
    
    const saldo = transacoes.reduce((acc, t) => acc + (t.tipo === 'in' ? t.valor : -t.valor), 0);
    const lowStock = insumos.filter(i => i.status === 'Crítico' || i.status === 'Baixo').length;

    return [
      { title: 'Total Rebanho', value: total.toLocaleString(), icon: Beef, colorClass: 'indigo', trend: total > 0 ? '+12' : '0', trendUp: true },
      { title: 'Peso Médio', value: `${pesoMedio} kg`, icon: Activity, colorClass: 'success', trend: '+0.8', trendUp: true },
      { title: 'Saldo Operacional', value: `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: Wallet, colorClass: 'primary', trend: '+5.2', trendUp: true },
      { title: 'Produtos em Alerta', value: `${lowStock} itens`, icon: Zap, colorClass: 'warning', trend: lowStock > 0 ? 'CRÍTICO' : 'NORMAL', trendUp: false }
    ];
  }, [animais, transacoes, insumos]);

  // Simple SVG Line Chart for "Evolução do Rebanho"
  const chartData = [300, 450, 420, 600, 800, 950, 1248];
  const maxVal = Math.max(...chartData);
  const points = chartData.map((val, i) => `${(i * 100) / 6},${100 - (val * 85) / maxVal}`).join(' ');

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <span>Principal</span>
        <ChevronRight size={14} />
        <span>Dashboard</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <h1>Command Center 2.0</h1>
          <p className="description">Inteligência estratégica e visão global do ecossistema produtivo.</p>
        </div>
        <div className="header-actions">
           <button className="btn-icon-pulse" title="Notificações Estratégicas">
              <Bell size={20} />
              <div className="pulse-marker"></div>
              <div className="pulse-ring"></div>
           </button>
           <button className="btn-primary">
              <LineChartIcon size={18} />
              Relatório Consolidado
           </button>
        </div>
      </div>

      <div className="summary-grid">
        {stats.map((stat, index) => (
          <div key={index} className="summary-card card glass">
            <div className="summary-info">
              <span className="summary-label">{stat.title}</span>
              <span className="summary-value">{stat.value}</span>
              {stat.trend !== '0' && (
                <div className={`summary-trend ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}%
                </div>
              )}
            </div>
            <div className={`summary-icon ${stat.colorClass}`}>
              <stat.icon size={32} />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main card glass">
          <div className="card-header">
            <div>
              <h3>Evolução do Rebanho</h3>
              <p>Crescimento populacional e aquisições (U.m)</p>
            </div>
            <select className="period-select">
              <option>Últimos 6 meses</option>
              <option>Este Ano</option>
            </select>
          </div>
          
          <div className="chart-container">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-indigo)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--primary-indigo)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

              <polyline
                fill="none"
                stroke="var(--primary-indigo)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              <polygon
                fill="url(#chartGradient)"
                points={`0,100 ${points} 100,100`}
              />
            </svg>
            <div className="chart-labels">
              <span>Out</span>
              <span>Nov</span>
              <span>Dez</span>
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
            </div>
          </div>
        </div>

        <div className="dashboard-side">
          <div className="card glass alerts-widget mb-16">
            <div className="card-header">
              <div className="flex items-center gap-8">
                <AlertCircle size={20} className="text-orange" />
                <h3>Alertas Estratégicos</h3>
              </div>
              <span className="badge warning">03 Ativos</span>
            </div>
            <div className="alerts-list">
              <div className="alert-item">
                <div className="alert-indicator danger"></div>
                <div className="alert-content">
                  <h4>Manejo Sanitário Atrasado</h4>
                  <p>Lote 01 — 120 cab. requerem vermifugação imediata.</p>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-indicator warning"></div>
                <div className="alert-content">
                  <h4>Estoque Crítico (Nutrição)</h4>
                  <p>Sal Mineral 20kg: Autonomia de apenas 03 dias.</p>
                </div>
              </div>
            </div>
            <button className="btn-alert-action">
              Central de Segurança & Alertas <ArrowRight size={14} />
            </button>
          </div>

          <div className="dashboard-side-content card glass p-0">
            <div className="card-header p-20">
              <h3>Atividade Recente</h3>
              <button className="btn-link">Ver Tudo</button>
            </div>
            <div className="activity-timeline px-20 pb-20">
              <div className="activity-item">
                <div className="activity-icon indigo">
                  <Beef size={20} />
                </div>
                <div className="activity-content">
                  <h5>Lote 04 — Pesagem Finalizada</h5>
                  <p>Média de Ganho: 1.250kg/dia. Próxima pesagem em 30 dias.</p>
                  <span className="activity-time">Há 2 horas</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon success">
                  <TrendingUp size={20} />
                </div>
                <div className="activity-content">
                  <h5>Nova Incorporação: #VAC-8820</h5>
                  <p>Categoria: Matriz Nelore PO. Procedência: Leilão Virtual.</p>
                  <span className="activity-time">Há 5 horas</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon danger">
                  <AlertTriangle size={20} />
                </div>
                <div className="activity-content">
                  <h5>Carência Ativa Detectada</h5>
                  <p>Animal #8822 (Antibiótico). Liberação prevista: 25/03/2026.</p>
                  <span className="activity-time">Há 1 dia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer-grid">
          <div className="mini-dashboard card glass">
            <h4>Distribuição por Sexo</h4>
            {(() => {
              const machos = animais.filter(a => a.sexo === 'M').length;
              const femeas = animais.filter(a => a.sexo === 'F').length;
              const total = animais.length || 1;
              const percM = Math.round((machos / total) * 100);
              const percF = Math.round((femeas / total) * 100);

              return (
                <div className="gender-dist">
                  <div className="gender-bar">
                    <div className="segment male" style={{ width: `${percM}%` }}></div>
                    <div className="segment female" style={{ width: `${percF}%` }}></div>
                  </div>
                  <div className="gender-legend">
                    <span><i className="dot male"></i> Machos ({percM}%)</span>
                    <span><i className="dot female"></i> Fêmeas ({percF}%)</span>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="mini-dashboard card glass">
            <h4>Ocupação de Pastos</h4>
            {(() => {
              const totalPastos = pastos.length || 1;
              const emUso = pastos.filter(p => p.status === 'Ocupado').length;
              const perc = Math.round((emUso / totalPastos) * 100);

              return (
                <div className="occupation-status">
                  <div className="status-row">
                    <span>Pastos em Uso</span>
                    <span className="badge warning">{emUso}/{totalPastos}</span>
                  </div>
                  <div className="progress-bar-small">
                    <div className="fill" style={{ width: `${perc}%` }}></div>
                  </div>
                  <p className="helper">{perc > 80 ? '⚠️ Atenção: Lotação Elevada' : 'Lotação dentro da capacidade'}</p>
                </div>
              );
            })()}
          </div>
      </div>
    </div>
  );
};

