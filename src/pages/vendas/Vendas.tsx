import { useLocation, Outlet, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Target, 
  ChevronRight,
  Handshake, 
  BarChart3,
  FileText
} from 'lucide-react';
import { useOfflineQuery } from '../../hooks/useOfflineSync';
import { SummaryCard } from '../../components/SummaryCard';
import { useCompany } from '../../contexts/CompanyContext';
import { SalesInvoice, Opportunity } from '../../types';
import './Vendas.css';

export const Vendas = () => {
  const { activeCompanyId } = useCompany();
  const location = useLocation();
  const isHubHome = location.pathname === '/vendas' || location.pathname === '/vendas/';

  const { data: allNotas = [] } = useOfflineQuery<SalesInvoice>(['pedidos_venda'], 'pedidos_venda');
  const { data: allOportunidades = [] } = useOfflineQuery<Opportunity>(['oportunidades'], 'oportunidades');

  // Filter by active company
  const notas = allNotas.filter(n => activeCompanyId === 'Todas' || n.empresaId === activeCompanyId);
  const oportunidades = allOportunidades.filter(o => activeCompanyId === 'Todas' || (o as any).empresaId === activeCompanyId);

  // Metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const notasMes = notas.filter(n => {
    const dateStr = n.dataEmissao || n.data || (n as any).date || '';
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const vgvTotal = notasMes.reduce((sum, n) => sum + (n.valorTotal || 0), 0);
  const ticketMedio = notasMes.length > 0 ? vgvTotal / notasMes.length : 0;

  const openOppsValue = oportunidades
    .filter(o => o.estagio !== 'Fechado' && o.estagio !== 'Perdido')
    .reduce((sum, o) => sum + (o.valor || 0), 0);

  return isHubHome ? (
    <div className="vendas-hub page-container fade-in">
      <nav className="subpage-breadcrumb">
        <span>Vendas & Comercial</span>
        <ChevronRight size={14} />
        <span>Vendas</span>
      </nav>
      <div className="page-header-row mb-8">
        <div className="title-section">
          <div className="icon-badge indigo">
            <TrendingUp size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Venda & CRM</h1>
            <p className="description">Gestão comercial, pipeline de vendas e relacionamento com clientes.</p>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="VGV (Mês Corrente)"
          value={`R$ ${vgvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={BarChart3}
          color="emerald"
          delay="0.1s"
          subtext={`Ticket Médio: R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={{ value: 'Acima da média', type: 'up', icon: TrendingUp }}
        />
        <SummaryCard 
          label="Volume no Pipeline"
          value={`R$ ${openOppsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Target}
          color="sky"
          delay="0.2s"
          subtext={`${oportunidades.filter(o => o.estagio !== 'Fechado' && o.estagio !== 'Perdido').length} oportunidades ativas`}
        />
        <SummaryCard 
          label="Taxa de Conversão"
          value={`${oportunidades.length > 0
            ? ((oportunidades.filter(o => o.estagio === 'Fechado').length / oportunidades.length) * 100).toFixed(1)
            : '0.0'}%`}
          icon={TrendingUp}
          color="amber"
          delay="0.3s"
          subtext={`Base: ${oportunidades.length} leads`}
        />
      </div>

      <div className="submodule-menu-grid">
        <Link to="/vendas/clientes" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="submodule-icon purple">
            <Users size={32} />
          </div>
          <div className="submodule-info">
            <h3>Cadastro de Clientes</h3>
            <p>Gerencie sua base de clientes, parceiros e contatos.</p>
          </div>
          <ChevronRight className="arrow" />
        </Link>

        <Link to="/vendas/pedidos" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="submodule-icon indigo">
            <TrendingUp size={32} />
          </div>
          <div className="submodule-info">
            <h3>Pedidos de Venda</h3>
            <p>Gestão comercial, pedidos de gado e faturamento.</p>
          </div>
          <ChevronRight className="arrow" />
        </Link>

        <Link to="/vendas/notas-fiscais" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="submodule-icon blue">
            <FileText size={32} />
          </div>
          <div className="submodule-info">
            <h3>Notas de Saída (Fiscal)</h3>
            <p>Emissão de NF-e, faturamento e controle de saídas.</p>
          </div>
          <ChevronRight className="arrow" />
        </Link>

        <Link to="/vendas/contratos" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="submodule-icon orange">
            <Handshake size={32} />
          </div>
          <div className="submodule-info">
            <h3>Contratos & Mercado Futuro</h3>
            <p>Hedge, proteção de preço e contratos a termo.</p>
          </div>
          <ChevronRight className="arrow" />
        </Link>

        <Link to="/vendas/oportunidades" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="submodule-icon indigo">
            <Target size={32} />
          </div>
          <div className="submodule-info">
            <h3>Oportunidades (CRM)</h3>
            <p>Funil de vendas e acompanhamento de propostas.</p>
          </div>
          <ChevronRight className="arrow" />
        </Link>
      </div>
    </div>
  ) : (
    <div className="page-container fade-in">
      <Outlet />
    </div>
  );
};
