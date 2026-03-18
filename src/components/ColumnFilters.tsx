import React from 'react';
import './ColumnFilters.css';

export interface ColumnFilterConfig {
  key: string;
  type: 'text' | 'select' | 'empty';
  options?: string[];
  placeholder?: string;
}

interface ColumnFiltersProps {
  columns: ColumnFilterConfig[];
  values: { [key: string]: string };
  onChange: (key: string, value: string) => void;
  showActionsPadding?: boolean;
}

export const ColumnFilters: React.FC<ColumnFiltersProps> = ({ 
  columns, 
  values, 
  onChange,
  showActionsPadding = true 
}) => {
  return (
    <tr className="column-filters-row">
      {columns.map((col) => (
        <th key={col.key} className="column-filter-cell">
          {col.type === 'text' ? (
            <input
              type="text"
              value={values[col.key] || ''}
              onChange={(e) => onChange(col.key, e.target.value)}
              placeholder={col.placeholder || "Filtrar..."}
              className="column-filter-input"
            />
          ) : col.type === 'select' ? (
            <select
              value={values[col.key] || 'Todos'}
              onChange={(e) => onChange(col.key, e.target.value)}
              className="column-filter-select"
            >
              <option value="Todos">Todos</option>
              {col.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : null}
        </th>
      ))}
      {showActionsPadding && <th className="column-filter-cell"></th>}
    </tr>
  );
};
