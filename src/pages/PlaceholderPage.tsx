import { LucideIcon } from 'lucide-react';
import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  icon: LucideIcon;
  description?: string;
}

export const PlaceholderPage = ({ title, icon: Icon, description }: PlaceholderPageProps) => {
  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge">
            <Icon size={24} />
          </div>
          <div>
            <h1>{title}</h1>
            <p className="description">{description || 'Módulo em desenvolvimento'}</p>
          </div>
        </div>
        <div className="breadcrumb">
          <span>Início</span>
          <span className="separator">/</span>
          <span className="current">{title}</span>
        </div>
      </div>
      
      <div className="empty-state card glass">
        <Icon size={64} className="empty-icon" />
        <h2>Pronto para Implementação</h2>
        <p>Este módulo já está configurado na estrutura global do sistema. Os campos e funcionalidades específicas serão implementados na próxima etapa.</p>
        <button className="btn-primary">Configurar Módulo</button>
      </div>
    </div>
  );
};

