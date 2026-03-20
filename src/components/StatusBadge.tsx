import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  color?: 'emerald' | 'rose' | 'amber' | 'sky' | 'indigo';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'default',
  color,
  className = ''
}) => {
  // Mapping logic to normalize different status strings to types
  const getStatusType = () => {
    if (type !== 'default') return type;
    
    const s = status.toLowerCase();
    
    // Success patterns
    if (['pago', 'concluído', 'concluido', 'ativo', 'operacional', 'processado', 'sim'].includes(s)) return 'success';
    
    // Warning patterns
    if (['pendente', 'em curso', 'agendado', 'atenção', 'atrasado'].includes(s)) return 'warning';
    
    // Danger patterns
    if (['vencido', 'atrasado critico', 'cancelado', 'inativo', 'não', 'manutenção', 'manutencao'].includes(s)) return 'danger';
    
    // Info patterns
    if (['transferência', 'transferencia', 'aberto'].includes(s)) return 'info';
    
    return 'default';
  };

  const statusType = getStatusType();

  return (
    <span className={`status-badge-universal ${color || statusType} ${className}`}>
      {status}
    </span>
  );
};
