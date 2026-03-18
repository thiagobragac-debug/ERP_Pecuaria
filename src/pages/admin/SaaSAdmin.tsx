import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Download,
  Building2,
  Zap
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import './SaaSAdmin.css';

interface SaaSMetrics {
  mrr: number;
  active_subscriptions: number;
  total_organizations: number;
  current_month_revenue: number;
}

interface OrganizationSummary {
  id: string;
  nome: string;
  plan_nome: string;
  status: string;
  created_at: string;
  total_paid: number;
}

export const SaaSAdmin: React.FC = () => {
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
  const [orgs, setOrgs] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Load metrics from view
      const { data: metricsData, error: mError } = await supabase
        .from('view_saas_metrics')
        .select('*')
        .single();
      
      if (metricsData) setMetrics(metricsData);

      // Load organization summaries (Join orgs with subs and payments)
      const { data: orgData, error: oError } = await supabase
        .from('saas_organizations')
        .select(`
          id, 
          nome, 
          created_at,
          saas_subscriptions (
            status,
            saas_plans (nome)
          ),
          saas_billing_history (valor, status)
        `);

      if (orgData) {
        const formattedOrgs = orgData.map(org => {
          const sub = org.saas_subscriptions?.[0];
          // Handle case where saas_plans might be returned as an array or object depending on PostgREST version/config
          const planData = Array.isArray(sub?.saas_plans) ? sub?.saas_plans[0] : sub?.saas_plans;
          
          return {
            id: org.id,
            nome: org.nome,
            plan_nome: (planData as any)?.nome || 'Nenhum',
            status: sub?.status || 'Inativo',
            created_at: new Date(org.created_at).toLocaleDateString(),
            total_paid: org.saas_billing_history
              ?.filter(b => b.status === 'paid')
              .reduce((acc, curr) => acc + Number(curr.valor), 0) || 0
          };
        });
        setOrgs(formattedOrgs);
      }
    } catch (err) {
      console.error('Error loading SaaS admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrgs = orgs.filter(o => o.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container fade-in">
      <div className="admin-header-section animate-fade-in">
        <div>
          <h1>Gestão Estratégica SaaS</h1>
          <p className="text-muted">Monitoramento de receita, churn e saúde do ecossistema Pecuária 4.0</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Exportar Relatório</span>
          </button>
          <button className="btn-premium-solid indigo">
            <Zap size={18} strokeWidth={3} />
            <span>Ações Rápidas</span>
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card premium animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="metric-icon emerald">
            <TrendingUp size={24} strokeWidth={3} />
          </div>
          <div className="metric-details">
            <span className="label">MRR (Recorrência)</span>
            <div className="value-row">
              <span className="value">R$ {metrics?.mrr.toLocaleString('pt-BR') || '0,00'}</span>
              <span className="trend positive">+12%</span>
            </div>
            <span className="sublabel">Crescimento vs mês anterior</span>
          </div>
          <div className="metric-chart-mini">
             {/* Chart placeholder */}
          </div>
        </div>

        <div className="metric-card premium animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="metric-icon emerald">
            <CheckCircle2 size={24} strokeWidth={3} />
          </div>
          <div className="metric-details">
            <span className="label">Assinaturas Ativas</span>
            <div className="value-row">
              <span className="value">{metrics?.active_subscriptions || 0}</span>
              <span className="trend positive">+3</span>
            </div>
            <span className="sublabel">Base de clientes pagantes</span>
          </div>
        </div>

        <div className="metric-card premium animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="metric-icon emerald">
            <Building2 size={24} strokeWidth={3} />
          </div>
          <div className="metric-details">
            <span className="label">Total de Empresas</span>
            <div className="value-row">
              <span className="value">{metrics?.total_organizations || 0}</span>
            </div>
            <span className="sublabel">Unidades cadastradas no ecossistema</span>
          </div>
        </div>

        <div className="metric-card premium animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="metric-icon purple">
            <CreditCard size={24} strokeWidth={3} />
          </div>
          <div className="metric-details">
            <span className="label">Receita do Mês</span>
            <div className="value-row">
              <span className="value">R$ {metrics?.current_month_revenue.toLocaleString('pt-BR') || '0,00'}</span>
            </div>
            <span className="sublabel">Faturamento bruto liquidado</span>
          </div>
        </div>
      </div>

      <div className="admin-content-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="card-header-actions">
          <div className="header-title-group">
            <h3>Organizações & Billing</h3>
            <span className="badge-total">{filteredOrgs.length} Empresas</span>
          </div>
          <div className="filter-group">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Filtrar por organização..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-premium-outline btn-icon">
              <Filter size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="admin-table">
          <div className="table-row header">
            <span>Organização</span>
            <span>Plano Atual</span>
            <span>Status</span>
            <span>Gasto Total</span>
            <span>Data de Entrada</span>
            <span className="text-right">Ações</span>
          </div>

          {loading ? (
             <div className="loading-state">
                <Clock className="spinning" size={24} />
                <p>Analisando dados financeiros...</p>
             </div>
          ) : filteredOrgs.map(org => (
            <div key={org.id} className="table-row hover-row animate-slide-right">
              <div className="org-cell">
                <div className="org-avatar">
                   {org.nome.charAt(0)}
                </div>
                <div className="org-info">
                  <strong>{org.nome}</strong>
                  <span className="id-sub">ID: {org.id.split('-')[0]}</span>
                </div>
              </div>

              <div className="plan-cell">
                <span className={`plan-tag ${org.plan_nome.toLowerCase()}`}>
                  {org.plan_nome}
                </span>
              </div>

              <div className="status-cell">
                <span className={`status-pill ${org.status}`}>
                  {translateStatus(org.status)}
                </span>
              </div>

              <div className="value-cell">
                <strong>R$ {org.total_paid.toLocaleString('pt-BR')}</strong>
              </div>

              <div className="date-cell">
                {org.created_at}
              </div>

              <div className="actions-cell text-right">
                <button className="action-btn-global btn-view btn-icon-more">
                   <MoreVertical size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}

          {!loading && filteredOrgs.length === 0 && (
            <div className="empty-state">
              <AlertCircle size={40} />
              <p>Nenhuma organização encontrada para os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'active': 'Ativo',
    'trialing': 'Degustação',
    'canceled': 'Cancelado',
    'past_due': 'Inadimplente',
    'unpaid': 'Pendência Fatal'
  };
  return map[status] || status;
};

