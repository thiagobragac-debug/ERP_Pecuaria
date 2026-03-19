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
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import './Vendas.css';

export const Vendas = () => {
  const location = useLocation();
  const isHubHome = location.pathname === '/vendas' || location.pathname === '/vendas/';

  // Data
  const notas = useLiveQuery(() => db.pedidos_venda.toArray()) || [];
  const oportunidades = useLiveQuery(() => db.oportunidades.toArray()) || [];

  // Metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const notasMes = notas.filter(n => {
    const date = new Date(n.dataEmissao || (n as any).data);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const vgvTotal = notasMes.reduce((sum, n) => sum + (n.valorTotal || 0), 0);
  const ticketMedio = notasMes.length > 0 ? vgvTotal / notasMes.length : 0;
  
  const openOppsValue = oportunidades
    .filter(o => o.estagio !== 'Fechado' && o.estagio !== 'Perdido')
    .reduce((sum, o) => sum + (o.valor || 0), 0);

  return isHubHome ? (
    <div className="vendas-hub page-container">
      <div className="page-header-row">
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
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">VGV (Mês Corrente)</span>
            <span className="summary-value">R$ {vgvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="summary-subtext">Ticket Médio: R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-icon green">
            <BarChart3 size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Volume no Pipeline</span>
            <span className="summary-value">R$ {openOppsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="summary-subtext">{oportunidades.filter(o => o.estagio !== 'Fechado' && o.estagio !== 'Perdido').length} oportunidades ativas</span>
          </div>
          <div className="summary-icon blue">
            <Target size={32} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Taxa de Conversão</span>
            <span className="summary-value">
              {oportunidades.length > 0 
                ? ((oportunidades.filter(o => o.estagio === 'Fechado').length / oportunidades.length) * 100).toFixed(1)
                : '0.0'}%
            </span>
            <span className="summary-subtext">Base: {oportunidades.length} leads</span>
          </div>
          <div className="summary-icon orange">
            <TrendingUp size={32} strokeWidth={3} />
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

