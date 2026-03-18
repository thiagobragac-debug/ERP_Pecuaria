import React from 'react';
import { Search, Filter } from 'lucide-react';
import './TableFilters.css';

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  actionsLabel?: string;
  hideActions?: boolean;
  onToggleAdvanced?: () => void;
  isAdvancedOpen?: boolean;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar...",
  children,
  actionsLabel = "Filtragem",
  hideActions = false,
  onToggleAdvanced,
  isAdvancedOpen
}) => {
  return (
    <div className="table-filters-global">
      <div className="search-input-wrapper-global">
        <Search size={18} className="search-icon-global" />
        <input 
          type="text" 
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-field-global"
        />
      </div>
      
      {!hideActions && (
        <div className="filter-actions-global">
          <span className="actions-label-global">{actionsLabel}</span>
          {onToggleAdvanced && (
            <button 
              className={`btn-premium-outline h-11 px-6 gap-2 ${isAdvancedOpen ? 'filter-active' : ''}`} 
              onClick={onToggleAdvanced}
            >
              <Filter size={18} strokeWidth={3} />
              <span>{isAdvancedOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
};
