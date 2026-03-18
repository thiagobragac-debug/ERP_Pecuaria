import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Calculator, 
  Calendar, 
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { TablePagination } from '../../components/TablePagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import './PlanoContas.css';

interface Apuracao {
  id: string;
  imposto: string;
  periodo: string;
  valor: number;
  vencimento: string;
  status: 'Pago' | 'Pendente' | 'Vencido';
}

const mockApuracoes: Apuracao[] = [
  { id: '1', imposto: 'Funrural (Fev/24)', periodo: '01/02/2024 - 29/02/2024', valor: 12450.00, vencimento: '2024-03-20', status: 'Pendente' },
  { id: '2', imposto: 'ICMS Comercialização', periodo: '01/02/2024 - 29/02/2024', valor: 8900.50, vencimento: '2024-03-15', status: 'Pago' },
  { id: '3', imposto: 'IRRF S/ NF', periodo: 'Março/24', valor: 1200.00, vencimento: '2024-04-10', status: 'Pendente' },
];

export const Imposto = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    imposto: '',
    periodo: '',
    valor: '',
    vencimento: '',
    status: 'Todos'
  });

  const filteredApuracoes = mockApuracoes.filter(a => {
    const matchesSearch = 
      a.imposto.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.periodo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.valor.toString().includes(searchTerm) ||
      a.vencimento.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;

    const matchesColumnFilters = 
      (columnFilters.imposto === '' || a.imposto.toLowerCase().includes(columnFilters.imposto.toLowerCase())) &&
      (columnFilters.periodo === '' || a.periodo.toLowerCase().includes(columnFilters.periodo.toLowerCase())) &&
      (columnFilters.valor === '' || a.valor.toString().includes(columnFilters.valor)) &&
      (columnFilters.vencimento === '' || a.vencimento.includes(columnFilters.vencimento)) &&
      (columnFilters.status === 'Todos' || a.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesColumnFilters;
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: filteredApuracoes, initialItemsPerPage: 10 });

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge orange">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1>Apuração de Impostos</h1>
            <p className="description">Geração de guias, controle de Funrural, Senar e impostos sobre vendas.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline">
            <Calendar size={18} strokeWidth={3} />
            <span>Cronograma Fiscal</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => {}}>
            <Calculator size={18} strokeWidth={3} />
            <span>Nova Apuração</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Provisão Funrural</span>
            <span className="summary-value">R$ 45.8k</span>
            <span className="summary-subtext">Acumulado no ano</span>
          </div>
          <div className="summary-icon indigo">
            <Calculator size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">A Pagar (Mês)</span>
            <span className="summary-value text-orange">R$ 13.6k</span>
            <span className="summary-subtext">Vencimento próximo</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Pago (2024)</span>
            <span className="summary-value text-emerald">R$ 124.2k</span>
            <span className="summary-subtext">Obrigações quitadas</span>
          </div>
          <div className="summary-icon green">
            <CheckCircle2 size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Alertas Fiscais</span>
            <span className="summary-value text-red">02</span>
            <span className="summary-subtext">Pendências detectadas</span>
          </div>
          <div className="summary-icon red">
            <AlertCircle size={28} />
          </div>
        </div>
      </div>

      <div className="imposto-container">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por imposto ou competência..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
          <button className="btn-premium-outline h-11 px-6">
            <Download size={18} strokeWidth={3} />
            <span>Gerar PDF Guias</span>
          </button>
        </TableFilters>


        <table className="data-table">
          <thead>
            <tr>
              <th>Imposto / Guia</th>
              <th>Competência</th>
              <th>Valor Apurado</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'imposto', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'periodo', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'valor', type: 'text', placeholder: 'Valor...' },
                  { key: 'vencimento', type: 'text', placeholder: 'Data...' },
                  { key: 'status', type: 'select', options: ['Pago', 'Pendente', 'Vencido'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={true}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map(a => (
              <tr key={a.id}>
                <td className="font-bold">{a.imposto}</td>
                <td>{a.periodo}</td>
                <td>R$ {a.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>{new Date(a.vencimento).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={`status-badge ${a.status.toLowerCase()}`}>
                    {a.status}
                  </span>
                </td>
                <td className="text-right">
                  <button className="action-btn-global" title="Ver Guia"><FileText size={16} strokeWidth={3} /></button>
                  <button className="action-btn-global" title="Confirmar Pagamento"><CheckCircle2 size={16} strokeWidth={3} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          onPageChange={goToPage}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onItemsPerPageChange={setItemsPerPage}
          label="apurações"
        />
      </div>

      <div className="alert-box info p-6 glass">
        <div style={{ display: 'flex', gap: '16px' }}>
          <ShieldCheck size={24} className="text-indigo-500" />
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Conformidade Fiscal Garantida</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              O sistema monitora automaticamente as legislações vigentes para garantir que a apuração do Funrural e do Senar esteja de acordo com as últimas normas da Receita Federal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

