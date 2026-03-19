import React, { useState, useMemo } from 'react';
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
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { TaxApuracao } from '../../types';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { usePagination } from '../../hooks/usePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { dataService } from '../../services/dataService';
import { useCompany } from '../../contexts/CompanyContext';
import './PlanoContas.css';

export const Imposto = () => {
  const { activeCompanyId } = useCompany();
  const allApuracoes = useLiveQuery(() => db.apuracoes_impostos.toArray()) || [];
  
  // Filter by active company
  const apuracoes = allApuracoes.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TaxApuracao>>({
    imposto: 'Funrural',
    periodo: '',
    valor: 0,
    vencimento: new Date().toISOString().split('T')[0],
    status: 'Pendente'
  });
  const [columnFilters, setColumnFilters] = useState({
    imposto: '',
    periodo: '',
    valor: '',
    vencimento: '',
    status: 'Todos'
  });

  const filteredApuracoes = useMemo(() => {
    return (apuracoes || []).filter((a: TaxApuracao) => {
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
  }, [apuracoes, searchTerm, filterStatus, columnFilters]);

  const summary = useMemo(() => {
    const funrural = filteredApuracoes.filter((a: TaxApuracao) => a.imposto.toLowerCase().includes('funrural')).reduce((acc: number, current: TaxApuracao) => acc + current.valor, 0);
    const aPagar = filteredApuracoes.filter((a: TaxApuracao) => a.status === 'Pendente').reduce((acc: number, current: TaxApuracao) => acc + current.valor, 0);
    const totalPago = filteredApuracoes.filter((a: TaxApuracao) => a.status === 'Pago').reduce((acc: number, current: TaxApuracao) => acc + current.valor, 0);
    const alertas = filteredApuracoes.filter((a: TaxApuracao) => a.status === 'Vencido').length;

    return {
      funrural,
      aPagar,
      totalPago,
      alertas
    };
  }, [apuracoes]);

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
      <nav className="subpage-breadcrumb">
        <Link to="/contabil/plano">Contabilidade & Fiscal</Link>
        <ChevronRight size={14} />
        <span>Impostos</span>
      </nav>

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
          <button className="btn-premium-solid indigo" onClick={() => setIsModalOpen(true)}>
            <Calculator size={18} strokeWidth={3} />
            <span>Nova Apuração</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Provisão Funrural</span>
            <span className="summary-value">R$ {(summary.funrural / 1000).toFixed(1)}k</span>
            <span className="summary-subtext">Acumulado no ano</span>
          </div>
          <div className="summary-icon indigo">
            <Calculator size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">A Pagar (Mês)</span>
            <span className="summary-value text-orange">R$ {(summary.aPagar / 1000).toFixed(1)}k</span>
            <span className="summary-subtext">Vencimento próximo</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Total Pago (Geral)</span>
            <span className="summary-value text-emerald">R$ {(summary.totalPago / 1000).toFixed(1)}k</span>
            <span className="summary-subtext">Obrigações quitadas</span>
          </div>
          <div className="summary-icon green">
            <CheckCircle2 size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Alertas Fiscais</span>
            <span className="summary-value text-red">{summary.alertas.toString().padStart(2, '0')}</span>
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
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Apuração de Imposto"
        subtitle="Calcule e gere guias de impostos incidentes sobre a operação"
        icon={Calculator}
        size="md"
        footer={
          <div className="flex gap-3">
            <button className="btn-premium-outline px-8" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button 
              className="btn-premium-solid indigo px-8" 
              onClick={() => {
                dataService.saveItem('apuracoes_impostos', { 
                  ...formData, 
                  id: Math.random().toString(36).substr(2, 9),
                  empresaId: activeCompanyId === 'Todas' ? undefined : activeCompanyId,
                  tenant_id: 'default' 
                });
                setIsModalOpen(false);
              }}
            >
              Confirmar Apuração
            </button>
          </div>
        }
      >
        <div className="form-grid">
          <div className="form-group col-12">
            <label>Imposto / Guia</label>
            <select 
              value={formData.imposto} 
              onChange={(e) => setFormData({...formData, imposto: e.target.value})}
            >
              <option value="Funrural">Funrural</option>
              <option value="SENAR">SENAR</option>
              <option value="ICMS">ICMS</option>
              <option value="IRRF">IRRF</option>
              <option value="ITR">ITR</option>
            </select>
          </div>
          <div className="form-group col-12">
            <label>Competência (Mês/Ano)</label>
            <input 
              type="text" 
              placeholder="Ex: 03/2026" 
              value={formData.periodo}
              onChange={(e) => setFormData({...formData, periodo: e.target.value})}
            />
          </div>
          <div className="form-group col-6">
            <label>Valor Apurado</label>
            <input 
              type="number" 
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: Number(e.target.value)})}
            />
          </div>
          <div className="form-group col-6">
            <label>Data de Vencimento</label>
            <input 
              type="date" 
              value={formData.vencimento}
              onChange={(e) => setFormData({...formData, vencimento: e.target.value})}
            />
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

