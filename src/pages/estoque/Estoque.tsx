import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  ClipboardList, 
  AlertTriangle,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import './Estoque.css';

export const Estoque = () => {
  const location = useLocation();
  const isHubHome = location.pathname === '/estoque' || location.pathname === '/estoque/';

  return (
    <div className="page-container fade-in">
      {isHubHome ? (
        <div className="estoque-hub">
          <div className="page-header-row">
            <div className="title-section">
              <div className="icon-badge indigo">
                <Package size={32} strokeWidth={3} />
              </div>
              <div>
                <h1>Gestão de Estoque & Inventário</h1>
                <p className="description">Visão central do almoxarifado, insumos e movimentações estratégicas.</p>
              </div>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-card card glass animate-slide-up">
              <div className="summary-info">
                <span className="summary-label">Valor Total Imobilizado</span>
                <span className="summary-value">R$ 142.500,00</span>
                <span className="summary-subtext">Inventário atualizado</span>
              </div>
              <div className="summary-icon blue">
                <Package size={32} strokeWidth={3} />
              </div>
            </div>
            <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="summary-info">
                <span className="summary-label">Alertas de Reposição</span>
                <span className="summary-value">08</span>
                <span className="summary-trend down">
                  <AlertTriangle size={14} /> Requer Atenção
                </span>
              </div>
              <div className="summary-icon red">
                <TrendingDown size={32} strokeWidth={3} />
              </div>
            </div>
            <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="summary-info">
                <span className="summary-label">Movimentações (Mês)</span>
                <span className="summary-value">124</span>
                <span className="summary-subtext">Saídas vs Entradas</span>
                </div>
                <div className="summary-icon blue">
                <ArrowLeftRight size={32} strokeWidth={3} />
                </div>
            </div>
          </div>

          <div className="submodule-menu-grid">
            <Link to="/estoque/insumos" className="submodule-card glass hover-effect animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="submodule-icon purple">
                <Boxes size={32} strokeWidth={3} />
              </div>
              <div className="submodule-info">
                <h3>Cadastro de Insumos</h3>
                <p>Gerencie produtos, medicamentos, sêmen e rações.</p>
              </div>
              <ChevronRight className="arrow" />
            </Link>

            <Link to="/estoque/movimentacao" className="submodule-card glass hover-effect animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="submodule-icon blue">
                <ArrowLeftRight size={32} strokeWidth={3} />
              </div>
              <div className="submodule-info">
                <h3>Movimentação Manual</h3>
                <p>Entradas por NF e saídas para tratamento/trato.</p>
              </div>
              <ChevronRight className="arrow" />
            </Link>

            <Link to="/estoque/inventario" className="submodule-card glass hover-effect animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="submodule-icon orange">
                <ClipboardList size={32} strokeWidth={3} />
              </div>
              <div className="submodule-info">
                <h3>Inventário Periódico</h3>
                <p>Ajustes de estoque e auditoria de galpão.</p>
              </div>
              <ChevronRight className="arrow" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="estoque-subpage">
           <div className="subpage-breadcrumb">
                <Link to="/estoque">Estoque</Link>
                <ChevronRight size={14} />
                <span>{location.pathname.split('/').pop()?.replace(/^\w/, (c) => c.toUpperCase())}</span>
           </div>
           <Outlet />
        </div>
      )}
    </div>
  );
};

