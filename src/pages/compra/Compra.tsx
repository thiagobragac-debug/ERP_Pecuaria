import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  TrendingUp, 
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  History
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { useCompany } from '../../contexts/CompanyContext';
import './Compra.css';

export const Compra = () => {
  const { activeCompanyId } = useCompany();
  const location = useLocation();
  const isHubIndex = location.pathname === '/compras' || location.pathname === '/compras/';

  const allSolicitacoes = useLiveQuery(() => db.solicitacoes_compra.toArray()) || [];
  const allCotacoes = useLiveQuery(() => db.mapas_cotacao.toArray()) || [];
  const allPedidos = useLiveQuery(() => db.pedidos_compra.toArray()) || [];

  const solicitacoes = allSolicitacoes.filter(s => activeCompanyId === 'Todas' || (s as any).empresaId === activeCompanyId);
  const cotacoes = allCotacoes.filter(c => activeCompanyId === 'Todas' || (c as any).empresaId === activeCompanyId);
  const pedidos = allPedidos.filter(p => activeCompanyId === 'Todas' || p.empresaId === activeCompanyId);

  const pendingOrders = pedidos.filter(p => p.status === 'Pendente').length;
  const activeQuotes = cotacoes.filter(c => c.status === 'Em Aberto' || c.status === 'Em Análise').length;
  const totalMonth = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);

  if (!isHubIndex) {
    return <Outlet />;
  }

  return (
    <div className="compra-hub page-container">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <ShoppingCart size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Compra & Cotação</h1>
            <p className="description">Gestão de suprimentos, fornecedores e ordens de compra.</p>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Pedidos Pende.</span>
            <span className="summary-value">{pendingOrders.toString().padStart(2, '0')}</span>
            <span className="summary-subtext">Aguardando aprovação</span>
          </div>
          <div className="summary-icon blue">
            <ShoppingCart size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Cotações Ativas</span>
            <span className="summary-value">{activeQuotes.toString().padStart(2, '0')}</span>
            <span className="summary-subtext">Em negociação</span>
          </div>
          <div className="summary-icon primary">
            <TrendingUp size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Compras (Mês)</span>
            <span className="summary-value">R$ {(totalMonth / 1000).toFixed(0)}k</span>
            <span className="summary-subtext">Volume de suprimentos</span>
          </div>
          <div className="summary-icon orange">
            <CreditCard size={32} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="submodule-menu-grid">
        <Link to="/compras/fornecedores" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="submodule-icon blue">
            <Truck size={32} strokeWidth={3} />
          </div>
          <div className="submodule-info">
            <h3>Fornecedores</h3>
            <p>Gerencie sua rede de parceiros e fornecedores.</p>
          </div>
          <ChevronRight className="arrow" size={20} />
        </Link>

        <Link to="/compras/solicitacoes" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="submodule-icon purple">
            <FileText size={32} strokeWidth={3} />
          </div>
          <div className="submodule-info">
            <h3>Solicitação</h3>
            <p>Registre e acompanhe pedidos de suprimentos.</p>
          </div>
          <ChevronRight className="arrow" size={20} />
        </Link>

        <Link to="/compras/cotacoes" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="submodule-icon orange">
            <TrendingUp size={32} strokeWidth={3} />
          </div>
          <div className="submodule-info">
            <h3>Mapa de Cotação</h3>
            <p>Compare preços e escolha os melhores fornecedores.</p>
          </div>
          <ChevronRight className="arrow" size={20} />
        </Link>

        <Link to="/compras/pedidos" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="submodule-icon purple">
            <Package size={32} strokeWidth={3} />
          </div>
          <div className="submodule-info">
            <h3>Pedidos de Compra</h3>
            <p>Emita e controle suas ordens de fornecimento.</p>
          </div>
          <ChevronRight className="arrow" size={20} />
        </Link>

        <Link to="/compras/notas-entrada" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="submodule-icon blue">
            <FileText size={32} strokeWidth={3} />
          </div>
          <div className="submodule-info">
            <h3>Notas de Entrada</h3>
            <p>Registro fiscal e entrada física de mercadorias.</p>
          </div>
          <ChevronRight className="arrow" size={20} />
        </Link>
      </div>
    </div>
  );
};

