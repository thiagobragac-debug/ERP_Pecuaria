import React, { useState } from 'react';
import { Building2, ChevronDown, Check, Plus, Globe } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import './OrganizationSwitcher.css';

export const OrganizationSwitcher = () => {
  const { activeCompany, companies, setActiveCompanyId, activeCompanyId } = useCompany();
  const [isOpen, setIsOpen] = useState(false);

  if (companies.length === 0) return null;

  return (
    <div className="org-switcher-container">
      <button 
        className="org-switcher-button glass"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Building2 size={18} className="org-icon" />
        <div className="org-info-mini">
          <span className="org-label">Unidade Ativa</span>
          <span className="org-name-current">{activeCompanyId === 'Todas' ? 'Todas as Unidades' : activeCompany?.nomeFantasia || 'Selecionar...'}</span>
        </div>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="org-switcher-overlay" onClick={() => setIsOpen(false)} />
          <div className="org-switcher-dropdown glass floating">
            <div className="org-list">
              <button
                className={`org-item ${activeCompanyId === 'Todas' ? 'active' : ''}`}
                onClick={() => {
                  setActiveCompanyId('Todas');
                  setIsOpen(false);
                }}
              >
                <Globe size={16} />
                <span>Todas as Unidades</span>
                {activeCompanyId === 'Todas' && <Check size={14} className="check-icon" />}
              </button>

              {companies.map((company) => (
                <button
                  key={company.id}
                  className={`org-item ${activeCompanyId === company.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCompanyId(company.id);
                    setIsOpen(false);
                  }}
                >
                  <Building2 size={16} />
                  <span>{company.nomeFantasia}</span>
                  {activeCompanyId === company.id && <Check size={14} className="check-icon" />}
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
