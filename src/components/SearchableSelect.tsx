import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  label,
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className={`searchable-select-container ${disabled ? 'disabled' : ''}`} ref={containerRef}>
      {label && <label className="form-label">{label} {required && <span className="text-red-500">*</span>}</label>}
      <div 
        className={`searchable-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
      >
        <div className="flex-1 flex items-center min-w-0">
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="searchable-select-input"
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`truncate ${!selectedOption ? 'placeholder' : 'font-semibold text-slate-900'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          {searchTerm && isOpen && (
            <button 
              className="hover:text-indigo-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSearchTerm('');
                inputRef.current?.focus();
              }}
            >
              <X size={14} />
            </button>
          )}
          {isOpen ? <Search size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="arrow" />}
        </div>
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown animate-scale-in">
          <div className="options-list scrollable">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id} 
                  className={`option-item ${opt.id === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="option-content">
                    <span className="option-label">{opt.label}</span>
                    {opt.sublabel && <span className="option-sublabel">{opt.sublabel}</span>}
                  </div>
                  {opt.id === value && <Check size={16} className="check-icon" />}
                </div>
              ))
            ) : (
              <div className="no-options">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
      
      <input type="hidden" value={value} required={required} />
    </div>
  );
};
