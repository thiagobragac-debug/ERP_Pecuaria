import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onItemsPerPageChange: (items: number) => void;
  className?: string;
  label?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
  onNextPage,
  onPrevPage,
  onItemsPerPageChange,
  className = '',
  label = 'registros'
}) => {
  const pageOptions = [5, 10, 20, 50];

  return (
    <div className={`table-pagination ${className}`}>
      <div className="pagination-info-wrapper">
        <span className="pagination-info">
          Mostrando {startIndex}-{endIndex} de {totalItems} {label}
        </span>
        
        <div className="items-per-page">
          <label htmlFor="itemsPerPage">Exibir:</label>
          <select 
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="pagination-select"
          >
            {pageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pagination-controls">
        <button 
          className="pagination-btn-global" 
          onClick={onPrevPage} 
          disabled={currentPage === 1}
          title="Página Anterior"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              className={`pagination-btn-global ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          className="pagination-btn-global" 
          onClick={onNextPage} 
          disabled={currentPage === totalPages}
          title="Próxima Página"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
