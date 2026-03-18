import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Target, 
  ChevronRight,
  Handshake,
  BarChart3,
  FileText
} from 'lucide-react';
import './Vendas.css';

export const Vendas = () => {
  const location = useLocation();
  const isHubHome = location.pathname === '/vendas' || location.pathname === '/vendas/';

  return isHubHome ? (
    <div className="vendas-hub page-container">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1>Venda & CRM</h1>
            <p className="description">Gestão comercial, pipeline de vendas e relacionamento com clientes.</p>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Vendas no Mês</span>
            <span className="summary-value">R$ 2.450.000</span>
            <span className="summary-subtext">12% acima da meta</span>
          </div>
          <div className="summary-icon green">
            <BarChart3 size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Novos Clientes</span>
            <span className="summary-value">24</span>
            <span className="summary-subtext">Últimos 30 dias</span>
          </div>
          <div className="summary-icon blue">
            <Users size={24} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Oportunidades</span>
            <span className="summary-value">15</span>
            <span className="summary-subtext">No funil de vendas</span>
          </div>
          <div className="summary-icon orange">
            <Target size={24} />
          </div>
        </div>
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

        <Link to="/vendas/notas-saida" className="submodule-card card glass hover-effect animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="submodule-icon blue">
            <FileText size={32} />
          </div>
          <div className="submodule-info">
            <h3>Notas de Saída (Fiscal)</h3>
            <p>Emissão de NF-e, faturamento e controle de saídas.</p>
          </div>
          <ChevronRight className="arrow" />
        </Link>

        <div className="submodule-card card glass placeholder animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="submodule-icon blue">
            <Handshake size={32} />
          </div>
          <div className="submodule-info">
            <h3>Oportunidades (CRM)</h3>
            <p>Funil de vendas e acompanhamento de propostas.</p>
          </div>
          <span className="badge">Em breve</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="vendas-subpage fade-in">
      <div className="subpage-breadcrumb page-container" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/vendas">Venda & CRM</Link>
          <ChevronRight size={14} />
          <span>{location.pathname.split('/').pop()?.replace(/^\w/, (c) => c.toUpperCase())}</span>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

