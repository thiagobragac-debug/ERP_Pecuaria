import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Search,
  Filter,
  Package,
  Activity,
  ChevronRight,
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import './AlertasCareencia.css';
import { mockRegistrosSanitarios as mockRegistros, mockAnimals } from '../../data/mockData';
import { Animal } from '../../types';

interface AnimalCareencia {
  id: string;
  animal: string;
  medicamento: string;
  principioAtivo: string;
  dataAplicacao: string;
  dataTermino: string;
  diasRestantes: number;
  tipo: 'Abate' | 'Leite' | 'Ambos';
  periculosidade: 'Alta' | 'Média' | 'Baixa';
  isLot?: boolean;
  loteOriginal?: string;
}

const mockCareencias: AnimalCareencia[] = [
  { 
    id: '1', 
    animal: 'VAC-8820', 
    medicamento: 'Antibiótico Amoxicilina 15%', 
    principioAtivo: 'Amoxicilina',
    dataAplicacao: '2024-03-10', 
    dataTermino: '2024-03-25', 
    diasRestantes: 12,
    tipo: 'Abate',
    periculosidade: 'Alta'
  },
  { 
    id: '2', 
    animal: 'Lote Confinamento 04 (48 cab)', 
    medicamento: 'Vermífugo Ivermectina 1%', 
    principioAtivo: 'Ivermectina',
    dataAplicacao: '2024-03-01', 
    dataTermino: '2024-03-31', 
    diasRestantes: 18,
    tipo: 'Abate',
    periculosidade: 'Média'
  },
  { 
    id: '3', 
    animal: 'VAC-9905', 
    medicamento: 'Anti-inflamatório Dexametasona', 
    principioAtivo: 'Dexametasona',
    dataAplicacao: '2024-03-12', 
    dataTermino: '2024-03-17', 
    diasRestantes: 4,
    tipo: 'Ambos',
    periculosidade: 'Baixa'
  },
];

export const AlertasCareencia: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    animal: '',
    medicamento: '',
    periculosidade: 'Todos'
  });
  
  const stats = useMemo(() => {
    const total = mockCareencias.length;
    const criticos = mockCareencias.filter(c => c.periculosidade === 'Alta').length;
    const proximaSemana = mockCareencias.filter(c => c.diasRestantes <= 7).length;
    
    return { total, criticos, proximaSemana };
  }, []);

  const allCareencias = useMemo(() => {
    const individual: AnimalCareencia[] = mockCareencias.map(c => ({ ...c, isLot: false }));
    const lotRecords = mockRegistros.filter(r => r.loteId && new Date(r.careencia_fim) > new Date());
    
    const lotBased: AnimalCareencia[] = lotRecords.flatMap(r => {
      const animalsInLot = mockAnimals.filter((a: Animal) => a.lote === r.loteId);
      return animalsInLot.map((a: Animal) => ({
        id: `lot-${r.id}-${a.id}`,
        animal: a.brinco,
        medicamento: r.medicamentos[0]?.nome || 'Tratamento de Lote',
        principioAtivo: r.doenca_motivo,
        dataAplicacao: r.data,
        dataTermino: r.careencia_fim,
        diasRestantes: Math.ceil((new Date(r.careencia_fim).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        tipo: 'Abate' as const,
        periculosidade: 'Média' as const,
        isLot: true,
        loteOriginal: r.loteId
      }));
    });

    return [...individual, ...lotBased].filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = c.animal.toLowerCase().includes(searchLower) ||
             c.principioAtivo.toLowerCase().includes(searchLower) ||
             c.medicamento.toLowerCase().includes(searchLower) ||
             c.tipo.toLowerCase().includes(searchLower) ||
             c.periculosidade.toLowerCase().includes(searchLower) ||
             c.dataTermino.toLowerCase().includes(searchLower);

      const matchesColumnFilters = 
        (columnFilters.animal === '' || c.animal.toLowerCase().includes(columnFilters.animal.toLowerCase())) &&
        (columnFilters.medicamento === '' || c.medicamento.toLowerCase().includes(columnFilters.medicamento.toLowerCase())) &&
        (columnFilters.periculosidade === 'Todos' || c.periculosidade === columnFilters.periculosidade);

      return matchesSearch && matchesColumnFilters;
    });
  }, [searchTerm]);

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedCareencias,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: allCareencias, initialItemsPerPage: 10 });

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Alertas de Carência</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <button className="btn-premium-outline back-btn-std h-10 px-3" onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="icon-badge danger">
            <ShieldAlert size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Painel de Bloqueio & Carência</h1>
            <p className="description">Monitoramento de resíduos químicos e segurança para abate (Food Safety).</p>
          </div>
        </div>
        <div className="action-buttons">
          <div className="safety-badge">
            <ShieldAlert size={20} strokeWidth={3} />
            Protocolo Vigente
          </div>
        </div>
      </div>

      <div className="safety-stats-row">
        <div className="stat-box glass warning-indigo">
          <div className="stat-icon warning">
            <AlertTriangle size={36} strokeWidth={3} />
          </div>
          <div className="stat-data">
            <span className="label">Total sob Carência</span>
            <span className="value">{stats.total} registros</span>
          </div>
        </div>
        <div className="stat-box glass danger-indigo">
          <div className="stat-icon danger">
            <ShieldAlert size={36} strokeWidth={3} />
          </div>
          <div className="stat-data">
            <span className="label">Bloqueios Críticos</span>
            <span className="value">{stats.criticos} lotes</span>
          </div>
        </div>
        <div className="stat-box glass indigo">
          <div className="stat-icon indigo">
            <CheckCircle2 size={36} strokeWidth={3} />
          </div>
          <div className="stat-data">
            <span className="label">Liberações (7 dias)</span>
            <span className="value">{stats.proximaSemana} animais</span>
          </div>
        </div>
      </div>

      <div className="careencia-main-grid">
        <div className="list-section card glass">
          <TableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar animal ou princípio ativo..."
          >
            <button 
              className={`btn-premium-outline h-11 px-6 gap-2 ${isFiltersOpen ? 'filter-active' : ''}`}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter size={18} strokeWidth={3} />
              <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
            </button>
          </TableFilters>

          {isFiltersOpen && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 mt-4 rounded-xl border border-slate-200/60 shadow-sm">
              <ColumnFilters
                columns={[
                  { key: 'animal', type: 'text', placeholder: 'Filtrar animal...' },
                  { key: 'medicamento', type: 'text', placeholder: 'Filtrar medicamento...' },
                  { key: 'periculosidade', type: 'select', options: ['Alta', 'Média', 'Baixa'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={false}
              />
            </div>
          )}


            <div className="careencia-table">
              <div className="table-h">
                <span>Animal/Lote</span>
                <span>Medicamento / Ativo</span>
                <span>Status de Carência</span>
                <span>Liberação</span>
              </div>
              {paginatedCareencias.map((c) => (
                <div key={c.id} className="table-r">
                <div className="animal-col">
                  <strong>{c.animal}</strong>
                  {('isLot' in c && c.isLot) && <span className="lot-origin-tag">Lote: {c.loteOriginal}</span>}
                  <span className={`type-tag ${c.tipo.toLowerCase()}`}>{c.tipo}</span>
                </div>
                <div className="med-col">
                  <strong>{c.medicamento}</strong>
                  <span>{c.principioAtivo}</span>
                </div>
                <div className="status-col">
                  <div className="countdown-box">
                    <span className="days">{c.diasRestantes}</span>
                    <span className="unit">dias restantes</span>
                  </div>
                  <div className="progress-bar">
                    <div className="fill" style={{ width: `${Math.max(10, 100 - (c.diasRestantes * 3))}%` }}></div>
                  </div>
                </div>
                <div className="date-col">
                  <div className="date-box">
                    <Calendar size={14} />
                    {new Date(c.dataTermino).toLocaleDateString('pt-BR')}
                  </div>
                  <span className={`risk-tag ${c.periculosidade.toLowerCase()}`}>
                    Risco {c.periculosidade}
                  </span>
                </div>
              </div>
            ))}
          </div>

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
              label="registros"
            />
        </div>

        <div className="details-panel">
          <div className="lock-card card glass danger">
             <div className="lock-icon">
                <AlertTriangle size={48} strokeWidth={3} />
             </div>
             <h3>ALERTA DE SEGURANÇA</h3>
             <p>Existem animais com carência ativa. O sistema bloqueou automaticamente a geração de Guias de Trânsito Animal (GTA) para abate destes lotes.</p>
             <button className="btn-premium-outline w-full h-11 gap-2 mt-4 font-bold">
                <span>Ver Normativas MAPA</span>
                <ExternalLink size={14} strokeWidth={3} />
             </button>
          </div>

          <div className="info-section card glass">
             <h4>Resumo por Princípio Ativo</h4>
             <div className="active-princ-list">
                <div className="princ-item">
                   <div className="p-info">
                      <span className="p-name">Amoxicilina</span>
                      <span className="p-count">01 Animal</span>
                   </div>
                   <div className="p-bar"><div className="p-fill" style={{width: '30%'}}></div></div>
                </div>
                <div className="princ-item">
                   <div className="p-info">
                      <span className="p-name">Ivermectina</span>
                      <span className="p-count">48 Animais</span>
                   </div>
                   <div className="p-bar"><div className="p-fill" style={{width: '85%'}}></div></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
