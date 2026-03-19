import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  SearchIcon,
  ArrowUpRight, 
  TrendingUp, 
  Activity, 
  Scale, 
  ChevronRight,
  Download,
  BarChart3,
  History as HistoryIcon,
  ArrowLeft,
  User,
  Clock,
  Filter
} from 'lucide-react';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import './HistoricoPesagem.css';

interface HistoricoAnimal {
  brinco: string;
  lote: string;
  evolucao: {
    data: string;
    peso: number;
    gmd: number;
  }[];
}

const mockHistorico: HistoricoAnimal[] = [
  {
    brinco: '8922',
    lote: 'Lote 01 - Recria',
    evolucao: [
      { data: '2023-10-15', peso: 210, gmd: 0 },
      { data: '2023-11-20', peso: 245, gmd: 1.0 },
      { data: '2023-12-28', peso: 280, gmd: 0.92 },
      { data: '2024-02-05', peso: 310, gmd: 0.77 },
      { data: '2024-03-10', peso: 345.5, gmd: 1.18 },
    ]
  },
  {
    brinco: '4451',
    lote: 'Lote 01 - Recria',
    evolucao: [
      { data: '2023-11-05', peso: 320, gmd: 0 },
      { data: '2024-01-12', peso: 355, gmd: 0.52 },
      { data: '2024-03-10', peso: 412, gmd: 0.89 },
    ]
  }
];

export const HistoricoPesagem: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<HistoricoAnimal | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterLote, setFilterLote] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    brinco: '',
    lote: 'Todos'
  });

  const filteredHistorico = mockHistorico.filter(h => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = h.brinco.toLowerCase().includes(searchLower) || 
                         h.lote.toLowerCase().includes(searchLower);
    
    // Check if any evolution data matches (date or weight)
    const matchesEvolution = h.evolucao.some(ev => 
      ev.data.toLowerCase().includes(searchLower) || 
      ev.peso.toString().includes(searchLower) ||
      ev.gmd.toString().includes(searchLower)
    );

    const matchesColumnFilters = 
      (columnFilters.brinco === '' || h.brinco.toLowerCase().includes(columnFilters.brinco.toLowerCase())) &&
      (columnFilters.lote === 'Todos' || h.lote === columnFilters.lote);

    return (matchesSearch || matchesEvolution) && matchesColumnFilters;
  });

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <Link to="/pecuaria/pesagens">Pesagem</Link>
        <ChevronRight size={14} />
        <span>Histórico de Performance</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="icon-badge indigo">
            <HistoryIcon size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Histórico de Performance</h1>
            <p className="description">Análise retrospectiva de ganho de peso e métricas de GMD acumulado</p>
          </div>
        </div>
      </div>

      {!selectedAnimal ? (
        <div className="history-search-view">
          <div className="search-dashboard card glass">
            <TableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Pesquisar por Brinco para ver evolução detalhada..."
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
                    { key: 'brinco', type: 'text', placeholder: 'Filtrar brinco...' },
                    { key: 'lote', type: 'select', options: Array.from(new Set(mockHistorico.map(h => h.lote))) }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={false}
                />
              </div>
            )}

          </div>

          <div className="history-results-grid">
            {filteredHistorico.map((animal) => {
              const ultima = animal.evolucao[animal.evolucao.length - 1];
              const primeira = animal.evolucao[0];
              const totalGanho = (ultima.peso - primeira.peso).toFixed(1);
              const gmdMedio = (animal.evolucao.reduce((acc, cur) => acc + cur.gmd, 0) / (animal.evolucao.length - 1 || 1)).toFixed(2);

              return (
                <div key={animal.brinco} className="animal-summary-card card glass animate-slide-up" onClick={() => setSelectedAnimal(animal)}>
                  <div className="card-top">
                    <div className="animal-identity">
                      <span className="brinco-badge">{animal.brinco}</span>
                      <span className="lote-name">{animal.lote}</span>
                    </div>
                    <div className="performance-chip">
                      <TrendingUp size={14} strokeWidth={3} />
                      {gmdMedio} kg/dia
                    </div>
                  </div>

                  <div className="mini-chart">
                    {/* Visual representation of growth */}
                    {animal.evolucao.map((step, idx) => (
                      <div 
                        key={idx} 
                        className="chart-bar" 
                        style={{ height: `${(step.peso / 500) * 100}%` }}
                        title={`${step.data}: ${step.peso}kg`}
                      />
                    ))}
                  </div>

                  <div className="card-stats">
                    <div className="stat">
                      <label>Ganho Total</label>
                      <strong>+{totalGanho} kg</strong>
                    </div>
                    <div className="stat">
                      <label>Pesagens</label>
                      <strong>{animal.evolucao.length} sessões</strong>
                    </div>
                  </div>

                  <div className="card-action">
                    <span>Ver Detalhes</span>
                    <ChevronRight size={16} strokeWidth={3} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="detailed-animal-view animate-slide-up">
          <div className="animal-profile-header card glass">
            <div className="profile-info">
              <div className="profile-main">
                <div className="profile-icon">
                  <Activity size={32} strokeWidth={3} />
                </div>
                <div>
                  <h2>Brinco {selectedAnimal.brinco}</h2>
                  <p>{selectedAnimal.lote} • Macho Nelore</p>
                </div>
              </div>
              <button className="btn-premium-outline h-10 px-4" onClick={() => setSelectedAnimal(null)}>
                Fechar Detalhes
              </button>
            </div>

            <div className="stats-row">
              <div className="profile-stat">
                <Scale size={18} strokeWidth={3} />
                <div>
                  <label>Peso Inicial</label>
                  <span>{selectedAnimal.evolucao[0].peso} kg</span>
                </div>
              </div>
              <div className="profile-stat current">
                <TrendingUp size={18} strokeWidth={3} />
                <div>
                  <label>Peso Atual</label>
                  <span>{selectedAnimal.evolucao[selectedAnimal.evolucao.length - 1].peso} kg</span>
                </div>
              </div>
              <div className="profile-stat performance">
                <Activity size={18} strokeWidth={3} />
                <div>
                  <label>GMD Acumulado</label>
                  <span>{(selectedAnimal.evolucao.reduce((acc, cur) => acc + cur.gmd, 0) / (selectedAnimal.evolucao.length - 1 || 1)).toFixed(2)} kg/d</span>
                </div>
              </div>
            </div>
          </div>

          <div className="history-details-grid">
            <div className="timeline-section card glass">
              <div className="section-title">
                <Clock size={20} strokeWidth={3} />
                <h3>Linha do Tempo de Pesagens</h3>
              </div>
              <div className="timeline-container">
                {selectedAnimal.evolucao.slice().reverse().map((ev, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-connector"></div>
                    <div className="timeline-point"></div>
                    <div className="timeline-content">
                      <div className="timeline-date">{new Date(ev.data).toLocaleDateString('pt-BR')}</div>
                      <div className="timeline-data">
                        <div className="weight-data flex items-center gap-2">
                          <strong>{ev.peso} kg</strong>
                          {idx < selectedAnimal.evolucao.length - 1 && (
                             <span className="weight-diff bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-xs font-bold">
                               +{ (ev.peso - selectedAnimal.evolucao[selectedAnimal.evolucao.length - 2 - idx].peso).toFixed(1) } kg
                             </span>
                          )}
                        </div>
                        {ev.gmd > 0 && (
                          <div className="gmd-data">
                            GMD: <strong>{ev.gmd} kg/dia</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="charts-aside">
              <div className="chart-card card glass">
                <div className="section-title">
                  <BarChart3 size={20} strokeWidth={3} />
                  <h3>Performance GMD</h3>
                </div>
                <div className="svg-chart-container">
                    {/* Simple SVG Chart Representation */}
                    <svg viewBox="0 0 400 200" className="performance-chart">
                      <path 
                        d={`M 50 ${200 - (selectedAnimal.evolucao[0].gmd * 100)} ` + 
                           selectedAnimal.evolucao.map((ev, i) => `L ${50 + i * 80} ${200 - (ev.gmd * 100)}`).join(' ')}
                        fill="none"
                        stroke="var(--primary-indigo)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {selectedAnimal.evolucao.map((ev, i) => (
                        <circle key={i} cx={50 + i * 80} cy={200 - (ev.gmd * 100)} r="5" fill="var(--primary-indigo)" />
                      ))}
                    </svg>
                    <div className="chart-labels">
                       {selectedAnimal.evolucao.map((ev, i) => (
                         <span key={i} style={{ left: `${(i / (selectedAnimal.evolucao.length - 1)) * 100}%` }}>
                           {ev.data.split('-')[1]}/{ev.data.split('-')[0].slice(2)}
                         </span>
                       ))}
                    </div>
                </div>
              </div>

              <div className="action-card card glass indigo">
                <h4>Relatório de Desempenho</h4>
                <p>Gere um PDF detalhado da performance deste animal para exportação.</p>
                <button className="btn-premium-solid indigo w-full py-3">
                  <Download size={18} strokeWidth={3} />
                  Baixar Relatório
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

