import React, { useState } from 'react';
import { 
  LayoutList, 
  TrendingUp, 
  Target, 
  ShieldAlert, 
  ArrowRight,
  Calculator,
  PieChart,
  BarChart3,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import './PlanoContas.css';

export const PlanejamentoFiscal = () => {
  return (
    <div className="planejamento-wrapper fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge violet">
            <LayoutList size={32} />
          </div>
          <div>
            <h1>Planejamento Tributário</h1>
            <p className="description">Simulação de regimes tributários e estratégias de elisão fiscal legal para o agronegócio.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-solid indigo">
            <Calculator size={18} strokeWidth={3} />
            <span>Simular Novo Cenário</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Economia Projetada</span>
            <span className="summary-value text-indigo">R$ 84.5k</span>
            <span className="summary-subtext">Cenário: Pessoa Jurídica</span>
          </div>
          <div className="summary-icon indigo">
            <TrendingUp size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Carga Tributária Atual</span>
            <span className="summary-value">12.4%</span>
            <span className="summary-subtext">Sobre faturamento líquido</span>
          </div>
          <div className="summary-icon orange">
            <PieChart size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Ponto de Equilíbrio</span>
            <span className="summary-value">R$ 1.2M</span>
            <span className="summary-subtext">Para migração de regime</span>
          </div>
          <div className="summary-icon blue">
            <BarChart3 size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Score de Risco</span>
            <span className="summary-value text-emerald">Baixo</span>
            <span className="summary-subtext">Conformidade SEFAZ/RFB</span>
          </div>
          <div className="summary-icon green">
            <ShieldAlert size={28} />
          </div>
        </div>
      </div>

      <div className="scenarios-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        <div className="scenario-card card glass p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Cenário 01: Pessoa Física (Produtor)</h3>
            <span className="status-badge" style={{ background: 'var(--bg-light)', color: 'var(--text-muted)' }}>Atual</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Alíquota Efetiva:</span>
              <strong>27,5% (Incidente sobre 20%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Funrural:</span>
              <strong>1,5% s/ faturamento</strong>
            </div>
            <div className="divider" style={{ borderTop: '1px dashed var(--border-color)', margin: '12px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
              <span>Total Estimado Ano:</span>
              <strong className="text-red">R$ 450.000,00</strong>
            </div>
          </div>
        </div>

        <div className="scenario-card card glass p-6" style={{ border: '2px solid var(--primary-indigo)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Cenário 02: Holding Rural (PJ)</h3>
            <span className="status-badge status-ativo">Recomendado</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Alíquota IRPJ/CSLL:</span>
              <strong>Presumido (~6,2%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Funrural (Folha):</span>
              <strong>Opcional Gerencial</strong>
            </div>
            <div className="divider" style={{ borderTop: '1px dashed var(--border-color)', margin: '12px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
              <span>Total Estimado Ano:</span>
              <strong className="text-emerald">R$ 365.500,00</strong>
            </div>
          </div>
          <div className="mt-4 p-3 rounded" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#166534', fontSize: '0.85rem' }}>
            <Lightbulb size={16} className="inline mr-2" />
            Economia potencial de <strong>R$ 84.500,00</strong> ao ano.
          </div>
        </div>
      </div>

      <div className="insights-section card glass p-6">
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700 }}>Insights Estratégicos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div className="insight-item">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Target size={18} className="text-indigo-500" /> Distribuição de Dividendos
            </h4>
            <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              A migração para o regime de lucro presumido permite a retirada de lucros isentos em níveis superiores à tributação da pessoa física tradicional.
            </p>
          </div>
          <div className="insight-item">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldAlert size={18} className="text-orange-500" /> Blindagem Patrimonial
            </h4>
            <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              Além da economia fiscal, a estrutura de PJ oferece maior segurança para o imobilizado (terras e máquinas) em processos sucessórios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

