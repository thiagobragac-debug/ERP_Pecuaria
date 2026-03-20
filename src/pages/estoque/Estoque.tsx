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
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import './Estoque.css';
import { useOfflineQuery } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Insumo as InsumoType, MovimentacaoEstoque as MovimentacaoType } from '../../types';
import { SummaryCard } from '../../components/SummaryCard';

export const Estoque = () => {
  const location = useLocation();
  const isHubHome = location.pathname === '/estoque' || location.pathname === '/estoque/';

  const isOnline = useOnlineStatus();
  const { data: insumos = [] } = useOfflineQuery<InsumoType>(['insumos'], 'insumos');
  const { data: movimentacoes = [] } = useOfflineQuery<MovimentacaoType>(['movimentacoes_estoque'], 'movimentacoes_estoque');

  // Calculate stats
  const valorTotal = insumos.reduce((acc, i) => acc + (i.estoqueAtual * i.valorUnitario), 0);
  const alertasReposicao = insumos.filter(i => i.estoqueAtual <= i.estoqueMinimo).length;
  
  // Filter movements for current month
  const now = new Date();
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const movMes = movimentacoes.filter(m => new Date(m.data) >= firstDayMonth).length;

  return (
    <div className="page-container fade-in">

      {isHubHome ? (
        <div className="estoque-hub">
          <nav className="subpage-breadcrumb">
            <Link to="/estoque">Estoque & Inventário</Link>
            <ChevronRight size={14} />
            <span>Visão Geral</span>
          </nav>

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
            <div className="connectivity-section mr-4">
              <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
                <ArrowLeftRight size={12} />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div className="summary-grid">
            <SummaryCard 
              label="Valor Total Imobilizado"
              value={`R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtext="Inventário atualizado"
              icon={Package}
              color="indigo"
              delay="0s"
            />
            <SummaryCard 
              label="Alertas de Reposição"
              value={alertasReposicao.toString().padStart(2, '0')}
              trend={{ 
                value: 'Requer Atenção', 
                type: 'down', 
                icon: AlertTriangle 
              }}
              icon={TrendingDown}
              color="rose"
              delay="0.1s"
            />
            <SummaryCard 
              label="Movimentações (Mês)"
              value={movMes.toString()}
              subtext="Saídas vs Entradas"
              icon={ArrowLeftRight}
              color="sky"
              delay="0.2s"
            />
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
           <Outlet />
        </div>
      )}
    </div>
  );
};

