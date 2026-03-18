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
import './Compra.css';

export const Compra = () => {
  const location = useLocation();
  const isHubIndex = location.pathname === '/compras' || location.pathname === '/compras/';

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
            <span className="summary-value">12</span>
            <span className="summary-subtext">Aguardando aprovação</span>
          </div>
          <div className="summary-icon blue">
            <ShoppingCart size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Cotações Ativas</span>
            <span className="summary-value">05</span>
            <span className="summary-subtext">Em negociação</span>
          </div>
          <div className="summary-icon primary">
            <TrendingUp size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Compras (Mês)</span>
            <span className="summary-value">R$ 145k</span>
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

