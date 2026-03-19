import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ArrowLeft, 
  Download, 
  Filter, 
  Calendar, 
  DollarSign, 
  Scale, 
  PieChart,
  ArrowUpRight,
  Beef,
  Activity,
  ChevronRight,
  Search
} from 'lucide-react';
import { Animal, Dieta } from '../../types';
import { mockAnimals, mockDietas } from '../../data/mockData';
import './RelatoriosRebanho.css';

export const RelatoriosRebanho: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [reportType, setReportType] = useState<'individual' | 'lote'>('individual');
  const [selectedLote, setSelectedLote] = useState<string>('Lote 02');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(mockAnimals[0]?.id || '');
  const [animalSearch, setAnimalSearch] = useState('');

  const filteredAnimals = useMemo(() => {
    return mockAnimals.filter(a => 
      a.brinco.toLowerCase().includes(animalSearch.toLowerCase()) ||
      a.raca.toLowerCase().includes(animalSearch.toLowerCase())
    );
  }, [animalSearch]);

  const selectedAnimal = useMemo(() => 
    mockAnimals.find(a => a.id === selectedAnimalId) || mockAnimals[0],
[selectedAnimalId]);

  const lotMetrics = useMemo(() => {
    const animals = mockAnimals.filter(a => a.lote.includes(selectedLote));
    if (animals.length === 0) return null;

    const totalWeight = animals.reduce((acc, a) => acc + a.peso, 0);
    const avgWeight = totalWeight / animals.length;
    
    // Calculate total costs
    const totalInvested = animals.reduce((acc, a) => {
      const basicCosts = a.custoAquisicao + a.custoNutricao + a.custoSanidade + a.custoReproducao + a.custoConfinamento + a.custoOperacional;
      return acc + basicCosts;
    }, 0);

    return {
      count: animals.length,
      totalWeight,
      avgWeight,
      totalInvested,
      avgInvested: totalInvested / animals.length
    };
  }, [selectedLote]);

  return (
    <div className="page-container fade-in">
       <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Relatórios do Rebanho</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <button className="btn-premium-outline back-btn h-10 px-3" onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="icon-badge indigo">
            <BarChart3 size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Inteligência de Rebanho</h1>
            <p className="description">Relatórios avançados de performance financeira e zootécnica.</p>
          </div>
        </div>
        <div className="header-actions">
           <div className="report-tabs">
            <button 
              className={reportType === 'individual' ? 'active' : ''} 
              onClick={() => setReportType('individual')}
            >
              <Users size={18} strokeWidth={3} />
              Por Animal
            </button>
            <button 
              className={reportType === 'lote' ? 'active' : ''} 
              onClick={() => setReportType('lote')}
            >
              <BarChart3 size={18} strokeWidth={3} />
              Por Lote
            </button>
          </div>
          <button className="btn-premium-outline h-11 px-6 gap-2">
             <Calendar size={18} strokeWidth={3} />
             Mensal
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2">
             <Download size={18} strokeWidth={3} />
             PDF
          </button>
        </div>
      </div>

      <div className="reports-main-grid">
        <aside className="reports-sidebar card glass">
          <div className="sidebar-header">
            <Filter size={18} strokeWidth={3} />
            <h3>Filtros de Análise</h3>
          </div>
          
          {reportType === 'individual' ? (
            <div className="filter-group">
              <label>Selecionar Animal (Brinco)</label>
              <div className="px-3 mb-3">
                <div className="input-with-icon mini">
                  <input 
                    type="text" 
                    placeholder="Buscar brinco..." 
                    className="w-full p-2 text-sm bg-slate-50 border border-slate-100 rounded-lg"
                    value={animalSearch}
                    onChange={(e) => setAnimalSearch(e.target.value)}
                  />
                  <Search size={14} className="field-icon opacity-40" />
                </div>
              </div>
              <div className="animal-selector-list">
                {filteredAnimals.map(a => (
                  <button 
                    key={a.id} 
                    className={`animal-item-btn ${selectedAnimalId === a.id ? 'active' : ''}`}
                    onClick={() => setSelectedAnimalId(a.id)}
                  >
                    <span className="brinco-tag">#{a.brinco}</span>
                    <span className="animal-info">{a.raca} • {a.peso}kg</span>
                    <ChevronRight size={14} strokeWidth={3} className="chevron" />
                  </button>
                ))}
                {filteredAnimals.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-4">Nenhum animal encontrado</p>
                )}
              </div>
            </div>
          ) : (
            <div className="filter-group">
              <label>Selecionar Lote</label>
              <select 
                value={selectedLote} 
                onChange={(e) => setSelectedLote(e.target.value)}
                className="premium-select"
              >
                <option value="Lote 01">Lote 01 - Recria Nelore</option>
                <option value="Lote 02">Lote 02 - Engorda Machos</option>
                <option value="Exportação">Lote Exportação - Angus</option>
              </select>
            </div>
          )}

          <div className="sidebar-footer-info">
             <Activity size={16} strokeWidth={3} />
             <p>Dados atualizados em tempo real com base nos lançamentos de Nutrição e Sanidade.</p>
          </div>
        </aside>

        <main className="reports-content">
          {reportType === 'individual' && selectedAnimal ? (
            <div className="individual-report animate-fade-in">
              <div className="report-summary-cards">
                <div className="report-card glass primary">
                  <span className="label">Investimento Total</span>
                  <div className="value-group">
                    <span className="currency">R$</span>
                    <span className="value">
                      {(selectedAnimal.custoAquisicao + selectedAnimal.custoNutricao + selectedAnimal.custoSanidade + selectedAnimal.custoReproducao + selectedAnimal.custoConfinamento + selectedAnimal.custoOperacional).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="trend positive"><ArrowUpRight size={14} strokeWidth={3} /> +R$ 120,50 este mês</span>
                </div>
                <div className="report-card glass secondary">
                  <span className="label">Valor de Mercado Est.</span>
                  <div className="value-group">
                    <span className="currency">R$</span>
                    <span className="value">{(selectedAnimal.peso / 30 * 280).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="subtext">Valor arroba: R$ 280,00</span>
                </div>
                <div className="report-card glass info">
                  <span className="label">Projeção de Lucro (ROI)</span>
                  <div className="value-group">
                    <span className="value">
                      {Math.round(((selectedAnimal.peso / 30 * 280) / (selectedAnimal.custoAquisicao + selectedAnimal.custoNutricao + selectedAnimal.custoSanidade + selectedAnimal.custoReproducao + selectedAnimal.custoConfinamento + selectedAnimal.custoOperacional) - 1) * 100)}%
                    </span>
                  </div>
                  <span className="subtext">Margem líquida estimada</span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-chart-box card glass">
                  <div className="chart-header">
                    <PieChart size={20} strokeWidth={3} />
                    <h3>Composição de Custos</h3>
                  </div>
                  <div className="mock-cost-chart">
                     {/* Simulated Donut Chart */}
                     <div className="donut-viz">
                        <div className="segment aquisicao" style={{'--v': 45} as any}></div>
                        <div className="segment nutricao" style={{'--v': 35} as any}></div>
                        <div className="segment sanidade" style={{'--v': 10} as any}></div>
                        <div className="segment outros" style={{'--v': 10} as any}></div>
                        <div className="inner-label">
                           <strong>100%</strong>
                           <span>Auditado</span>
                        </div>
                     </div>
                     <div className="chart-legend-grid">
                        <div className="legend-item"><span className="dot aq"></span> Aquisição (45%)</div>
                        <div className="legend-item"><span className="dot nu"></span> Nutrição (35%)</div>
                        <div className="legend-item"><span className="dot sa"></span> Sanidade (10%)</div>
                        <div className="legend-item"><span className="dot ou"></span> Outros (10%)</div>
                     </div>
                  </div>
                </div>

                <div className="detail-table-box card glass">
                  <div className="chart-header">
                    <TrendingUp size={20} strokeWidth={3} />
                    <h3>Evolução de Peso & Custo</h3>
                  </div>
                  <div className="lifecycle-timeline">
                     <div className="timeline-item">
                        <div className="time-marker">Entrada</div>
                        <div className="time-content">
                           <strong>{selectedAnimal.peso - 120} kg</strong>
                           <span>R$ {selectedAnimal.custoAquisicao.toFixed(2)}</span>
                        </div>
                     </div>
                     <div className="timeline-item active">
                        <div className="time-marker">Atual</div>
                        <div className="time-content">
                           <strong>{selectedAnimal.peso} kg</strong>
                           <span>R$ {(selectedAnimal.custoAquisicao + selectedAnimal.custoNutricao).toFixed(2)}</span>
                        </div>
                     </div>
                     <div className="timeline-item projection">
                        <div className="time-marker">Abate (Est.)</div>
                        <div className="time-content">
                           <strong>580 kg</strong>
                           <span>R$ {(selectedAnimal.custoAquisicao + selectedAnimal.custoNutricao + 450).toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lot-report animate-fade-in">
              <div className="report-summary-cards">
                <div className="report-card glass primary">
                  <span className="label">Total Investido no Lote</span>
                  <div className="value-group">
                    <span className="currency">R$</span>
                    <span className="value">{lotMetrics?.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="subtext">{lotMetrics?.count} cabeças ativas</span>
                </div>
                <div className="report-card glass info">
                  <span className="label">Peso Médio Atual</span>
                  <div className="value-group">
                    <span className="value">{lotMetrics?.avgWeight.toFixed(1)}</span>
                    <span className="unit">kg</span>
                  </div>
                  <span className="subtext">Estabilidade de rebanho</span>
                </div>
                <div className="report-card glass secondary">
                  <span className="label">Custo Médio/Cabeça</span>
                  <div className="value-group">
                    <span className="currency">R$</span>
                    <span className="value">{lotMetrics?.avgInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="subtext">Benchmark: R$ 2.450,00</span>
                </div>
              </div>

              <div className="lot-analytics-grid">
                 <div className="analytic-card card glass">
                    <div className="chart-header">
                       <Beef size={20} strokeWidth={3} />
                       <h3>Distribuição de Pesos no Lote</h3>
                    </div>
                    <div className="weight-distribution-viz">
                       {/* Mock histogram/bars */}
                       {[45, 65, 100, 85, 40].map((val, idx) => (
                          <div key={idx} className="dist-bar-group">
                             <div className="dist-bar" style={{height: `${val}%`}}>
                                <span className="bar-val">{val}</span>
                             </div>
                             <span className="bar-label">{350 + (idx * 50)}kg</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="analytic-card card glass">
                    <div className="chart-header">
                       <Scale size={20} strokeWidth={3} />
                       <h3>Eficiência Zootécnica</h3>
                    </div>
                    <div className="efficiency-metrics">
                       <div className="efficiency-stat">
                          <div className="stat-info">
                             <span className="stat-label">GMD Médio</span>
                             <span className="stat-value">1.450 kg/dia</span>
                          </div>
                          <div className="stat-progress"><div className="fill" style={{width: '85%'}}></div></div>
                       </div>
                       <div className="efficiency-stat">
                          <div className="stat-info">
                             <span className="stat-label">Conversão Alim.</span>
                             <span className="stat-value">6.2 : 1</span>
                          </div>
                          <div className="stat-progress"><div className="fill warning" style={{width: '65%'}}></div></div>
                       </div>
                       <div className="efficiency-stat">
                          <div className="stat-info">
                             <span className="stat-label">Custo @ Produzida</span>
                             <span className="stat-value">R$ 142,50</span>
                          </div>
                          <div className="stat-progress"><div className="fill success" style={{width: '92%'}}></div></div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

