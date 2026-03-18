import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import './OrganizationSwitcher.css';

export const OrganizationSwitcher = () => {
  const { currentOrg, userOrgs, switchOrg } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentOrg && userOrgs.length === 0) return null;

  return (
    <div className="org-switcher-container">
      <button 
        className="org-switcher-button glass"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Building2 size={18} className="org-icon" />
        <div className="org-info-mini">
          <span className="org-label">Empresa Ativa</span>
          <span className="org-name-current">{currentOrg?.nome || 'Selecionar...'}</span>
        </div>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="org-switcher-overlay" onClick={() => setIsOpen(false)} />
          <div className="org-switcher-dropdown glass floating">
            <div className="dropdown-header">
              <span>Suas Empresas</span>
            </div>
            
            <div className="org-list">
              {userOrgs.map((org) => (
                <button
                  key={org.id}
                  className={`org-item ${currentOrg?.id === org.id ? 'active' : ''}`}
                  onClick={() => {
                    switchOrg(org.id);
                    setIsOpen(false);
                  }}
                >
                  <Building2 size={16} />
                  <span>{org.nome}</span>
                  {currentOrg?.id === org.id && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>

            <div className="dropdown-footer">
              <button className="add-org-btn">
                <Plus size={14} />
                <span>Nova Empresa</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
