import React from 'react';
import { CreditCard, Calendar, Activity } from 'lucide-react';
import { SaaSPlan, SaasSubscription } from '../../types';
import './SaasComponents.css';

interface SubscriptionStatusProps {
  subscription: SaasSubscription;
  plan: SaaSPlan;
  usage: {
    animals: number;
    users: number;
  };
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ subscription, plan, usage }) => {
  const animalPercentage = plan.limite_animais ? Math.min((usage.animals / plan.limite_animais) * 100, 100) : 0;
  const userPercentage = (usage.users / plan.limite_usuarios) * 100;

  return (
    <div className="sub-status-card animate-slide-up">
      <div className="sub-header">
        <div className="plan-info">
          <div className="plan-badge">PLANO {plan.nome.toUpperCase()}</div>
          <span className={`status-indicator ${subscription.status === 'active' ? 'enabled' : 'warning'}`}>
            {subscription.status === 'active' ? 'Assinatura Ativa' : 'Pendente'}
          </span>
        </div>
        <div className="next-billing">
          <Calendar size={16} />
          <span>Próximo vencimento: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="usage-stats">
        <div className="usage-item">
          <label>
            <span>Animais Cadastrados</span>
            <strong>{usage.animals} / {plan.limite_animais || '∞'}</strong>
          </label>
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${animalPercentage}%`, backgroundColor: animalPercentage > 90 ? '#ef4444' : '' }}></div>
          </div>
        </div>

        <div className="usage-item">
          <label>
            <span>Usuários Ativos</span>
            <strong>{usage.users} / {plan.limite_usuarios}</strong>
          </label>
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${Math.min(userPercentage, 100)}%`, backgroundColor: userPercentage > 90 ? '#ef4444' : '' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
