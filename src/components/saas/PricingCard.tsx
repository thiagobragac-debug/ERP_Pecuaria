import React from 'react';
import { Check, Info } from 'lucide-react';
import { SaaSPlan } from '../../types';
import './SaasComponents.css';

interface PricingCardProps {
  plan: SaaSPlan;
  isCurrent?: boolean;
  featured?: boolean;
  onSelect: (plan: SaaSPlan) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isCurrent, featured, onSelect }) => {
  return (
    <div className={`pricing-card ${featured ? 'featured' : ''}`}>
      {featured && <div className="badge-popular">MAIS ESCOLHIDO</div>}
      
      <div className="pricing-header">
        <h3>{plan.nome}</h3>
        <p>{plan.descricao}</p>
      </div>

      <div className="pricing-price">
        <span className="currency">R$</span>
        <span className="amount">{plan.preco_mensal.toLocaleString('pt-BR')}</span>
        <span className="period">/mês</span>
      </div>

      <ul className="pricing-features">
        <li>
          <Check size={18} className="check-icon" />
          <span>Até {plan.limite_animais || 'Ilimitados'} animais</span>
        </li>
        <li>
          <Check size={18} className="check-icon" />
          <span>{plan.limite_usuarios} usuários inclusos</span>
        </li>
        {plan.features.map((feature, idx) => (
          <li key={idx}>
            <Check size={18} className="check-icon" />
            <span>{translateFeature(feature)}</span>
          </li>
        ))}
      </ul>

      <button 
        className={`btn-plan ${isCurrent || featured ? 'primary' : 'secondary'}`}
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
      >
        {isCurrent ? 'Plano Atual' : 'Selecionar Plano'}
      </button>
    </div>
  );
};

const translateFeature = (feature: string) => {
  const map: Record<string, string> = {
    'herd_management': 'Gestão Completa de Rebanho',
    'basic_finance': 'Financeiro Básico (Contas)',
    'advanced_finance': 'Fluxo de Caixa & DRE',
    'nutrition_module': 'Nutrição & Confinamento',
    'full_access': 'Acesso a Todos os Módulos',
    'predictive_ai': 'IA preditiva de Ganho de Peso',
    'premium_support': 'Suporte Consultivo 24/7'
  };
  return map[feature] || feature;
};
